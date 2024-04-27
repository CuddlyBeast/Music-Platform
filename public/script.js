document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
        try {
            window.location.href = 'http://localhost:3000/chill/auth';
        } catch (error) {
            console.error('Error redirecting for authorization:', error);
        }
    } else {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }


    
    try {
        const response = await fetch('http://localhost:3000/chill/playlists/top-country-songs');
    if (!response.ok) {
        throw new Error('Failed to fetch country song recommendations');
    }

    const data = await response.json();

    preloadNextData(data.songs);

    let currentTrackIndex = 0;
    const playButton = document.querySelector('.play-button');
    const pauseButton = document.querySelector('.pause-button');

    // Target first song for trending section
    const firstSong = data.songs[0];

    const infoContainer = document.querySelector('.info');
    const trendingContainer = document.getElementById('trending-image-rec')

    const songTitle = document.createElement('h2');
    songTitle.textContent = firstSong.title;

    const songArtist = document.createElement('h4');
    songArtist.textContent = firstSong.artist;

    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('buttons');

    const listenButton = document.createElement('button');
    listenButton.textContent = 'Listen Now';

    listenButton.addEventListener('click', async (event) => {
        // Check if the click target is not one of the icon buttons
        if (!event.target.closest('.icon')) {
            currentTrackIndex = 0;

            updateUI(firstSong)

            await startPlayback(firstSong.uri); 
            playButton.style.display = 'none';
            pauseButton.style.display = 'inline-block';
            localStorage.removeItem('currentTrackIndex');
            localStorage.setItem('currentTrackIndex', currentTrackIndex)
        }
    
    });

    const heartIcon = document.createElement('i');
    heartIcon.classList.add('bx', 'bxs-heart');

    heartIcon.addEventListener('click', async () => {
        const response = await fetch(`http://localhost:3000/chill/save-track/${firstSong.id}`, {
            method: 'PUT'
        });
        if (!response.ok) {
            throw new Error('Failed to follow country playlist on Spotify');
        } 
        heartIcon.style.color = 'rgb(230, 3, 199)';     
    })

    const plusIcon = document.createElement('i');
    plusIcon.classList.add('bx', 'bxs-plus-square');

    plusIcon.addEventListener('click', async (event) => {
        const token = localStorage.getItem('token');
        const playlistsResponse = await fetch('http://localhost:3000/chill/playlists', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!playlistsResponse.ok) {
            throw new Error('Failed to fetch user playlists');
        }

        const playlistsData = await playlistsResponse.json();
        const playlistContainer = populateOverlayMenu(playlistsData);
        displayOverlayMenu(event, firstSong.id, playlistContainer);
    });

    buttonsContainer.appendChild(listenButton);
    buttonsContainer.appendChild(heartIcon);
    buttonsContainer.appendChild(plusIcon);

    infoContainer.appendChild(songTitle);
    infoContainer.appendChild(songArtist);
    infoContainer.appendChild(buttonsContainer);

    const trendingImage = document.createElement('img');
    trendingImage.src = firstSong.albumImageUrl;

    trendingContainer.appendChild(trendingImage);

    // Iterate over the first four songs only
    for (let index = 1; index < 5; index++) {

        const song = data.songs[index];

        const track = document.createElement('div');
        track.classList.add('track');

        track.addEventListener('click', async (event) => {
            // Check if the click target is not one of the icon buttons
            if (!event.target.closest('.icon')) {
                currentTrackIndex = index;

                updateUI(song)

                await startPlayback(song.uri); 
                playButton.style.display = 'none';
                pauseButton.style.display = 'inline-block';
                localStorage.removeItem('currentTrackIndex');
                localStorage.setItem('currentTrackIndex', currentTrackIndex)
            }
        
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


        const info = document.createElement('div');
        info.classList.add('info');

        const trackNumber = document.createElement('p');
        trackNumber.textContent = (index + 1).toString().padStart(2, '0');

        const img = document.createElement('img');
        img.src = song.albumImageUrl;

        const details = document.createElement('div');
        details.classList.add('details');

        const title = document.createElement('h5');
        title.textContent = song.title;

        const artist = document.createElement('p');
        artist.textContent = song.artist;

        details.appendChild(title);
        details.appendChild(artist);

        info.appendChild(trackNumber);
        info.appendChild(img);
        info.appendChild(details);

        const actions = document.createElement('div');
        actions.classList.add('actions');

        const duration = document.createElement('p');
        duration.textContent = song.duration;

        const icon = document.createElement('div');
        icon.classList.add('icon');
        icon.innerHTML = '<i class="bx bxs-heart"></i>';

        const likeButton = icon.querySelector('.bx.bxs-heart')

        likeButton.addEventListener('click', async () => {
            const response = await fetch(`http://localhost:3000/chill/save-track/${song.id}`, {
                method: 'PUT'
            });
            if (!response.ok) {
                throw new Error('Failed to follow country track on Spotify');
            } 
            likeButton.style.color = 'rgb(230, 3, 199)';     
        })

        const plusIcon = document.createElement('i');
        plusIcon.classList.add('bx', 'bxs-plus-square');

        plusIcon.addEventListener('click', async (event) => {
            const token = localStorage.getItem('token');
            const playlistsResponse = await fetch('http://localhost:3000/chill/playlists', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!playlistsResponse.ok) {
                throw new Error('Failed to fetch user playlists');
            }

            const playlistsData = await playlistsResponse.json();
            const playlistContainer = populateOverlayMenu(playlistsData);
            displayOverlayMenu(event, song.id, playlistContainer);
        });

        actions.appendChild(duration);
        actions.appendChild(icon);
        actions.appendChild(plusIcon);

        track.appendChild(info);
        track.appendChild(actions);

        document.getElementById('recommendations-holder').appendChild(track);
    }

        const nextButton = document.querySelector('.next-song');
        const previousButton = document.querySelector('.previous-song');

        nextButton.addEventListener('click', () => {
            try {
            currentTrackIndex = (currentTrackIndex + 1) % data.songs.length;

            const nextSong = data.songs[currentTrackIndex]
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
            currentTrackIndex = (currentTrackIndex - 1 + data.songs.length) % data.songs.length;

            const previousSong = data.songs[currentTrackIndex];
            updateUI(previousSong)

            startPlayback(previousSong.uri);
            localStorage.removeItem('currentTrackIndex');
            localStorage.setItem('currentTrackIndex', currentTrackIndex)
            } catch (error) {
                console.error('Error starting playback:', error);
            }
        });

        const progressBar = document.querySelector('.progress-bar');

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


        const repeatButton = document.getElementById('repeat-buttons-container');
        const shuffleButton = document.getElementById('shuffle-button');
    
        repeatButton.addEventListener('click', (event) => {
            const clickedButtonId = event.target.id;
            if (clickedButtonId === 'repeat-button' || clickedButtonId === 'repeat-song-button') {
                toggleRepeat();
            }
        });
    
        shuffleButton.addEventListener('click', () => {
            toggleShuffle();
        });

        const volumeButton = document.querySelector('.volume-button-container');
        const volumeBar = document.querySelector('.volume-bar');
        // const volumeLevel = document.querySelector('.volume-level');

        volumeButton.addEventListener('mouseenter', () => {
            volumeBar.style.display = 'block';
        });
        
        volumeBar.addEventListener('mouseleave', () => {
            volumeBar.style.display = 'none';
        });

        volumeButton.addEventListener('click', () => {
            toggleMute();
            volumeBar.style.display = 'none';
        });
        
        volumeBar.addEventListener('click', (event) => {
            const boundingRect = volumeBar.getBoundingClientRect();
            const offsetX = event.clientX - boundingRect.left;
            const percentage = (offsetX / boundingRect.width) * 100;
        
            // Send the volume percentage to your backend
            setVolume(percentage);
        });

    } catch (error) {
        console.error('Error displaying country song recommendations:', error);
    }


    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        item.addEventListener('click', function() {
            const genre = this.querySelector('p').textContent.replace(/\s+/g, ''); 
            window.location.href = `/genreSongs?genre=${genre}`; 
        });
    });


    const searchInput = document.querySelector('.search input');
    const filterSelect = document.getElementById('filter');
    const searchIcon = document.querySelector('.search i.bx-search');

    const handleSearch = () => {
        const searchText = searchInput.value.trim().toLowerCase();
        const filterValue = filterSelect.value;
    
        search(filterValue, searchText);
    };

    searchIcon.addEventListener('click', handleSearch);

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

});


const search = async (filter, searchText) => {
        switch (filter) {
            case 'tracks':
                window.location.href = `/searchTracks?filter=${filter}&searchText=${searchText}`;
                break;
            case 'playlists':
                window.location.href = `/searchPlaylists?filter=${filter}&searchText=${searchText}`;
                break;
            case 'artists':
                window.location.href = `/searchArtists?filter=${filter}&searchText=${searchText}`;
                break;
            case 'albums':
                window.location.href = `/searchAlbums?filter=${filter}&searchText=${searchText}`;
                break;
            default:
                window.location.href = `/searchTracks?filter=${filter}&searchText=${searchText}`;
        }
};




