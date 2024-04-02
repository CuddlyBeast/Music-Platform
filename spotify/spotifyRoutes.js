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

// Route for retrieving the top country songs from Spotify
router.get('/playlists/top-country-songs', ensureAccessToken, async (req, res) => {
    try {

        const topTracks = await spotifyApi.getRecommendations({
            limit: 50,
            seed_genres: ['country'], 
            min_popularity: 10, 
            market: 'US', 
        });

        const topCountrySongs = topTracks.body.tracks.map(item => ({
            title: item.name,
            artist: item.artists.map(artist => artist.name).join(', '),
            albumImageUrl: item.album.images[0].url,
            duration: formatDuration(item.duration_ms)
        }));

        res.json({ songs: topCountrySongs });
    } catch (error) {
        console.error('Error retrieving recommended country songs:', error);
        res.status(500).json({ error: 'An error occurred while retrieving recommended country songs.' });
    }
});

router.post('/genre-songs', ensureAccessToken, async (req, res) => {
    const { artistIds } = req.body;
    try {
        const allSongs = [];
        for (const artistId of artistIds) {
            const response = await spotifyApi.getArtistTopTracks(artistId, 'US');
            const topTracks = response.body.tracks.map(track => ({
                title: track.name,
                artists: track.artists.map(artist => artist.name).join(', '),
                albumImageUrl: track.album.images[0].url,
                duration: formatDuration(track.duration_ms)
            }));
            allSongs.push(...topTracks);
        }
        res.json({ songs: allSongs });
    } catch (error) {
        console.error('Error fetching top tracks:', error);
        res.status(500).json({ error: 'An error occurred while fetching top tracks.' });
    }
});

// Route for retrieving Spotify country playlists
router.get('/playlists/country', ensureAccessToken, async (req, res) => {
    try {
        // Retrieve country playlists from Spotify
        const countryPlaylists = await spotifyApi.getPlaylistsForCategory('country', { limit: 10 });

        const playlists = countryPlaylists.body.playlists.items.map(playlist => ({
            id: playlist.id,
            name: playlist.name,
            imageUrl: playlist.images.length > 0 ? playlist.images[0].url : '', // Use the first image if available
            tracksUrl: playlist.tracks.href // URL to fetch tracks of the playlist
        }));

        res.json({ playlists });
    } catch (error) {
        console.error('Error retrieving country playlists:', error);
        res.status(500).json({ error: 'An error occurred while retrieving country playlists.' });
    }
});

// Route for retrieving details of a specific playlist from Spotify
router.get('/playlists/:id', ensureAccessToken, async (req, res) => {
    try {
        const playlistId = req.params.id;
       
        const playlist = await spotifyApi.getPlaylist(playlistId);

        const playlistDetails = {
            name: playlist.body.name,
            description: playlist.body.description,
            playCount: playlist.body.tracks.total,
            imageUrl: playlist.body.images.length > 0 ? playlist.body.images[0].url : '',
            tracks: playlist.body.tracks.items.map(item => ({
                name: item.track.name,
                artist: item.track.artists.map(artist => artist.name).join(', '),
                imageUrl: item.track.album.images.length > 0 ? item.track.album.images[0].url : '',
                duration: formatDuration(item.track.duration_ms)
            }))
        };

        res.json(playlistDetails);
    } catch (error) {
        console.error('Error retrieving playlist:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the playlist.' });
    }
});



function formatDuration(duration_ms) {
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = ((duration_ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}


module.exports = router;

