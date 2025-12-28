const strangerVideo = document.querySelector('.stranger-video');
const myVideo = document.querySelector('.my-video');
const nextBtn = document.getElementById('next-btn');
const endBtn = document.getElementById('end-btn');
const adDialog = document.getElementById('ad-dialog');
const adTimer = document.getElementById('ad-timer');

let localStream = null;
let peerConnection = null;
let stompClient = null;
let mySessionId = null;
let peerId = null;
let isInitiator = false;

// Buffer para candidatos ICE (resolves Problema 2)
let iceCandidatesBuffer = [];
let remoteDescriptionSet = false;

// Evita múltiplas conexões (resolves Problema 1 e 4)
let isAlreadyPaired = false;

function showLoading(el, msg) {
    el.innerHTML = `<div style="color:#777;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">${msg}</div>`;
}

async function startCamera() {
    if (localStream) return;
    try {
        showLoading(myVideo, 'Acessando câmera...');
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const v = document.createElement('video');
        v.srcObject = localStream;
        v.autoplay = true;
        v.muted = true;
        v.playsInline = true;
        v.style.width = '100%';
        v.style.height = '100%';
        v.style.objectFit = 'cover';
        myVideo.innerHTML = '';
        myVideo.appendChild(v);
    } catch (e) {
        myVideo.innerHTML = '<div style="color:#f44336;text-align:center;">Erro: câmera negada</div>';
        console.error("Erro na câmera:", e);
    }
}

function connectSignaling() {
    showLoading(strangerVideo, 'Procurando usuário...');
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, () => {
        stompClient.subscribe('/topic/welcome-ack', (msg) => {
            // ✅ Só processa se ainda não tem ID
            if (mySessionId) return;
            mySessionId = msg.body;
            console.log("Meu ID:", mySessionId);

            stompClient.subscribe(`/topic/pair/${mySessionId}`, (p) => {
                if (isAlreadyPaired) return;
                isAlreadyPaired = true;

                const data = JSON.parse(p.body);
                peerId = data.peer;
                isInitiator = data.initiator;
                startWebRTC();
            });

            stompClient.subscribe(`/topic/signal/${mySessionId}`, (s) => {
                const signal = JSON.parse(s.body);
                if (signal.type === "peerLeft") {
                    handlePeerLeft();
                } else {
                    handleSignal(signal);
                }
            });

            stompClient.send("/app/video.join", {}, "");
        });

        stompClient.send("/app/get-session-id", {}, "");
    });
}

function startWebRTC() {
    showLoading(strangerVideo, isInitiator ? 'Conectando...' : 'Aguardando...');

    peerConnection = new RTCPeerConnection({
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            {
                urls: "turn:turn.ln.l.metered.live:80",
                username: "lnl.metered.live",
                credential: "PtjyCZeGO5cGSULwtXCw1qXx6-X-jch2pBf9oS-6L4k59vJi"
            }
        ]
    });

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // ✅ Anexa ao DOM ANTES de play() (resolves Problema 3)
    peerConnection.ontrack = (e) => {
        const v = document.createElement('video');
        v.srcObject = e.streams[0];
        v.autoplay = true;
        v.playsInline = true;
        v.style.width = '100%';
        v.style.height = '100%';
        v.style.objectFit = 'cover';

        strangerVideo.innerHTML = ''; // Limpa primeiro
        strangerVideo.appendChild(v); // Depois anexa

        v.play().catch(err => console.warn("Autoplay bloqueado:", err));
    };

    peerConnection.onicecandidate = (e) => {
        if (e.candidate) {
            stompClient.send("/app/video.signal", {}, JSON.stringify({
                type: "candidate",
                data: e.candidate.toJSON()
            }));
        }
    };

    if (isInitiator) {
        peerConnection.createOffer()
            .then(offer => peerConnection.setLocalDescription(offer))
            .then(() => {
                stompClient.send("/app/video.signal", {}, JSON.stringify({
                    type: "offer",
                    data: peerConnection.localDescription.toJSON()
                }));
            });
    }
}

// ✅ Buffer de ICE (resolves Problema 2)
function handleSignal(signal) {
    if (!peerConnection) return;

    if (signal.type === "offer") {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data))
            .then(() => {
                remoteDescriptionSet = true;
                processBufferedIceCandidates();
                return peerConnection.createAnswer();
            })
            .then(answer => peerConnection.setLocalDescription(answer))
            .then(() => {
                stompClient.send("/app/video.signal", {}, JSON.stringify({
                    type: "answer",
                    data: peerConnection.localDescription.toJSON()
                }));
            });
    } else if (signal.type === "answer") {
        // ✅ Verifica estado antes de setar (resolves Problema 4)
        if (peerConnection.signalingState === 'stable') {
            console.warn("Ignorando answer duplicado");
            return;
        }
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data))
            .then(() => {
                remoteDescriptionSet = true;
                processBufferedIceCandidates();
            });
    } else if (signal.type === "candidate") {
        if (remoteDescriptionSet) {
            peerConnection.addIceCandidate(new RTCIceCandidate(signal.data));
        } else {
            iceCandidatesBuffer.push(signal.data);
        }
    }
}

function processBufferedIceCandidates() {
    iceCandidatesBuffer.forEach(candidate => {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => {});
    });
    iceCandidatesBuffer = [];
}

function handlePeerLeft() {
    hangUp();
    showLoading(strangerVideo, 'O estranho saiu. Clique em NEXT.');
}

function hangUp() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    // ✅ Reseta tudo
    mySessionId = null;
    peerId = null;
    isInitiator = false;
    isAlreadyPaired = false;
    iceCandidatesBuffer = [];
    remoteDescriptionSet = false;
    strangerVideo.innerHTML = '';
}

nextBtn.onclick = () => {
    hangUp();
    if (stompClient) {
        stompClient.disconnect(); // ✅ Fecha conexão antiga
        stompClient = null;
    }

    adDialog.style.display = 'flex';
    let c = 3;
    adTimer.textContent = c;
    const iv = setInterval(() => {
        c--;
        adTimer.textContent = c;
        if (c <= 0) {
            clearInterval(iv);
            adDialog.style.display = 'none';
            connectSignaling(); // ✅ Nova conexão limpa
        }
    }, 1000);
};

endBtn.onclick = () => {
    hangUp();
    if (stompClient) stompClient.disconnect();
    window.location.href = '/';
};

window.onload = async () => {
    await startCamera();
    connectSignaling();
};