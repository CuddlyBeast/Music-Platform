document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('http://localhost:3000/chill/mySavedTracks');
        if (!response.ok) {
            throw new Error('Failed to fetch country song recommendations');
        }

        const data = await response.json();

        console.log(data);

        data.forEach((track, index) => {
            const item = document.createElement('div');
            item.classList.add('item');

            const info = document.createElement('div');
            info.classList.add('info');

            const trackNumber = document.createElement('p');
            trackNumber.textContent = (index + 1).toString().padStart(2, '0');

            const img = document.createElement('img');
            img.src = track.track.album.images[0].url; 

            const details = document.createElement('div');
            details.classList.add('details');

            const title = document.createElement('h5');
            title.textContent = track.track.name;

            const artist = document.createElement('p');
            artist.textContent = track.track.artists.map(artist => artist.name).join(', '); 

            details.appendChild(title);
            details.appendChild(artist);

            info.appendChild(trackNumber);
            info.appendChild(img);
            info.appendChild(details);

            const actions = document.createElement('div');
            actions.classList.add('actions');

            const duration = document.createElement('p');
            duration.textContent = formatDuration(track.track.duration_ms); 

            const icon = document.createElement('div');
            icon.classList.add('icon');
            icon.innerHTML = '<i class="bx bxs-check-circle"></i>';

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
                displayOverlayMenu(event, track.track.id, playlistContainer);
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