(async () => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const provider = isMobile ? 'Google_AdMob' : 'Google_Adsense';
    try {
        await fetch('/api/ad/impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adType: 'BANNER', adProvider: provider, clicked: false })
        });
    } catch (e) {
        console.warn("Falha ao registrar banner home");
    }
})();