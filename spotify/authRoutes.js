const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');


const spotifyApi = new SpotifyWebApi({
    clientId: '1e69079ae7904703a2c03ecab6c95f99',
    clientSecret: '884af1572aaf41b7a20721b833844e63',
    redirectUri: 'http://youcountry.herokuapp.com/chill/callback'
  });

// local env redirect:  'http://localhost:3000/chill/callback'

router.get('/auth', (req, res) => {
    const clientId = '1e69079ae7904703a2c03ecab6c95f99';
    const redirectUri = 'http://youcountry.herokuapp.com/chill/callback'; 
    const scopes = ['user-read-private', 'user-read-email', 'user-read-recently-played', 'user-top-read', 'user-modify-playback-state', 'playlist-read-private', 'user-library-read', 'user-library-modify', 'user-follow-read', 'playlist-modify-public', 'playlist-modify-private', 'streaming', 'user-read-playback-state' ]; // Specify the required scopes
    const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}`;

    res.redirect(spotifyAuthUrl);
});

router.get('/callback', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Authorization code not provided');
    }

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token } = data.body;

        console.log('Received access token:', access_token);
        console.log('Received refresh token:', refresh_token);


        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);

        console.log('Access token and refresh token set.');

        res.redirect(`http://localhost:3000/?access_token=${access_token}&refresh_token=${refresh_token}`)
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Authentication failed. Please try again.');
    }
});

module.exports = {
    spotifyApi: spotifyApi,
    router: router
};
