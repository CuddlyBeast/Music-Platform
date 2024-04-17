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
    });

    player.addListener('player_state_changed', state => {
        console.log('Player state changed:', state);
        if (state.position && state.duration) {
            const currentTimeElement = document.querySelector('.current-time'); 
            const totalTimeElement = document.querySelector('.total-time'); 
            currentTimeElement.textContent = formatDuration(state.position);
            totalTimeElement.textContent = formatDuration(state.duration);
        }
    });

    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
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

        const response = await fetch('http://localhost:3000/chill/playback/play', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ trackUri, accessToken })
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