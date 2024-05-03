let BASE_URL = 'https://your-heroku-app.herokuapp.com/';

async function getCurrentState() {
    try {
        const response = await fetch(`${BASE_URL}chill/playback/state`, {
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

// Function to store playback state in session storage
function storePlaybackState(state) {
    sessionStorage.setItem('spotifyPlaybackState', state);
}

// Function to retrieve playback state from session storage
function getPlaybackState() {
    const stateString = sessionStorage.getItem('spotifyPlaybackState');
    return stateString ? stateString : null;
}

// Function to restore playback state
function restorePlaybackState() {
    const playbackState = getPlaybackState();
    if (playbackState) {
        startPlayback(playbackState.trackUri)
        setVolume(playbackState.volumePercent)
        seekPlayback(playbackState.playbackPosition)
        if (playbackState.isPlaying === false) {
            pausePlayback();
        }
    }
}

// Event listener for page load
window.addEventListener('load', () => {
    restorePlaybackState();
});

// Event listener for before unloading the page
window.addEventListener('beforeunload', async () => {

    const state = await getCurrentState();

    const currentVolume = sessionStorage.getItem('volumePercent')

    const currentState = {
        trackUri: state.item.uri,
        playbackPosition: state.progress_ms, 
        volumePercent: currentVolume, 
        isPlaying: state.is_playing
    };
    
    storePlaybackState(currentState);
});
