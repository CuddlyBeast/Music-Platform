document.addEventListener('DOMContentLoaded', async function() {
    try {
        const itemsPerPage = 8; 
        let currentPage = 1;

        // Fetch total number of playlists
        const totalResponse = await fetch('http://localhost:3000/chill/newCountry?q=new%20country%20releases&type=playlist');

        if (!totalResponse.ok) {
            throw new Error('Failed to fetch total number of playlists');
        }
        const totalData = await totalResponse.json();
        const totalPlaylists = totalData.playlists.length;


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
    const response = await fetch(`http://localhost:3000/chill/newCountryLimit?q=new%20country%20releases&type=playlist&page=${page}&limit=${limit}`);
    if (!response.ok) {
        throw new Error('Failed to fetch country playlists');
    }
    const data = await response.json();
    const playlists = data.playlists;

    console.log(playlists)

    const container = document.getElementById('playlist-container');
    container.innerHTML = ''; 

    playlists.forEach(playlist => {
        const info = document.createElement('div');
        info.classList.add('info');

        const img = document.createElement('img');
        img.src = playlist.imageUrl;

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