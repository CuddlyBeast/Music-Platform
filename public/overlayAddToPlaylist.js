function populateOverlayMenu(playlists) {
    const playlistContainer = document.createElement('div');
    playlistContainer.classList.add('playlist-container');

    playlistContainer.innerHTML = '';

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
        const spotifyId = song; 
        const action = 'add';
        try {
            const promises = selectedPlaylists.map(playlistId => {
                return fetch(`${process.env.BASE_URL}chill/personalPlaylist/${playlistId}`, {
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
                const spotifyResponse = await fetch(`${process.env.BASE_URL}chill/tracks/${spotifyId}`);
                if (!spotifyResponse.ok) {
                    throw new Error('Failed to fetch track details from Spotify');
                }
                const trackData = await spotifyResponse.json();

                console.log(trackData)
                const trackSpotifyUri = trackData.uri
                const trackSpotifyId = trackData.id
                const trackTitle = trackData.name
                const trackArtist = trackData.artists.map(artist => artist.name).join(', ');
                const trackAlbum = trackData.album.name
                const trackDurationMs = trackData.duration_ms
                const trackReleaseDate = trackData.album.release_date
                const trackImage = trackData.album.images[0].url
        
                // Post track details to your database
                const trackPostResponse = await fetch(`${process.env.BASE_URL}chill/track`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ spotifyId:trackSpotifyId, title:trackTitle, artist:trackArtist, album:trackAlbum, durationMs:trackDurationMs, releaseDate:trackReleaseDate, image: trackImage, uri: trackSpotifyUri })
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