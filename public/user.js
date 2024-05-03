let BASE_URL = 'https://your-heroku-app.herokuapp.com/';

document.addEventListener('DOMContentLoaded', async function() {

try {
    const token = localStorage.getItem('token');
    // Fetch user playlists
    const playlistsResponse = await fetch(`${BASE_URL}chill/playlists`, {
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

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token not found');
        }

        const response = await fetch(`${BASE_URL}chill/playlist`, {
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


// Function to fetch user data
const fetchUserData = async (token) => {
    try {
        const response = await fetch(`${BASE_URL}chill/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const userData = await response.json();

            updateUsername(userData.username);

            addLogoutButton();
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
})

const addLogoutButton = () => {
    const logoutButton = document.createElement('button');
    logoutButton.id = 'logout-button';
    logoutButton.textContent = 'Logout';
    logoutButton.addEventListener('click', async () => {
    try {
        const response = await fetch(`${BASE_URL}chill/logout`, {
            method: 'POST'
        });

        if (response.ok) {
        // Clear the token from localStorage
        localStorage.removeItem('token');
        // Redirect to the login page or any other desired action
        window.location.href = '/'; 
        } else {
            console.error('Failed to fetch logout response');
        }
    } catch (error) {
        console.error('Error Logging Out User:', error);
    }
    });

     const profileElement = document.querySelector('.profile');

    const userElement = document.querySelector('.user');

    profileElement.insertBefore(logoutButton, userElement);
};