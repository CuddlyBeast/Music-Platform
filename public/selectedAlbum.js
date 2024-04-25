document.addEventListener('DOMContentLoaded', async function() {
    try {
         const urlParams = new URLSearchParams(window.location.search);
         const albumsId = urlParams.get('id');
 
         const response = await fetch(`http://localhost:3000/chill/albums/${albumsId}`);
         if (!response.ok) {
             throw new Error('Failed to fetch albums details');
         }
        const albums = await response.json();

        initializeMusicPlayer(albums.tracks)
        preloadNextData(albums.tracks);

        let currentTrackIndex = 0;

        const albumImage = document.querySelector('.album-image');
        const albumName = document.querySelector('.album-name');

        albumName.textContent = albums.name;
        albumImage.src = albums.images[0].url;

        const albumsInfo = document.querySelector('.trending');
        albumsInfo.innerHTML = `
            <div class="left">
                <div class="info">
                    <h2>${albums.name}</h2>
                    <h4>${albums.artist}</h4>
                    <h5>${albums.release_date}</h5>
                    <div class="buttons">
                        <button>Follow</button>
                        <i class='bx bxs-heart'></i>
                    </div>
                </div>
            </div> 
            <img src="${albums.images[0].url}">
        `;

        const albumLikeButton = albumsInfo.querySelector('.bx.bxs-heart')

        albumLikeButton.addEventListener('click', async () => {
            const response = await fetch(`http://localhost:3000/chill/save-album/${albums.id}`, {
                method: 'PUT'
            });
            if (!response.ok) {
                throw new Error('Failed to follow country album on Spotify');
            } 
            albumLikeButton.style.color = 'rgb(230, 3, 199)';     
        })


        const tracksContainer = document.querySelector('.playlist .music-list .items');
        tracksContainer.innerHTML = '';
        albums.tracks.forEach((track, index) => {
            const trackItem = document.createElement('div');
            trackItem.classList.add('item');
            trackItem.innerHTML = `
                <div class="info">
                    <p>${index + 1}</p>
                    <div class="details">
                        <h5>${track.name}</h5>
                        <p>${track.artist}</p>
                    </div>
                </div>
                <div class="actions">
                    <p>${track.duration}</p>
                    <div class="icon">
                        <i class='bx bxs-heart'></i>
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

function formatDuration(duration_ms) {
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = ((duration_ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

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