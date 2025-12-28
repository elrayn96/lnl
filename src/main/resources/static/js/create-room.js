function setDuration(value) {
    document.querySelectorAll('.toggle-group')[0].querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('duration-input').value = value;
}
function setMode(value) {
    document.querySelectorAll('.toggle-group')[1].querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('mode-input').value = value;
}

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
        console.warn("Falha ao registrar banner create-room");
    }
})();