

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const filter = urlParams.get('filter');
        const searchText = urlParams.get('searchText');

        const response = await fetch(`http://localhost:3000/chill/search?filter=${filter}&searchText=${searchText}`);

        if (!response.ok) {
            throw new Error('Failed to fetch search data');
        }

        const data = await response.json();

        initializeMusicPlayer(data.tracks.items)

        if (filter === 'tracks') {

        data.tracks.items.forEach((track, index) => {
            const item = document.createElement('div');
            item.classList.add('item');

            item.addEventListener('click', async (event) => {
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

            const info = document.createElement('div');
            info.classList.add('info');

            const trackNumber = document.createElement('p');
            trackNumber.textContent = (index + 1).toString().padStart(2, '0');

            const img = document.createElement('img');
            img.src = track.album.images[0].url; 

            const details = document.createElement('div');
            details.classList.add('details');

            const title = document.createElement('h5');
            title.textContent = track.name;

            const artist = document.createElement('p');
            artist.textContent = track.artists.map(artist => artist.name).join(', '); 

            details.appendChild(title);
            details.appendChild(artist);

            info.appendChild(trackNumber);
            info.appendChild(img);
            info.appendChild(details);

            const actions = document.createElement('div');
            actions.classList.add('actions');

            const duration = document.createElement('p');
            duration.textContent = formatDuration(track.duration_ms); 

            const icon = document.createElement('div');
            icon.classList.add('icon');
            icon.innerHTML = '<i class="bx bxs-heart"></i>';

            const likeButton = icon.querySelector('.bx.bxs-heart')
    
            likeButton.addEventListener('click', async () => {
                const response = await fetch(`http://localhost:3000/chill/save-track/${track.id}`, {
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
                displayOverlayMenu(event, track.id, playlistContainer);
            });

            actions.appendChild(duration);
            actions.appendChild(icon);
            actions.appendChild(plusIcon);

            item.appendChild(info);
            item.appendChild(actions);

            document.querySelector('.items').appendChild(item);
        });
    
    } else if (filter === 'albums') {

        const itemsPerPage = 8; 
        let currentPage = 1;

        const totalAlbums = data.albums.items.length;

        
        const totalPages = Math.ceil(totalAlbums / itemsPerPage);

        // Fetch initial albums
        await fetchAlbumsByPage(filter, searchText, currentPage, itemsPerPage);

        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            pageLink.addEventListener('click', async () => {
                currentPage = i;
                await fetchAlbumsByPage(filter, searchText, currentPage, itemsPerPage);
            });
            paginationContainer.appendChild(pageLink);
        }

        const nextPageButton = document.createElement('a');
        nextPageButton.href = '#';
        nextPageButton.innerHTML = '<i class="bx bx-right-arrow-alt"></i>';
        nextPageButton.addEventListener('click', async () => {
            if (currentPage < totalPages) {
                currentPage++;
                await fetchAlbumsByPage(filter, searchText, currentPage, itemsPerPage);
            }
        });

        paginationContainer.appendChild(nextPageButton);

    } else if (filter === 'playlists') {

        const itemsPerPage = 8; 
        let currentPage = 1;

        const totalPlaylists = data.playlists.items.length;

        
        const totalPages = Math.ceil(totalPlaylists / itemsPerPage);

        // Fetch initial albums
        await fetchPlaylistsByPage(filter, searchText, currentPage, itemsPerPage);

        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            pageLink.addEventListener('click', async () => {
                currentPage = i;
                await fetchPlaylistsByPage(filter, searchText, currentPage, itemsPerPage);
            });
            paginationContainer.appendChild(pageLink);
        }

        const nextPageButton = document.createElement('a');
        nextPageButton.href = '#';
        nextPageButton.innerHTML = '<i class="bx bx-right-arrow-alt"></i>';
        nextPageButton.addEventListener('click', async () => {
            if (currentPage < totalPages) {
                currentPage++;
                await fetchPlaylistsByPage(filter, searchText, currentPage, itemsPerPage);
            }
        });

        paginationContainer.appendChild(nextPageButton);

    } else if (filter === 'artists') {
        const itemsPerPage = 8; 
        let currentPage = 1;

        const totalArtists = data.artists.items.length;

        
        const totalPages = Math.ceil(totalArtists / itemsPerPage);

        // Fetch initial albums
        await fetchArtistsByPage(filter, searchText, currentPage, itemsPerPage);

        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            pageLink.addEventListener('click', async () => {
                currentPage = i;
                await fetchArtistsByPage(filter, searchText, currentPage, itemsPerPage);
            });
            paginationContainer.appendChild(pageLink);
        }

        const nextPageButton = document.createElement('a');
        nextPageButton.href = '#';
        nextPageButton.innerHTML = '<i class="bx bx-right-arrow-alt"></i>';
        nextPageButton.addEventListener('click', async () => {
            if (currentPage < totalPages) {
                currentPage++;
                await fetchArtistsByPage(filter, searchText, currentPage, itemsPerPage);
            }
        });

        paginationContainer.appendChild(nextPageButton);
    }


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
        console.error('Error displaying searched items:', error);
    }
});




