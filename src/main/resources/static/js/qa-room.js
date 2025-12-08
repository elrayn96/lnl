// ========== 1. Inicializar usuário com backend ==========
async function initUser() {
    const response = await fetch('/room/api/user/init');
    if (!response.ok) throw new Error('Falha ao inicializar usuário');
    const user = await response.json();
    return user; // { uuid: "...", username: "..." }
}

// ========== 2. Escape seguro ==========
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ========== 3. Estado global ==========
let CLIENT_USER = null;
let ROOM_UUID = null;

// ========== 4. Inicialização principal ==========
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Extrair ROOM_UUID da URL
        const pathParts = window.location.pathname.split('/');
        ROOM_UUID = pathParts[pathParts.length - 1];
        var x = ROOM_UUID.indexOf(';');
        if (x !== -1) {
            ROOM_UUID = ROOM_UUID.substring(0, x);
        }

        // Inicializar usuário com backend
        CLIENT_USER = await initUser();
        console.log('Usuário inicializado:', CLIENT_USER);

        // Configurar WebSocket
        const socket = new SockJS('/ws');
        const stompClient = Stomp.over(socket);
        stompClient.connect({}, () => {
            stompClient.subscribe(`/topic/room/${ROOM_UUID}/messages`, (frame) => {
                const msg = JSON.parse(frame.body);
                const isMine = msg.authorUuid === CLIENT_USER.uuid;
                renderMessage(msg, isMine);
            });
        });

        // Configurar formulário
        document.getElementById('messageForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const text = document.getElementById('messageInput').value.trim();
            if (!text) return;

            const payload = {
                roomUuid: ROOM_UUID,
                authorUuid: CLIENT_USER.uuid,
                text: text,
                inReplyTo: document.getElementById('replyToMessageId')?.value || null
            };

            stompClient.send('/app/room.message', {}, JSON.stringify(payload));
            document.getElementById('messageInput').value = '';
            clearReply();
        });

        // Compartilhar
        document.getElementById('share-btn')?.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copiado!');
            } catch (err) {
                const ta = document.createElement('textarea');
                ta.value = window.location.href;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                alert('Link copiado (fallback).');
            }
        });

    } catch (err) {
        console.error('Erro na inicialização:', err);
        alert('Falha ao carregar a sala. Recarregue a página.');
    }
});

// ========== 5. Reply ==========
let currentReply = null;
function setReply(messageId, authorUuid, authorName, text, timestamp) {
    currentReply = { messageId, authorUuid, authorName, text, timestamp };
    document.getElementById('replyToMessageId').value = messageId;
    document.getElementById('reply-to-name').textContent = authorUuid === CLIENT_USER.uuid ? 'Você' : authorName;
    document.getElementById('reply-timestamp').textContent = timestamp;
    document.getElementById('reply-snippet').textContent = escapeHtml(text.substring(0, 50));
    document.getElementById('reply-preview').style.display = 'block';
}

function clearReply() {
    currentReply = null;
    if (document.getElementById('replyToMessageId')) {
        document.getElementById('replyToMessageId').value = '';
    }
    document.getElementById('reply-preview').style.display = 'none';
}

document.getElementById('reply-cancel')?.addEventListener('click', clearReply);

// ========== 6. Renderizar mensagem ==========
function renderMessage(data, isMine) {
    const messagesDiv = document.getElementById('messages');
    if (!messagesDiv) return;

    const li = document.createElement('div');
    const id = data.id || Date.now();
    const timestampFormatted = new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    li.className = `message ${isMine ? 'right' : 'left'}`;
    li.dataset.id = id;
    li.dataset.authorUuid = data.authorUuid;
    li.dataset.text = data.text;
    li.dataset.timestamp = timestampFormatted;
    li.dataset.authorName = data.authorName;

    const initials = data.authorName.substring(0, 2).toUpperCase();
    let bubbleContent = `<div class="message-bubble">${escapeHtml(data.text)}</div>`;

    if (data.inReplyTo) {
        const origName = data.originalAuthorName;
        const origText = data.originalMessageSnippet;
        const displayName = data.authorUuid === CLIENT_USER.uuid ? 'Você' : origName;
        bubbleContent = `
            <div class="reply-context">
                <strong>${displayName}</strong>: ${escapeHtml(origText.substring(0, 30))}...
            </div>
            <div class="message-bubble">${escapeHtml(data.text)}</div>
        `;
    }

    li.innerHTML = `
        <div class="avatar">${initials}</div>
        <div class="message-content-wrap">
            ${bubbleContent}
            <div class="reactions">
                <span class="reaction">👍 0</span>
                <span class="reaction">😂 0</span>
                <span class="reaction">⭐ 0</span>
            </div>
            <button class="reply-btn">Reply</button>
        </div>
    `;

    li.querySelector('.reply-btn').addEventListener('click', () => {
        setReply(id, data.authorUuid, data.authorName, data.text, timestampFormatted);
    });

    messagesDiv.appendChild(li);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ========== 7. Long Press (Mobile) ==========
let longPressTimer;
document.addEventListener('touchstart', (e) => {
    const msgEl = e.target.closest('.message');
    if (!msgEl) return;
    longPressTimer = setTimeout(() => {
        const msgId = msgEl.dataset.id;
        const authorUuid = msgEl.dataset.authorUuid;
        const authorName = msgEl.dataset.authorName;
        const text = msgEl.dataset.text;
        const timestamp = msgEl.dataset.timestamp;
        window.replyTarget = { msgId, authorUuid, authorName, text, timestamp };
        document.getElementById('action-sheet').style.display = 'flex';
    }, 500);
});

document.addEventListener('touchend', () => clearTimeout(longPressTimer));
document.addEventListener('touchcancel', () => clearTimeout(longPressTimer));

document.getElementById('action-reply')?.addEventListener('click', () => {
    const t = window.replyTarget;
    if (t) setReply(t.msgId, t.authorUuid, t.authorName, t.text, t.timestamp);
    document.getElementById('action-sheet').style.display = 'none';
});
document.getElementById('action-cancel')?.addEventListener('click', () => {
    document.getElementById('action-sheet').style.display = 'none';
});