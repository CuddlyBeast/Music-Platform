let deviceId = null
let timer = null; 
let startTime = null;
let lastPercentage = 0;
let repeatMode = 'off'; 
let isShuffleEnabled = false;
let modifiedData = null; 


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
            clearInterval(timer) 
        } else {
            percentage = (elapsedTime / duration) * 100;
            lastPercentage = percentage; 
        }

        progressCircle.style.left = `calc(${percentage}% - 5px)`;

        if (!paused && currentSeconds >= Math.floor(duration / 1000)) {
            console.log('Timer reached the end of the track. Calling playNextTrack...');
            clearInterval(timer); 
            handleTrackEnd();       
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

const seekPlayback = async (positionMs) => {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
            throw new Error('Access token or refresh token not available');
        }

        if (!deviceId) {
            throw new Error('Device ID is not available');
        }

        const response = await fetch('http://localhost:3000/chill/playback/seek', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ positionMs, deviceId })
        });

        if (!response.ok) {
            throw new Error('Failed to seek playback');
        }

        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Error seeking playback:', error);
    }
};

window.seekProgress = async (positionMs) => {
    const currentTimeElement = document.querySelector('.current-time');
    const progressCircle = document.querySelector('.progress-circle');
    const duration = parseInt(document.querySelector('.total-time').textContent.split(':').reduce((acc, time) => (60 * acc) + +time, 0)); 

    // Calculate percentage based on the seeked position
    const percentage = (positionMs / duration) * 100;

    // Update the position of the progress circle
    progressCircle.style.left = `calc(${percentage}% - 5px)`;

    // Update the current time element to match the seeked position
    currentTimeElement.textContent = formatDuration(positionMs);

    const state = await getCurrentState();

    const trackPostitionMs = Math.floor(state.item.duration_ms * (percentage / 100))

    seekPlayback(trackPostitionMs)
}


window.toggleShuffle = () => {
    isShuffleEnabled = !isShuffleEnabled;

    const shuffleButton = document.getElementById('shuffle-button');
    shuffleButton.style.color = isShuffleEnabled ? 'blue' : 'white';
};

const playNextTrack = async () => {
    let nextIndex;
    let currentTrackIndex = parseInt(localStorage.getItem('currentTrackIndex'));

    if (!modifiedData) {
        console.error('Modified data is null or songs array is missing.');
        return;
    }

    if (isShuffleEnabled) {
        nextIndex = Math.floor(Math.random() * Object.keys(modifiedData).length);
    } else {
        nextIndex = (currentTrackIndex + 1) % Object.keys(modifiedData).length;
    }

    if (currentTrackIndex === Object.keys(modifiedData).length - 1) {
        pausePlayback();
    } else{
        localStorage.setItem('currentTrackIndex', nextIndex);

        currentTrackIndex = nextIndex;
    
        startPlayback(modifiedData[currentTrackIndex].uri);
        updateUI(modifiedData[currentTrackIndex])
    }
};

const handleTrackEnd = () => {
    let currentTrackIndex = parseInt(localStorage.getItem('currentTrackIndex'));

    switch (repeatMode) {
        case 'off':
            playNextTrack();
            break;
        case 'track':
            startPlayback(modifiedData[currentTrackIndex].uri);
            break;
        case 'playlist':
            if (currentTrackIndex === Object.keys(modifiedData).length - 1) {
                currentTrackIndex = 0
                console.log(currentTrackIndex)
                updateUI(modifiedData[currentTrackIndex])
                startPlayback(modifiedData[currentTrackIndex].uri)
            } else {
                playNextTrack();
            }
            break;
        default:
            break;
    }
};

window.toggleRepeat = () => {
    const repeatButton = document.getElementById('repeat-button');
    const repeatSongButton = document.getElementById('repeat-song-button');
    

    switch (repeatMode) {
        case 'off':
            repeatMode = 'track'; 
            repeatButton.style.display = 'none'; 
            repeatSongButton.style.display = 'inline-block';
            repeatSongButton.style.color = 'blue';
            break;
        case 'track':
            repeatMode = 'playlist'; 
            repeatButton.style.display = 'inline-block';
            repeatSongButton.style.display = 'none';
            repeatButton.style.color = 'blue'; 
            break;
        case 'playlist':
            repeatMode = 'off'; 
            repeatButton.style.display = 'inline-block'; 
            repeatSongButton.style.display = 'none';
            repeatButton.style.color = 'white'; 
            break;
        default:
            break;
    }
};

