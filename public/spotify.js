let deviceId = null
let timer = null; 
let startTime = null;
let lastPercentage = 0;

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
                    timer = updateTimer(duration_ms, false);
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
            const responseData = await response.json();
            if (responseData.error && responseData.error.status === 502) {
                console.error('Failed to start playback:', responseData.error.message);
                alert('Spotify Server Error');
            } else {
                throw new Error('Failed to start playback');
            }
        }

        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Error starting playback:', error);
    }
};

function updateTimer(duration, paused) {
    const currentTimeElement = document.querySelector('.current-time'); 
    const progressCircle = document.querySelector('.progress-circle');

    const timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const currentSeconds = Math.floor(elapsedTime / 1000); 
        currentTimeElement.textContent = formatDuration(currentSeconds * 1000); 
        
        let percentage;

        if (paused) {
            percentage = lastPercentage;
        } else {
            percentage = (elapsedTime / duration) * 100;
            lastPercentage = percentage; 
        }

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

window.pausePlayback = async () => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
            throw new Error('Access token or refresh token not available');
        }

        const response = await fetch('http://localhost:3000/chill/playback/pause', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to pause playback');
        }

        const data = await response.json();
        console.log(data.message);
        const state = await getCurrentState();
        if (state && !state.paused) {
            const elapsedTime = Date.now() - startTime;
            timer = updateTimer(elapsedTime, true);
        }
    } catch (error) {
        console.error('Error pausing playback:', error);
    }
}

window.resumePlayback = async () => {
    try {
        const response = await fetch('http://localhost:3000/chill/playback/resume', {
            method: 'POST'
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data.message);
        } else {
            throw new Error('Failed to resume playback');
        }
    } catch (error) {
        console.error('Error resuming playback:', error);
    }
}

// window.nextSongPlayback = async () => {
//     try {
//         const response = await fetch('http://localhost:3000/chill/playback/next', {
//             method: 'POST'
//         });
//         if (response.ok) {
//             const data = await response.json();
//             console.log(data.message);
//         } else {
//             throw new Error('Failed to retrieve next song');
//         }
//     } catch (error) {
//         console.error('Error resuming playback:', error);
//     }
// }

// window.previousSongPlayback = async () => {
//     try {
//         const response = await fetch('http://localhost:3000/chill/playback/previous', {
//             method: 'POST'
//         });
//         if (response.ok) {
//             const data = await response.json();
//             console.log(data.message);
//         } else {
//             throw new Error('Failed to retrieve previous song');
//         }
//     } catch (error) {
//         console.error('Error resuming playback:', error);
//     }
// }

async function getCurrentState() {
    try {
        const response = await fetch('http://localhost:3000/chill/playback/state', {
            method: 'GET'
        });
        if (response.ok) {
            const data = await response.json();
            return data.state;
        } else {
            throw new Error('Failed to fetch current playback state');
        }
    } catch (error) {
        console.error('Error fetching current playback state:', error);
        return null;
    }
}
