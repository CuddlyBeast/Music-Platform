

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

        console.log(data);

        if (filter === 'tracks') {

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
                displayOverlayMenu(event, track.track.id, playlistContainer);
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

        const totalAlbums = data.newAlbums.length;

        
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

    } else if (filter === 'artists') {

    } else if (filter === 'playlists') {

    }


    } catch (error) {
        console.error('Error displaying searched items:', error);
    }
});




function formatDuration(duration_ms) {
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = ((duration_ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}


// Need to change response and make limit search function 

async function fetchAlbumsByPage(page, limit) {
    const response = await fetch(`http://localhost:3000/chill/albumsLimit?page=${page}&limit=${limit}`);
    if (!response.ok) {
        throw new Error('Failed to fetch country albums');
    }
    const data = await response.json();
    const albums = data.newAlbums;

    const container = document.getElementById('albums-container');
    container.innerHTML = ''; 

    albums.forEach(albums => {
        const info = document.createElement('div');
        info.classList.add('info');

        const img = document.createElement('img');
        img.src = albums.imageUrl;

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