async function toggleMute() {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
            throw new Error('Access token or refresh token not available');
        }

        if (!deviceId) {
            throw new Error('Device ID is not available');
        }

        // Get the current player state to determine if it's muted
        const state = await getCurrentState();

        // If currently muted, unmute; if not muted, mute
        const isMuted = state && state.device.volume_percent === 0;
        const volumePercent = isMuted ? 100 : 0;

        const response = await fetch('http://localhost:3000/chill/playback/volume', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ volumePercent, deviceId })
        });

        if (!response.ok) {
            throw new Error('Failed to toggle mute');
        }

        const volumeFullIcon = document.querySelector('.bxs-volume-full');
        const volumeMuteIcon = document.querySelector('.bxs-volume-mute');

        if (isMuted) {
            // Show the volume-full icon and hide the volume-mute icon
            volumeFullIcon.style.display = 'block';
            volumeMuteIcon.style.display = 'none';
        } else {
            // Show the volume-mute icon and hide the volume-full icon
            volumeFullIcon.style.display = 'none';
            volumeMuteIcon.style.display = 'block';
        }
    } catch (error) {
        console.error('Error toggling mute:', error);
    }
}

// Function to update volume bar
function updateVolumeBar(volumePercent) {
    const volumeLevel = document.querySelector('.volume-level');
    volumeLevel.style.width = (100 - volumePercent) + '%';
}

// Function to handle volume changes
async function setVolume(volumePercent) {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
            throw new Error('Access token or refresh token not available');
        }

        if (!deviceId) {
            throw new Error('Device ID is not available');
        }

        const adjustedVolumePercent = 100 - volumePercent;

        const response = await fetch('http://localhost:3000/chill/playback/volume', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ volumePercent: adjustedVolumePercent, deviceId })
        });

        if (!response.ok) {
            throw new Error('Failed to set volume');
        }

        // Update the volume bar
        updateVolumeBar(volumePercent);
    } catch (error) {
        console.error('Error setting volume:', error);
    }
}

const preloadNextData = async (trackData) => {
    try {
        modifiedData = { ...trackData };

    } catch (error) {
        console.error('Error preloading next data:', error);
    }
};




const updateUI = (track) => {
    const albumImage = document.querySelector('.album-image');
    const songTitle = document.querySelector('.song-title');
    const songArtist = document.querySelector('.song-artist');
    const albumName = document.querySelector('.album-name');
    
    if (track.albumImageUrl && track.title && track.artist && track.albumTitle) {
        albumImage.src = track.albumImageUrl;
        songTitle.textContent = track.title;
        songArtist.textContent = track.artist;
        albumName.textContent = track.albumTitle;
    } else if (track.imageUrl && track.name && track.artist && track.albumTitle) {
        albumImage.src = track.imageUrl;
        songTitle.textContent = track.name;
        songArtist.textContent = track.artist;
        albumName.textContent = track.albumTitle;
    } else if (track.image && track.title && track.artist && track.album) {
        albumImage.src = track.image;
        songTitle.textContent = track.title;
        songArtist.textContent = track.artist;
        albumName.textContent = track.album;
    } else if (!track.imageUrl && track.name && track.artist && !track.albumTitle) { 
        songTitle.textContent = track.name;
        songArtist.textContent = track.artist;
    } else {
        albumImage.src = track.album.images[0].url;
        songTitle.textContent = track.name;
        songArtist.textContent = track.artists.name;
        albumName.textContent = track.album.name
    }
    };
    


// window.toggleShuffle = async () => {
//     try {
//         const accessToken = localStorage.getItem('accessToken');

//         if (!accessToken) {
//             throw new Error('Access token not available');
//         }

//         const state = await getCurrentState();
//         const currentState = state.shuffle_state;

//         console.log('state it do be', state)

//         const response = await fetch(`http://localhost:3000/chill/playback/shuffle?state=${currentState}`, {
//             method: 'PUT',
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         if (!response.ok) {
//             throw new Error('Failed to toggle shuffle');
//         }

//         const newState = !currentState;

//         const shuffleButton = document.getElementById('shuffle-button');
//         if (newState) {
//             shuffleButton.style.color = 'blue';
//         } else {
//             shuffleButton.style.color = 'black';
//         }

//         const data = await response.json();
//         console.log(data.message);
//     } catch (error) {
//         console.error('Error toggling shuffle:', error);
//     }
// };

// window.toggleRepeat = async () => {
//     try {
//         const accessToken = localStorage.getItem('accessToken');

//         if (!accessToken) {
//             throw new Error('Access token not available');
//         }

//         const state = await getCurrentState();
//         const currentState = state.repeat_state;

//         const response = await fetch(`http://localhost:3000/chill/playback/repeat?state=${currentState}`, {
//             method: 'PUT',
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Content-Type': 'application/json'
//             }
//         });

//         if (!response.ok) {
//             throw new Error('Failed to toggle repeat');
//         }


//         const newState = !currentState;

//         const repeatButton = document.getElementById('repeat-button');
//         if (newState) {
//             repeatButton.style.color = 'blue';
//         } else {
//             repeatButton.style.color = 'black';
//         }

//         const data = await response.json();
//         console.log(data.message);
//         console.log(state)
//     } catch (error) {
//         console.error('Error toggling repeat:', error);
//     }
// };

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