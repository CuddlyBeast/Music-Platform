document.addEventListener('DOMContentLoaded', async function() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const artistId = urlParams.get('id');

        const itemsPerPage = 8; 
        let currentPage = 1;

        // Fetch total number of albums
        const totalResponse = await fetch(`http://localhost:3000/chill/totalArtistAlbums/${artistId}`);
        if (!totalResponse.ok) {
            throw new Error('Failed to fetch total number of albums');
        }
        const totalData = await totalResponse.json();

        console.log(totalData)
        const totalAlbums = totalData.items.length;

        
        const totalPages = Math.ceil(totalAlbums / itemsPerPage);

        // Fetch initial albums
        await fetchAlbumsByPage(currentPage, itemsPerPage, artistId);

        const paginationContainer = document.getElementById('pagination');
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageLink = document.createElement('a');
            pageLink.href = '#';
            pageLink.textContent = i;
            pageLink.addEventListener('click', async () => {
                currentPage = i;
                await fetchAlbumsByPage(currentPage, itemsPerPage, artistId);
            });
            paginationContainer.appendChild(pageLink);
        }

        const nextPageButton = document.createElement('a');
        nextPageButton.href = '#';
        nextPageButton.innerHTML = '<i class="bx bx-right-arrow-alt"></i>';
        nextPageButton.addEventListener('click', async () => {
            if (currentPage < totalPages) {
                currentPage++;
                await fetchAlbumsByPage(currentPage, itemsPerPage, artistId);
            }
        });

        paginationContainer.appendChild(nextPageButton);

    } catch (error) {
        console.error('Error:', error);
    }
});

async function fetchAlbumsByPage(page, limit, artistId) {
    const response = await fetch(`http://localhost:3000/chill/limitArtistAlbums/${artistId}?page=${page}&limit=${limit}`);
    if (!response.ok) {
        throw new Error('Failed to fetch country albums');
    }
    const data = await response.json();
    const albums = data.items;

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