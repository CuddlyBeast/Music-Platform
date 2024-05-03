const BASE_URL = 'https://your-heroku-app.herokuapp.com/';

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const itemsPerPage = 8; 
        let currentPage = 1;

        // Fetch total number of albums
        const totalResponse = await fetch(`${BASE_URL}chill/mySavedAlbums`);
        if (!totalResponse.ok) {
            throw new Error('Failed to fetch total number of albums');
        }
        const totalData = await totalResponse.json();

        console.log(totalData)
        const totalAlbums = totalData.length;

        
        const totalPages = Math.ceil(totalAlbums / itemsPerPage);

        // Fetch initial albums
        await fetchAlbumsByPage(currentPage, itemsPerPage);

        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            pageLink.addEventListener('click', async () => {
                currentPage = i;
                await fetchAlbumsByPage(currentPage, itemsPerPage);
            });
            paginationContainer.appendChild(pageLink);
        }

        const nextPageButton = document.createElement('a');
        nextPageButton.href = '#';
        nextPageButton.innerHTML = '<i class="bx bx-right-arrow-alt"></i>';
        nextPageButton.addEventListener('click', async () => {
            if (currentPage < totalPages) {
                currentPage++;
                await fetchAlbumsByPage(currentPage, itemsPerPage);
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

async function fetchAlbumsByPage(page, limit) {
    const response = await fetch(`${BASE_URL}chill/mySavedAlbumsLimit?page=${page}&limit=${limit}`);
    if (!response.ok) {
        throw new Error('Failed to fetch country albums');
    }
    const data = await response.json();
    const albums = data;

    console.log(albums)

    const container = document.getElementById('albums-container');
    container.innerHTML = ''; 

    albums.forEach(albums => {
        const info = document.createElement('div');
        info.classList.add('info');

        const img = document.createElement('img');
        img.src = albums.album.images[0].url;

        const title = document.createElement('h2');
        title.textContent = albums.album.name;

        const button = document.createElement('button');
        button.textContent = 'View Now';
        button.addEventListener('click', function() {
            viewAlbums(albums.album.id);
        });

        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('bx', 'bx-x-circle');

        deleteIcon.addEventListener('click', async () => {
            const response = await fetch(`${BASE_URL}chill/remove-album/${albums.album.id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Failed to delete country album on Spotify');
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

function viewAlbums(albumsId) {
    window.location.href = `/selectedAlbum?id=${albumsId}`;
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