const menuOpen = document.getElementById('menu-open');
const menuClose = document.getElementById('menu-close');
const sidebar = document.querySelector('.container .sidebar');


menuOpen.addEventListener('click', () => sidebar.style.left = '0');

menuClose.addEventListener('click', () => sidebar.style.left = '-100%');


document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // The access token and refresh token are successful retrieved
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
        try {
            window.location.href = 'http://localhost:3000/chill/auth';
        } catch (error) {
            console.error('Error redirecting for authorization:', error);
        }
    } else {
        try {
            const trackId = '2a5VluIESm1JP4Qwvo02H8';
            const data = await fetchSongData(trackId, accessToken);
            console.log(data);
        } catch (error) {
            console.error('Error fetching song data:', error);
        }
    }


    
    try {
        const response = await fetch('http://localhost:3000/chill/playlists/top-country-songs');
    if (!response.ok) {
        throw new Error('Failed to fetch country song recommendations');
    }

    const data = await response.json();

    // Iterate over the first four songs only
    for (let index = 0; index < 4; index++) {
        const song = data.songs[index];

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

        document.getElementById('recommendations-holder').appendChild(item);
    }
    } catch (error) {
        console.error('Error displaying country song recommendations:', error);
    }


    const items = document.querySelectorAll('.item');

    items.forEach(item => {
        item.addEventListener('click', function() {
            const genre = this.querySelector('p').textContent.replace(/\s+/g, ''); 
            window.location.href = `/genreSongs?genre=${genre}`; 
        });
    });


    try {
        const token = localStorage.getItem('token');
        // Fetch user playlists
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

        // Populate playlists section
        const playlistCreation = document.getElementById('playlist-creation');

        playlistsData.forEach(playlist => {
            const playlistItem = document.createElement('li');
            const playlistLink = document.createElement('a');
            playlistLink.href = '#';
            playlistLink.textContent = playlist.title;
            playlistLink.addEventListener('click', function(event) {
                event.preventDefault();

                const playlistId = playlist.id;
    
                // Redirect to the new page with playlist ID, title, and image in the URL
                window.location.href = `/YouCountryPlaylist?id=${playlistId}`;
            });

            const caretIcon = document.createElement('i');
            caretIcon.classList.add('bx', 'bxs-caret-right-circle');

            playlistItem.appendChild(caretIcon);
            playlistItem.appendChild(playlistLink);
            playlistCreation.appendChild(playlistItem);
        });

    } catch (error) {
        console.error('Error fetching user playlists:', error);
    }


    const createNewPlaylistLink = document.getElementById('createNewPlaylist');
    const playlist = document.getElementById('playlist-creation');
    
    createNewPlaylistLink.addEventListener('click', async function(event) {
        event.preventDefault();
    
        // Prompt the user to enter the name for the new playlist
        const playlistName = prompt('Enter the name for the new playlist:');
        if (!playlistName) return; // Exit if the user cancels

        const words = playlistName.split(' ');
    
        // Check if any word exceeds 19 characters
        const isWordTooLong = words.some(word => word.length > 19);
        if (isWordTooLong) {
            alert('No single word in the playlist name can exceed 19 characters.');
            return;
        }
    
        // Make an HTTP POST request to create a new playlist
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token not found');
            }
    
            const response = await fetch('http://localhost:3000/chill/playlist', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: playlistName })
            });
    
            if (!response.ok) {
                throw new Error('Failed to create playlist');
            }
    
            const playlistData = await response.json();
    
            // Create a new list item for the playlist
            const newPlaylistItem = document.createElement('li');
            const newPlaylistLink = document.createElement('a');
            newPlaylistLink.href = '#';
            newPlaylistLink.textContent = playlistData.Playlist.title;
            newPlaylistLink.addEventListener('click', function(event) {
            event.preventDefault();

            const playlistId = playlist.id;

            // Redirect to the new page with playlist ID, title, and image in the URL
            window.location.href = `/YouCountryPlaylist?id=${playlistId}`;
            });
    
            const caretIcon = document.createElement('i');
            caretIcon.classList.add('bx', 'bxs-caret-right-circle');
    
            newPlaylistItem.appendChild(caretIcon);
            newPlaylistItem.appendChild(newPlaylistLink);
            playlist.appendChild(newPlaylistItem);
        } catch (error) {
            console.error('Error creating playlist:', error);
            alert('Failed to create playlist');
        }
    });


    // Function to fetch user data (replace this with your actual endpoint)
    const fetchUserData = async (token) => {
        try {
            const response = await fetch('http://localhost:3000/chill/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                // Update username
                updateUsername(userData.username);
            } else {
                console.error('Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };


    const usernameElement = document.getElementById('username');

    // Function to update username
    const updateUsername = (username) => {
        usernameElement.textContent = username;
    };

    // Check if the user is logged in to YouCountry?
    const token = localStorage.getItem('token');
    if (token) {
        // Fetch user details and update username
        fetchUserData(token);
    }

});



const fetchSongData = async (trackId, accessToken) => {
    try {
        const response = await fetch(`http://localhost:3000/chill/tracks/${trackId}`, {
            headers: {
                Authorization: `Bearer ${accessToken}` 
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching song data:', error);
        return null;
    }
};

