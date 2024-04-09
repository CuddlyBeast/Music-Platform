document.addEventListener('DOMContentLoaded', async function() {
    try {
         const urlParams = new URLSearchParams(window.location.search);
         const playlistId = urlParams.get('id');

         console.log(playlistId)

         const token = localStorage.getItem('token');
 
         const response = await fetch(`http://localhost:3000/chill/personalPlaylist/${playlistId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
            });
         if (!response.ok) {
             throw new Error('Failed to fetch playlist details');
         }
        const playlist = await response.json();

        const myPlaylist = playlist[0];

        console.log('playlist info', playlist);

        const playlistInfo = document.querySelector('.trending');
        playlistInfo.innerHTML = `
            <div class="left">
                <div class="info">
                    <h2>${myPlaylist.Playlist.title}</h2>
                    <h4>Last Updated: ${myPlaylist.Playlist.updatedAt.slice(11, 19)} | ${myPlaylist.Playlist.updatedAt.slice(0, 10)} </h4>
                    <h5>Created At: ${myPlaylist.Playlist.createdAt.slice(11, 19)} | ${myPlaylist.Playlist.createdAt.slice(0, 10)}</h5> 
                    <div class="buttons">
                        <button>Follow</button>
                        <i class='bx bxs-heart'></i>
                    </div>
                </div>
            </div> 
            <img src="${myPlaylist.Playlist.image}">
        `;


        const tracksContainer = document.querySelector('.playlist .music-list .items');
        tracksContainer.innerHTML = '';
        playlist.forEach((track, index) => {
            const trackItem = document.createElement('div');
            trackItem.classList.add('item');
            trackItem.innerHTML = `
                <div class="info">
                    <p>${index + 1}</p>
                    <div class="details">
                        <h5>${track.Track.title}</h5>
                        <p>${track.Track.artist}</p>
                    </div>
                </div>
                <div class="actions">
                    <p>${formatDuration(track.Track.durationMs)}</p>
                    <div class="icon">
                        <i class='bx bxs-right-arrow'></i>
                    </div>
                    <i class='bx bxs-plus-square'></i>
                </div>
            `;
            tracksContainer.appendChild(trackItem);
        });
    } catch (error) {
        console.error('Error:', error);
    }
})


function formatDuration(duration_ms) {
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = ((duration_ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}