function formatDuration(duration_ms) {
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = ((duration_ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}



async function fetchAlbumsByPage(filter, searchText, page, limit) {
    const response = await fetch(`http://localhost:3000/chill/searchLimit?filter=${filter}&searchText=${searchText}&page=${page}&limit=${limit}`);
    if (!response.ok) {
        throw new Error('Failed to fetch country albums');
    }
    const data = await response.json();
    const albums = data.albums.items;

    const container = document.getElementById('albums-container');
    container.innerHTML = ''; 

    albums.forEach(albums => {
        const info = document.createElement('div');
        info.classList.add('info');

        const img = document.createElement('img');
        img.src = albums.images[0].url;

        const title = document.createElement('h2');
        title.textContent = albums.name;

        const button = document.createElement('button');
        button.textContent = 'View Now';
        button.addEventListener('click', function() {
            viewAlbums(albums.id);
        });

        const heartIcon = document.createElement('i');
        heartIcon.classList.add('bx', 'bxs-heart');

        heartIcon.addEventListener('click', async () => {
            const response = await fetch(`http://localhost:3000/chill/save-album/${albums.id}`, {
                method: 'PUT'
            });
            if (!response.ok) {
                throw new Error('Failed to follow country album on Spotify');
            } 
            heartIcon.style.color = 'rgb(230, 3, 199)';     
        })

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('buttons');
        buttonsContainer.appendChild(button);
        buttonsContainer.appendChild(heartIcon);

        info.appendChild(img);
        info.appendChild(title);
        info.appendChild(buttonsContainer);

        container.appendChild(info);
    });
}

function viewAlbums(albumsId) {
    window.location.href = `/selectedAlbum?id=${albumsId}`;
}


async function fetchPlaylistsByPage(filter, searchText, page, limit) {
    const response = await fetch(`http://localhost:3000/chill/searchLimit?filter=${filter}&searchText=${searchText}&page=${page}&limit=${limit}`);
    if (!response.ok) {
        throw new Error('Failed to fetch country playlists');
    }
    const data = await response.json();
    const playlists = data.playlists.items;

    const container = document.getElementById('playlist-container');
    container.innerHTML = ''; 

    playlists.forEach(playlist => {
        const info = document.createElement('div');
        info.classList.add('info');

        const img = document.createElement('img');
        img.src = playlist.images[0].url;

        const title = document.createElement('h2');
        title.textContent = playlist.name;

        const button = document.createElement('button');
        button.textContent = 'View Now';
        button.addEventListener('click', function() {
            viewPlaylist(playlist.id);
        });

        const heartIcon = document.createElement('i');
        heartIcon.classList.add('bx', 'bxs-heart');

        heartIcon.addEventListener('click', async () => {
            const response = await fetch(`http://localhost:3000/chill/save-playlist/${playlist.id}`, {
                method: 'PUT'
            });
            if (!response.ok) {
                throw new Error('Failed to follow country playlist on Spotify');
            } 
            heartIcon.style.color = 'rgb(230, 3, 199)';     
        })

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('buttons');
        buttonsContainer.appendChild(button);
        buttonsContainer.appendChild(heartIcon);

        info.appendChild(img);
        info.appendChild(title);
        info.appendChild(buttonsContainer);

        container.appendChild(info);
    });
}

function viewPlaylist(playlistId) {
    window.location.href = `/playlist?id=${playlistId}`;
}


async function fetchArtistsByPage(filter, searchText, page, limit) {
    const response = await fetch(`http://localhost:3000/chill/searchLimit?filter=${filter}&searchText=${searchText}&page=${page}&limit=${limit}`);
    if (!response.ok) {
        throw new Error('Failed to fetch country Artists');
    }
    const data = await response.json();
    const artists = data.artists.items;

    const container = document.getElementById('albums-container');
    container.innerHTML = ''; 

    artists.forEach(artist => {
        const info = document.createElement('div');
        info.classList.add('info');

        const img = document.createElement('img');
        img.src = artist.images[0].url;

        const title = document.createElement('h2');
        title.textContent = artist.name;

        const button = document.createElement('button');
        button.textContent = 'View Now';
        button.addEventListener('click', function() {
            viewartist(artist.id);
        });

        const heartIcon = document.createElement('i');
        heartIcon.classList.add('bx', 'bxs-heart');

        heartIcon.addEventListener('click', async () => {
            const response = await fetch(`http://localhost:3000/chill/save-artist/${artist.id}`, {
                method: 'PUT'
            });
            if (!response.ok) {
                throw new Error('Failed to follow country artist on Spotify');
            } 
            heartIcon.style.color = 'rgb(230, 3, 199)';     
        })

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('buttons');
        buttonsContainer.appendChild(button);
        buttonsContainer.appendChild(heartIcon);

        info.appendChild(img);
        info.appendChild(title);
        info.appendChild(buttonsContainer);

        container.appendChild(info);
    });
}



function viewArtist(artistId) {
    window.location.href = `/selectedArtist?id=${artistId}`;
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