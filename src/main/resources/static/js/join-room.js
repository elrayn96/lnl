const pasteBtn = document.getElementById('paste-btn');
const input = document.getElementById('room-link');
pasteBtn.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        const urlPattern = /^https?:\/\/[^\/]+\/room(\/join)?\/[a-f0-9-]+$/i;
        if (urlPattern.test(text)) {
            input.value = text;
            input.focus();
        } else {
            alert('Link inválido. Use:\nhttps://linkandlive.app/room/abc123');
        }
    } catch (err) {
        alert('Permissão negada para clipboard.');
    }
});

// Tracking de banner
(async () => {
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    const provider = isMobile ? 'Google_AdMob' : 'Google_Adsense';
    try {
        await fetch('/api/ad/impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adType: 'BANNER', adProvider: provider, clicked: false })
        });
    } catch (e) {
        console.warn("Falha ao registrar banner join-room");
    }
})();