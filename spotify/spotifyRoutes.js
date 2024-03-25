const SpotifyWebApi = require('spotify-web-api-node');

async function connectToSpotifyAPI() {
  try {
    // Create a new instance of SpotifyWebApi with your client credentials
    const spotifyApi = new SpotifyWebApi({
      clientId: '1e69079ae7904703a2c03ecab6c95f99',
      clientSecret: '884af1572aaf41b7a20721b833844e63'
    });

    // Authenticate your application
    const data = await spotifyApi.clientCredentialsGrant();
    const accessToken = data.body['access_token'];

    // Set access token to be used for subsequent requests
    spotifyApi.setAccessToken(accessToken);

    // Make requests to Spotify API
    const trackData = await spotifyApi.getTrack('2TpxZ7JUBn3uw46aR7qd6V');

    // Handle response data
    console.log('Track:', trackData.body);
  } catch (error) {
    // Handle authentication or request errors
    console.error('Error:', error);
  }
}

module.exports = { connectToSpotifyAPI };


