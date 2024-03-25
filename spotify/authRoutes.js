const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');


const spotifyApi = new SpotifyWebApi({
    clientId: '1e69079ae7904703a2c03ecab6c95f99',
    clientSecret: '884af1572aaf41b7a20721b833844e63',
    redirectUri: 'http://localhost:3000/'
  });

// Define the route for initiating the Spotify authentication flow
router.get('/auth', (req, res) => {
    // Construct the Spotify authorization URL
    const clientId = '1e69079ae7904703a2c03ecab6c95f99';
    const redirectUri = 'http://localhost:3000/'; // The URL Spotify will redirect back to after authorization
    const scopes = ['user-read-private', 'user-read-email', 'user-read-recently-played', 'user-top-read', 'user-modify-playback-state', 'playlist-read-private', 'user-library-read', 'user-follow-read' ]; // Specify the required scopes
    const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}`;

    // Redirect the user to the Spotify authorization page
    res.redirect(spotifyAuthUrl);
});

router.get('/', async (req, res) => {
    const { code } = req.query;

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token } = data.body;

        console.log('Received access token:', access_token);
        console.log('Received refresh token:', refresh_token);

        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        console.log('Access token and refresh token set.');

        res.send('Authentication successful. You can now use the Spotify API.');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Authentication failed. Please try again.');
    }
});

module.exports = router;
