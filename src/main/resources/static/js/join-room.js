const pasteBtn = document.getElementById('paste-btn');
const input = document.getElementById('room-link');

// Paste from clipboard on button click
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


// Log banner ad impression

fetch('/room/api/user/init-video')
    .then(res => res.json())
    .then(data => {
        fetch('/api/ad/impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                adType: "BANNER",
                adProvider: "Google_Adsense",
                clicked: false,
                sessionUUID: data.userId
            })
        });
    });