const express = require('express');
const router = express.Router();
const { spotifyApi } = require('./authRoutes');


const ensureAccessToken = async (req, res, next) => {
  if (!spotifyApi.getAccessToken()) {
      return res.status(401).json({ error: 'Access token missing or expired' });
  }

  try {
      // Make a test request to Spotify API to check if the access token is still valid
      await spotifyApi.getMe();
  } catch (error) {
      if (error.statusCode === 401) {
          // Access token expired, attempt to refresh it
          try {
              const data = await spotifyApi.refreshAccessToken();
              const access_token = data.body['access_token'];
              spotifyApi.setAccessToken(access_token);
              req.access_token = access_token; // Store the new access token in the request object
          } catch (error) {
              return res.status(500).json({ error: 'Failed to refresh access token' });
          }
      } else {
          console.error('Error checking access token:', error);
          return res.status(500).json({ error: 'An error occurred while checking access token' });
      }
  }

  next();
};

// Route for retrieving details of a specific track from Spotify
router.get('/tracks/:trackId', ensureAccessToken, async (req, res) => {
    const { trackId } = req.params;
    try {
        const track = await spotifyApi.getTrack(trackId);
        res.json(track.body);
    } catch (error) {
        console.error('Error retrieving track:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the track.' });
    }
});



// Route for retrieving details of a specific album from Spotify
router.get('/albums/:albumId', ensureAccessToken, async (req, res) => {
    const { albumId } = req.params;
    try {
        const album = await spotifyApi.getAlbum(albumId);
        res.json(album.body);
    } catch (error) {
        console.error('Error retrieving album:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the album.' });
    }
});



// Route for retrieving details of a specific artist from Spotify
router.get('/artists/:artistId', ensureAccessToken, async (req, res) => {
    const { artistId } = req.params;
    try {
        const artist = await spotifyApi.getArtist(artistId);
        res.json(artist.body);
    } catch (error) {
        console.error('Error retrieving artist:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the artist.' });
    }
});



// Route for searching tracks, albums, or artists on Spotify 
router.get('/search', ensureAccessToken, async (req, res) => {
    const { q, type } = req.query; // q is the search query, type is the type of search (track, album, artist)
    try {
        const searchResults = await spotifyApi.search(q, [type]);
        res.json(searchResults.body);
    } catch (error) {
        console.error('Error searching on Spotify:', error);
        res.status(500).json({ error: 'An error occurred while searching on Spotify.' });
    }
});

module.exports = router;

