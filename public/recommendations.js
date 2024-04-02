document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('http://localhost:3000/chill/playlists/top-country-songs');
        if (!response.ok) {
            throw new Error('Failed to fetch country song recommendations');
        }

        const data = await response.json();

        data.songs.forEach((song, index) => {
            const item = document.createElement('div');
            item.classList.add('item');

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

            actions.appendChild(duration);
            actions.appendChild(icon);
            actions.appendChild(plusIcon);

            item.appendChild(info);
            item.appendChild(actions);

            document.querySelector('.items').appendChild(item);
        });
    } catch (error) {
        console.error('Error displaying country song recommendations:', error);
    }
});
