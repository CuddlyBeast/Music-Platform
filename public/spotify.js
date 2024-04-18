let deviceId = null
let timer = null; 
let startTime = null;

    window.onSpotifyWebPlaybackSDKReady = () => {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')

        if (!accessToken || !refreshToken) {
            try {
                window.location.href = 'http://localhost:3000/chill/auth';
            } catch (error) {
                console.error('Error redirecting for authorization:', error);
            }
        }

        // Initialize the Spotify player
        const player = new Spotify.Player({
            name: 'My Spotify Web Playback SDK Player',
            getOAuthToken: cb => { cb(accessToken); }
        });

        // Connect to the Spotify player
        player.connect().then(success => {
            if (success) {
                console.log('The Web Playback SDK has been connected to Spotify!');
            } else {
                console.error('Failed to connect to Spotify using the Web Playback SDK.');
            }
        });

        // Playback Events
        player.addListener('ready', async ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            deviceId = device_id;
        });

        player.addListener('player_state_changed', state => {
            console.log('Player state changed:', state);
                const totalTimeElement = document.querySelector('.total-time'); 
                const duration_ms = state.duration;
    
                totalTimeElement.textContent = formatDuration(duration_ms);
    
                clearInterval(timer);
                if (state.paused) {

                    if (startTime) {
                        resetTimer()
                        clearInterval(timer); 
                    }
                } else {
                    startTime = Date.now() - state.position;
                    timer = updateTimer(duration_ms);
                }
        });

        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
            deviceId = null; 
        });
    };


function formatDuration(duration_ms) {
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = ((duration_ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}


window.startPlayback = async (trackUri) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
            try {
                window.location.href = 'http://localhost:3000/chill/auth';
            } catch (error) {
                console.error('Error redirecting for authorization:', error);
            }
        }
        if (!deviceId) {
            throw new Error('Device ID is not available');
        }

        const response = await fetch('http://localhost:3000/chill/playback/play', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ trackUri, deviceId })
        });

        if (!response.ok) {
            throw new Error('Failed to start playback');
        }

        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Error starting playback:', error);
    }
};

function updateTimer(duration) {
    const currentTimeElement = document.querySelector('.current-time'); 
    const progressCircle = document.querySelector('.progress-circle');

    const timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const currentSeconds = Math.floor(elapsedTime / 1000); 
        currentTimeElement.textContent = formatDuration(currentSeconds * 1000); 
        
        const percentage = (currentSeconds / (duration / 1000)) * 100;
        progressCircle.style.left = `calc(${percentage}% - 5px)`;

        if (currentSeconds >= duration / 1000) {
            clearInterval(timer);
        }
    }, 1000); 

    return timer;
}


function resetTimer() {
    const currentTimeElement = document.querySelector('.current-time'); 
    const progressCircle = document.querySelector('.progress-circle');
    
    currentTimeElement.textContent = '00:00';
    progressCircle.style.left = 'calc(0% - 5px)';
}