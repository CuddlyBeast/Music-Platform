const menuOpen = document.getElementById('menu-open');
const menuClose = document.getElementById('menu-close');
const sidebar = document.querySelector('.container .sidebar');


menuOpen.addEventListener('click', () => sidebar.style.left = '0');

menuClose.addEventListener('click', () => sidebar.style.left = '-100%');


document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // The access token and refresh token are successful retrieved
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
        try {
            window.location.href = 'http://localhost:3000/chill/auth';
        } catch (error) {
            console.error('Error redirecting for authorization:', error);
        }
    } else {
        try {
            const trackId = '2a5VluIESm1JP4Qwvo02H8';
            const data = await fetchSongData(trackId, accessToken);
            console.log(data);
        } catch (error) {
            console.error('Error fetching song data:', error);
        }
    }


    
    try {
        const response = await fetch('http://localhost:3000/chill/playlists/top-country-songs');
    if (!response.ok) {
        throw new Error('Failed to fetch country song recommendations');
    }

    const data = await response.json();

    // Iterate over the first four songs only
    for (let index = 0; index < 4; index++) {
        const song = data.songs[index];

        const track = document.createElement('div');
        track.classList.add('track');

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
        icon.innerHTML = '<i class="bx bxs-right-arrow"></i>';

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

    // Event listener for pressing enter
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

});



const fetchSongData = async (trackId, accessToken) => {
    try {
        const response = await fetch(`http://localhost:3000/chill/tracks/${trackId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}` 
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching song data:', error);
        return null;
    }
};

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