// Create room functions
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



// Ad tracking for sidebar (desktop only)
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