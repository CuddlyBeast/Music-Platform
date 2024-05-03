let BASE_URL = 'https://your-heroku-app.herokuapp.com/';

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const itemsPerPage = 8; 
        let currentPage = 1;

        // Fetch total number of playlists
        const totalResponse = await fetch(`${BASE_URL}chill/mySavedPlaylists`);

        if (!totalResponse.ok) {
            throw new Error('Failed to fetch total number of playlists');
        }
        const totalData = await totalResponse.json();
        console.log(totalData)

        const totalPlaylists = totalData.length;

        const totalPages = Math.ceil(totalPlaylists / itemsPerPage);

        // Fetch initial playlists
        await fetchPlaylistsByPage(currentPage, itemsPerPage);

        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            pageLink.addEventListener('click', async () => {
                currentPage = i;
                await fetchPlaylistsByPage(currentPage, itemsPerPage);
            });
            paginationContainer.appendChild(pageLink);
        }

        const nextPageButton = document.createElement('a');
        nextPageButton.href = '#';
        nextPageButton.innerHTML = '<i class="bx bx-right-arrow-alt"></i>';
        nextPageButton.addEventListener('click', async () => {
            if (currentPage < totalPages) {
                currentPage++;
                await fetchPlaylistsByPage(currentPage, itemsPerPage);
            }
        });

        paginationContainer.appendChild(nextPageButton);

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
});

async function fetchPlaylistsByPage(page, limit) {
    const response = await fetch(`${BASE_URL}chill/mySavedPlaylistsLimit?page=${page}&limit=${limit}`);
    if (!response.ok) {
        throw new Error('Failed to fetch country playlists');
    }
    const data = await response.json();
    const playlists = data;

    console.log(playlists)

    const container = document.getElementById('playlist-container');
    container.innerHTML = ''; 

    playlists.forEach(playlist => {
        const info = document.createElement('div');
        info.classList.add('info');

        const img = document.createElement('img');
        img.src = playlist.image;

        const title = document.createElement('h2');
        title.textContent = playlist.name;

        const button = document.createElement('button');
        button.textContent = 'View Now';
        button.addEventListener('click', function() {
            viewPlaylist(playlist.id);
        });

        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('bx', 'bx-x-circle');

        deleteIcon.addEventListener('click', async () => {
            const response = await fetch(`${BASE_URL}chill/remove-playlist/${playlist.id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete country playlist on Spotify');
            }   
            window.location.reload() 
        })

        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('buttons');
        buttonsContainer.appendChild(button);
        buttonsContainer.appendChild(deleteIcon);

        info.appendChild(img);
        info.appendChild(title);
        info.appendChild(buttonsContainer);

        container.appendChild(info);
    });
}

function viewPlaylist(playlistId) {
    window.location.href = `/playlist?id=${playlistId}`;
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