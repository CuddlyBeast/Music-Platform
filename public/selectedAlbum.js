document.addEventListener('DOMContentLoaded', async function() {
    try {
         const urlParams = new URLSearchParams(window.location.search);
         const albumsId = urlParams.get('id');
 
         const response = await fetch(`http://localhost:3000/chill/albums/${albumsId}`);
         if (!response.ok) {
             throw new Error('Failed to fetch albums details');
         }
        const albums = await response.json();

        console.log(albums);

        const albumsInfo = document.querySelector('.trending');
        albumsInfo.innerHTML = `
            <div class="left">
                <div class="info">
                    <h2>${albums.name}</h2>
                    <h4>${albums.artist}</h4>
                    <h5>${albums.release_date}</h5>
                    <div class="buttons">
                        <button>Follow</button>
                        <i class='bx bxs-heart'></i>
                    </div>
                </div>
            </div> 
            <img src="${albums.images[0].url}">
        `;


        const tracksContainer = document.querySelector('.playlist .music-list .items');
        tracksContainer.innerHTML = '';
        albums.tracks.forEach((track, index) => {
            const trackItem = document.createElement('div');
            trackItem.classList.add('item');
            trackItem.innerHTML = `
                <div class="info">
                    <p>${index + 1}</p>
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