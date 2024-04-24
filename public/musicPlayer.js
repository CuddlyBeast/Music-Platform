function initializeMusicPlayer(data) {
    const nextButton = document.querySelector('.next-song');
    const previousButton = document.querySelector('.previous-song');
    const progressBar = document.querySelector('.progress-bar');
    const repeatButton = document.getElementById('repeat-buttons-container');
    const shuffleButton = document.getElementById('shuffle-button');
    const playButton = document.querySelector('.play-button');
    const pauseButton = document.querySelector('.pause-button');
    let currentTrackIndex = 0;

    nextButton.addEventListener('click', () => {
        try {
        currentTrackIndex = (currentTrackIndex + 1) % data.length;

        const nextSong = data[currentTrackIndex]
        updateUI(nextSong)
        
        startPlayback(nextSong.uri);
        localStorage.removeItem('currentTrackIndex');
        localStorage.setItem('currentTrackIndex', currentTrackIndex)
        } catch (error) {
            console.error('Error starting playback:', error);
        }
    });

    previousButton.addEventListener('click', () => {
        try {
        currentTrackIndex = (currentTrackIndex - 1 + data.length) % data.length;

        const previousSong = data[currentTrackIndex];
        updateUI(previousSong)

        startPlayback(previousSong.uri);
        localStorage.removeItem('currentTrackIndex');
        localStorage.setItem('currentTrackIndex', currentTrackIndex)
        } catch (error) {
            console.error('Error starting playback:', error);
        }
    });

    progressBar.addEventListener('click', (event) => {
        const boundingRect = progressBar.getBoundingClientRect();
        const clickX = event.clientX - boundingRect.left;
        const progressBarWidth = boundingRect.width;
        const percentageClicked = clickX / progressBarWidth;

        // Calculate position in milliseconds
        const duration_ms = parseInt(document.querySelector('.total-time').textContent.split(':').reduce((acc, time) => (60 * acc) + +time, 0)); 
        const positionMs = Math.floor(duration_ms * percentageClicked);

        seekProgress(positionMs);
    });

    repeatButton.addEventListener('click', (event) => {
        const clickedButtonId = event.target.id;
        if (clickedButtonId === 'repeat-button' || clickedButtonId === 'repeat-song-button') {
            toggleRepeat();
        }
    });

    shuffleButton.addEventListener('click', () => {
        toggleShuffle();
    });

    playButton.addEventListener('click', function() {
        playButton.style.display = 'none';
        pauseButton.style.display = 'inline-block';
        resumePlayback();
    });

    pauseButton.addEventListener('click', function() {
        pauseButton.style.display = 'none';
        playButton.style.display = 'inline-block';
        pausePlayback();
    });
}

