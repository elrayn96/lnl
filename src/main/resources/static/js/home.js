if (!/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // Desktop: log sidebar ad
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
}