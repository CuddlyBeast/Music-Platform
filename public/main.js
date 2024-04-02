document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Fetch country playlists from your backend
        const response = await fetch('http://localhost:3000/chill/playlists/country');
        if (!response.ok) {
            throw new Error('Failed to fetch country playlists');
        }
        const data = await response.json();
        const playlists = data.playlists;

        // Populate items with playlist data
        const container = document.getElementById('playlist-container');
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

            const buttonsContainer = document.createElement('div');
            buttonsContainer.classList.add('buttons');
            buttonsContainer.appendChild(button);
            buttonsContainer.appendChild(heartIcon);

            info.appendChild(img);
            info.appendChild(title);
            info.appendChild(buttonsContainer);

            container.appendChild(info);
        });
    } catch (error) {
        console.error('Error:', error);
    }
});

function viewPlaylist(playlistId) {
    window.location.href = `/playlist?id=${playlistId}`;
}









// const paginationContainer = document.getElementById('pagination');


// document.addEventListener('DOMContentLoaded', async function() {

//     paginationContainer.innerHTML = '';

//     const totalPages = Math.ceil(data.length / itemsPerPage);

//     for (let i = 1; i <= totalPages; i++) {
//         const pageLink = document.createElement('a');
//         pageLink.href = '#';
//         pageLink.textContent = i;
//         pageLink.addEventListener('click', () => {
//             currentPage = i;
//             displayTableServiceData(data);
//         });
//         paginationContainer.appendChild(pageLink);
//     }

//     const nextPageButton = document.createElement('a');
//     nextPageButton.href = '#';
//     nextPageButton.innerHTML = '<i class="bx bx-right-arrow-alt"></i>';
//     nextPageButton.addEventListener('click', () => {
//         if (currentPage < totalPages) {
//             currentPage++;
//             displayTableServiceData(data);
//         }
//     });
//     paginationContainer.appendChild(nextPageButton);

// })