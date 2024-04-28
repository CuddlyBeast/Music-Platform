document.addEventListener('DOMContentLoaded', async function() {
    try {
         const urlParams = new URLSearchParams(window.location.search);
         const playlistId = urlParams.get('id');
 
         const response = await fetch(`http://localhost:3000/chill/playlists/${playlistId}`);
         if (!response.ok) {
             throw new Error('Failed to fetch playlist details');
         }
        const playlist = await response.json();

        initializeMusicPlayer(playlist.tracks)
        preloadNextData(playlist.tracks);

        const playlistInfo = document.querySelector('.trending');
        playlistInfo.innerHTML = `
            <div class="left">
                <div class="info">
                    <h2>${playlist.name}</h2>
                    <h4>${playlist.description}</h4>
                    <div class="buttons">
                        <button>Follow</button>
                        <i class='bx bxs-heart'></i>
                    </div>
                </div>
            </div> 
            <img src="${playlist.imageUrl}">
        `;

        const playlistLikeButton = playlistInfo.querySelector('.bx.bxs-heart')

        playlistLikeButton.addEventListener('click', async () => {
            const response = await fetch(`http://localhost:3000/chill/save-playlist/${playlist.id}`, {
                method: 'PUT'
            });
            if (!response.ok) {
                throw new Error('Failed to follow country track on Spotify');
            } 
            playlistLikeButton.style.color = 'rgb(230, 3, 199)';     
        })

        const tracksContainer = document.querySelector('.playlist .music-list .items');
        tracksContainer.innerHTML = '';
        playlist.tracks.forEach((track, index) => {
            const trackItem = document.createElement('div');
            trackItem.classList.add('item');
            trackItem.innerHTML = `
                <div class="info">
                    <p>${index + 1}</p>
                    <img src="${track.imageUrl}">
                    <div class="details">
                        <h5>${track.name}</h5>
                        <p>${track.artist}</p>
                    </div>
                </div>
                <div class="actions">
                    <p>${track.duration}</p>
                    <div class="icon">
                    <i class='bx bxs-heart' ></i>
                    </div>
                    <i class='bx bxs-plus-square'></i>
                </div>
            `;

            trackItem.addEventListener('click', async (event) => {
                // Check if the click target is not one of the icon buttons
                if (!event.target.closest('.icon')) {
                    const playButton = document.querySelector('.play-button');
                    const pauseButton = document.querySelector('.pause-button');
                    
                    currentTrackIndex = index;
    
                    updateUI(track)
    
                    await startPlayback(track.uri); 
                    playButton.style.display = 'none';
                    pauseButton.style.display = 'inline-block';
                    localStorage.removeItem('currentTrackIndex');
                    localStorage.setItem('currentTrackIndex', currentTrackIndex)
                }
            
            });

            const likeButton = trackItem.querySelector('.bx.bxs-heart')

            likeButton.addEventListener('click', async () => {
                const response = await fetch(`http://localhost:3000/chill/save-track/${track.id}`, {
                    method: 'PUT'
                });
                if (!response.ok) {
                    throw new Error('Failed to follow country track on Spotify');
                } 
                likeButton.style.color = 'rgb(230, 3, 199)';     
            })

            const plusIcon = trackItem.querySelector('.bx.bxs-plus-square');

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
                displayOverlayMenu(event, track.id, playlistContainer);
            });

            tracksContainer.appendChild(trackItem);
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

    } catch (error) {
        console.error('Error:', error);
    }
})

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