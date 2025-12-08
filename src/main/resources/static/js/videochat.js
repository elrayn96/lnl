const strangerVideo = document.querySelector('.stranger-video');
const myVideo = document.querySelector('.my-video');
const nextBtn = document.getElementById('next-btn');
const endBtn = document.getElementById('end-btn');
const adDialog = document.getElementById('ad-dialog');
const adTimer = document.getElementById('ad-timer');

let localStream = null;
let remoteStream = null;
let peerConnection = null;
let stompClient = null;
let isConnecting = false;

function showLoading(container, text = '') {
    container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#777;font-size:1rem;">
            <div style="width:32px;height:32px;border:3px solid rgba(255,255,255,0.3);border-top:3px solid #00BCD4;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:8px;"></div>
            <span>${text}</span>
        </div>
        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    `;
}

async function initCamera() {
    try {
        showLoading(myVideo, 'Iniciando câmera...');
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const video = document.createElement('video');
        video.srcObject = localStream;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        myVideo.innerHTML = '';
        myVideo.appendChild(video);
    } catch (err) {
        myVideo.innerHTML = '<div style="color:#f44336;text-align:center;">Erro: câmera negada</div>';
        console.error(err);
    }
}

function connectSignaling() {
    if (isConnecting) return;
    isConnecting = true;
    showLoading(strangerVideo, 'Procurando usuário...');

    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
        stompClient.send("/app/video.join", {}, "");
        stompClient.subscribe(`/topic/match/${stompClient.sessionId || ''}`, (msg) => {
            const payload = JSON.parse(msg.body);
            handleMatch(payload);
        });
        stompClient.subscribe(`/topic/signal/${stompClient.sessionId || ''}`, (msg) => {
            const signal = JSON.parse(msg.body);
            handleSignal(signal);
        });
        stompClient.subscribe(`/topic/disconnect/${stompClient.sessionId || ''}`, () => {
            showLoading(strangerVideo, 'Usuário saiu');
            hangUp();
        });
    }, () => {
        showLoading(strangerVideo, 'Erro de conexão');
        isConnecting = false;
    });
}

// ✅ CORREÇÃO PRINCIPAL: tracks adicionadas ANTES de createOffer
async function handleMatch({ peer, initiator }) {
    showLoading(strangerVideo, initiator ? 'Conectando…' : 'Aguardando…');

    const pcConfig = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
            { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" }
        ]
    };

    peerConnection = new RTCPeerConnection(pcConfig);

    // ✅ 1. Adicionar tracks LOCAIS PRIMEIRO
    localStream.getTracks().forEach(track =>
        peerConnection.addTrack(track, localStream));

    // ✅ 2. Configurar handlers
    peerConnection.onicecandidate = e => {
        if (e.candidate) {
            stompClient.send("/app/video.signal", {}, JSON.stringify({
                type: "candidate",
                data: e.candidate.toJSON()
            }));
        }
    };

    peerConnection.ontrack = e => {
        remoteStream = e.streams[0];
        const video = document.createElement('video');
        video.srcObject = remoteStream;
        video.autoplay = true;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        strangerVideo.innerHTML = '';
        strangerVideo.appendChild(video);
        isConnecting = false;
    };

    // ✅ 3. Só agora criar offer/answer
    if (initiator) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        stompClient.send("/app/video.signal", {}, JSON.stringify({
            type: "offer",
            data: peerConnection.localDescription.toJSON()
        }));
    }
}

async function handleSignal(signal) {
    if (!peerConnection) return;

    if (signal.type === "offer") {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        stompClient.send("/app/video.signal", {}, JSON.stringify({
            type: "answer",
            data: peerConnection.localDescription.toJSON()
        }));
    } else if (signal.type === "answer") {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.data));
    } else if (signal.type === "candidate") {
        await peerConnection.addIceCandidate(signal.data);
    }
}

function hangUp() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (remoteStream) remoteStream.getTracks().forEach(t => t.stop());
    isConnecting = false;
}

nextBtn.addEventListener('click', () => {
    hangUp();
    adDialog.style.display = 'flex';
    let count = 3;
    adTimer.textContent = count;
    const iv = setInterval(() => {
        count--;
        if (count <= 0) {
            clearInterval(iv);
            adDialog.style.display = 'none';
            connectSignaling();
        } else {
            adTimer.textContent = count;
        }
    }, 1000);
});

endBtn.addEventListener('click', () => {
    hangUp();
    if (stompClient) stompClient.disconnect();
    window.location.href = '/';
});

window.onload = async () => {
    await initCamera();
    if (localStream) connectSignaling();
};