document.addEventListener('DOMContentLoaded', async function() {
    try {
         const urlParams = new URLSearchParams(window.location.search);
         const playlistId = urlParams.get('id');
 
         const response = await fetch(`http://localhost:3000/chill/playlists/${playlistId}`);
         if (!response.ok) {
             throw new Error('Failed to fetch playlist details');
         }
        const playlist = await response.json();

        console.log(playlist);

        const playlistInfo = document.querySelector('.trending');
        playlistInfo.innerHTML = `
            <div class="left">
                <div class="info">
                    <h2>${playlist.name}</h2>
                    <h4>${playlist.description}</h4>
                    <h5>${playlist.playCount} Plays</h5>
                    <div class="buttons">
                        <button>Follow</button>
                        <i class='bx bxs-heart'></i>
                    </div>
                </div>
            </div> 
            <img src="${playlist.imageUrl}">
        `;


        const tracksContainer = document.querySelector('.playlist .music-list .items');
        tracksContainer.innerHTML = '';
        playlist.tracks.forEach((track, index) => {
            const trackItem = document.createElement('div');
            trackItem.classList.add('item');
            trackItem.innerHTML = `
                <div class="info">
                    <p>${index + 1}</p>
                    <img src="${track.imageUrl}">
                    <div class="details">
                        <h5>${track.name}</h5>
                        <p>${track.artist}</p>
                    </div>
                </div>
                <div class="actions">
                    <p>${track.duration}</p>
                    <div class="icon">
                        <i class='bx bxs-right-arrow'></i>
                    </div>
                    <i class='bx bxs-plus-square'></i>
                </div>
            `;

            const plusIcon = trackItem.querySelector('.bx.bxs-plus-square');

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

            tracksContainer.appendChild(trackItem);
        });
    } catch (error) {
        console.error('Error:', error);
    }
})
