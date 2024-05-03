const BASE_URL = 'https://your-heroku-app.herokuapp.com/';

document.addEventListener('DOMContentLoaded', async function() {
    try {
         const urlParams = new URLSearchParams(window.location.search);
         const playlistId = urlParams.get('id');

         const token = localStorage.getItem('token');
 
         const response = await fetch(`${BASE_URL}chill/personalPlaylist/${playlistId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
            });
         if (!response.ok) {
             throw new Error('Failed to fetch playlist details');
         }
        const playlist = await response.json();

        const playlistTracks = playlist.map(track => ({ ...track.Track, }))

        initializeMusicPlayer(playlistTracks)
        preloadNextData(playlistTracks);

        console.log('playlistTracks', playlistTracks)

        const myPlaylist = playlist[0];

        const playlistInfo = document.querySelector('.trending');
        playlistInfo.innerHTML = `
            <div class="left">
                <div class="info">
                    <h2>${myPlaylist.Playlist.title}</h2>
                    <h4>Created At: ${myPlaylist.Playlist.createdAt.slice(11, 19)} | ${myPlaylist.Playlist.createdAt.slice(0, 10)}</h4> 
                    <div class="buttons">
                        <button>Delete</button>
                        <i class='bx bxs-check-circle' ></i>
                    </div>
                </div>
            </div> 
            <img src="${myPlaylist.Playlist.image}">
        `;

        const deleteButton = document.querySelector('.buttons button')

        deleteButton.addEventListener('click', async () => {
            const confirmed = window.confirm('Are you sure you want to delete this playlist?');

            if (confirmed) {
                const response = await fetch(`${BASE_URL}chill/playlist/${playlistId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete YouCountry playlist');
                }

                window.location.href = '/';
            }
        })

        const tracksContainer = document.querySelector('.playlist .music-list .items');
        tracksContainer.innerHTML = '';
        playlistTracks.forEach((track, index) => {
            const trackItem = document.createElement('div');
            trackItem.classList.add('item');
            trackItem.innerHTML = `
                <div class="info">
                    <p>${index + 1}</p>
                    <img src="${track.image}">
                    <div class="details">
                        <h5>${track.title}</h5>
                        <p>${track.artist}</p>
                    </div>
                </div>
                <div class="actions">
                    <p>${formatDuration(track.durationMs)}</p>
                    <div class="icon">
                        <i class='bx bxs-heart'></i>
                    </div>
                    <i class='bx bx-x-circle'></i>
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
                const response = await fetch(`${BASE_URL}chill/save-track/${track.spotifyId}`, {
                    method: 'PUT'
                });
                if (!response.ok) {
                    throw new Error('Failed to follow country track on Spotify');
                } 
                likeButton.style.color = 'rgb(230, 3, 199)';     
            })



            const removeButton = trackItem.querySelector('.bx.bx-x-circle')

            removeButton.addEventListener('click', async () => {
                const urlParams = new URLSearchParams(window.location.search);
                const selectedPlaylist = urlParams.get('id');
                const token = localStorage.getItem('token');
                const spotifyId = track.spotifyId; 
                const action = 'remove';
                try {
                    const response = await fetch(`${BASE_URL}chill/personalPlaylist/${selectedPlaylist}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ spotifyId, action })
                        });

                        if (response.ok) {
                            window.location.reload();
                        }else{
                            throw new Error('Failed to fetch playlist details necessary for deletion');
                        }
                } catch (error) {
                    console.error('Error removing track from the playlist:', error);
                }   
            })

            const plusIcon = trackItem.querySelector('.bx.bxs-plus-square');

            plusIcon.addEventListener('click', async (event) => {
                const token = localStorage.getItem('token');
                const playlistsResponse = await fetch(`${BASE_URL}chill/playlists`, {
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
                displayOverlayMenu(event, track.spotifyId, playlistContainer);
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