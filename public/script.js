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


