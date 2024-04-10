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
                displayOverlayMenu(event, song, playlistContainer);
            });

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

function populateOverlayMenu(playlists) {
    const playlistContainer = document.createElement('div');
    playlistContainer.classList.add('playlist-container');

    playlistContainer.innerHTML = '';

    console.log(playlists)

    playlists.forEach(playlist => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = playlist.title;
        checkbox.id = playlist.id;
        checkbox.classList.add('playlist-checkbox');

        const label = document.createElement('label');
        label.textContent = playlist.title;
        label.setAttribute('for', checkbox.id);

        playlistContainer.appendChild(checkbox);
        playlistContainer.appendChild(label);
    });

    return playlistContainer;
}

function displayOverlayMenu(event, song, playlistContainer) {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const menu = document.createElement('div');
    menu.classList.add('menu-playlist');

    const header = document.createElement('h2');
    header.textContent = 'Add to Playlist';

    const closeButton = document.createElement('span');
    closeButton.classList.add('close');
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });


    const addButton = document.createElement('button');
    addButton.textContent = 'Add';
    addButton.addEventListener('click', async () => {
        const selectedPlaylists = Array.from(document.querySelectorAll('.playlist-checkbox:checked')).map(checkbox => checkbox.id);
        const token = localStorage.getItem('token');
        console.log(song)
        const spotifyId = song.id; 
        const action = 'add';
        try {
            const promises = selectedPlaylists.map(playlistId => {
                return fetch(`http://localhost:3000/chill/personalPlaylist/${playlistId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ spotifyId, action })
                });
            });

            const responses = await Promise.all(promises);

            if (responses.every(response => response.ok)) {
                const spotifyResponse = await fetch(`http://localhost:3000/chill/tracks/${spotifyId}`);
                if (!spotifyResponse.ok) {
                    throw new Error('Failed to fetch track details from Spotify');
                }
                const trackData = await spotifyResponse.json();

                console.log(trackData)
                const trackSpotifyId = trackData.id
                console.log(trackSpotifyId)
                const trackTitle = trackData.name
                const trackArtist = trackData.artists.map(artist => artist.name).join(', ');
                const trackAlbum = trackData.album.name
                const trackDurationMs = trackData.duration_ms
        
                // Post track details to your database
                const trackPostResponse = await fetch('http://localhost:3000/chill/track', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ trackSpotifyId, trackTitle, trackArtist, trackAlbum, trackDurationMs })
                });
        
                if (!trackPostResponse.ok) {
                    throw new Error('Failed to add track to database');
                }
        
            } else {
                throw new Error('Failed to add tracks to some playlists');
            }
        } catch (error) {
            console.error('Error adding tracks to playlists:', error);
        }

        document.body.removeChild(overlay);
    });

    menu.appendChild(header);
    menu.appendChild(closeButton);
    menu.appendChild(playlistContainer);
    menu.appendChild(addButton);

    overlay.appendChild(menu);
    document.body.appendChild(overlay);
    event.stopPropagation(); // Prevent click event from bubbling up
}