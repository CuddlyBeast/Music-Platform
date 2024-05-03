document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch(`${BASE_URL}chill/playlists/top-country-songs`);
        if (!response.ok) {
            throw new Error('Failed to fetch country song recommendations');
        }

        const data = await response.json();

        initializeMusicPlayer(data.songs)
        preloadNextData(data.songs);

        data.songs.forEach((song, index) => {
            const item = document.createElement('div');
            item.classList.add('item');

            item.addEventListener('click', async (event) => {
                // Check if the click target is not one of the icon buttons
                if (!event.target.closest('.icon')) {
                    const playButton = document.querySelector('.play-button');
                    const pauseButton = document.querySelector('.pause-button');
                    
                    currentTrackIndex = index;
    
                    updateUI(song)
    
                    await startPlayback(song.uri); 
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
                const response = await fetch(`${BASE_URL}chill/save-track/${song.id}`, {
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
                displayOverlayMenu(event, song.id, playlistContainer);
            });

            actions.appendChild(duration);
            actions.appendChild(icon);
            actions.appendChild(plusIcon);

            item.appendChild(info);
            item.appendChild(actions);

            document.querySelector('.items').appendChild(item);
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
        console.error('Error displaying country song recommendations:', error);
    }
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