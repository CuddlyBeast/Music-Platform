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
        // Fetch recommendations based on dynamically changing artists
        const recommendationsResponse = await spotifyApi.getRecommendations({
            limit: 100, 
            seed_artists: artistIds, 
            market: 'US'
        });
    
        const recommendationTracks = recommendationsResponse.body.tracks.map(track => ({
            title: track.name,
            artists: track.artists.map(artist => artist.name).join(', '),
            albumImageUrl: track.album.images[0].url,
            duration: formatDuration(track.duration_ms)
        }));
    
        // Combine top tracks and recommendations
        const allSongsWithRecommendations = [...allSongs, ...recommendationTracks];
    
        res.json({ songs: allSongsWithRecommendations });
    } catch (error) {
        console.error('Error fetching top tracks and recommendations:', error);
        res.status(500).json({ error: 'An error occurred while fetching top tracks and recommendations.' });
    }
});

// Route for retrieving Spotify country playlists
router.get('/playlists/country', ensureAccessToken, async (req, res) => {
    try {
        const { page, limit } = req.query;
        const offset = (page - 1) * limit;
 
        const countryPlaylists = await spotifyApi.getPlaylistsForCategory('country', { limit, offset });

        const playlists = countryPlaylists.body.playlists.items.map(playlist => ({
            id: playlist.id,
            name: playlist.name,
            imageUrl: playlist.images.length > 0 ? playlist.images[0].url : '', 
            tracksUrl: playlist.tracks.href 
        }));

        res.json({ playlists });
    } catch (error) {
        console.error('Error retrieving country playlists:', error);
        res.status(500).json({ error: 'An error occurred while retrieving country playlists.' });
    }
});

router.get('/playlists/total', ensureAccessToken, async (req, res) => {
    try {
        const countryPlaylists = await spotifyApi.getPlaylistsForCategory('country', {limit: 50});

        const playlists = countryPlaylists.body.playlists.items.map(playlist => ({
            id: playlist.id,
            name: playlist.name,
            imageUrl: playlist.images.length > 0 ? playlist.images[0].url : '', 
            tracksUrl: playlist.tracks.href 
        }));

        res.json({ playlists });
    } catch (error) {
        console.error('Error retrieving country playlists:', error);
        res.status(500).json({ error: 'An error occurred while retrieving country playlists.' });
    }
})

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

// Route for retrieving details of a specific album from Spotify
router.get('/albums/:id', ensureAccessToken, async (req, res) => {
    try {
        const albumId = req.params.id;
       
        const album = await spotifyApi.getAlbum(albumId);

        const albumDetails = {
            album_type: album.body.album_type,
            artist: album.body.artists.map(artist => artist.name).join(', '),
           available_markets: album.body.available_markets,
            copyrights: album.body.copyrights,
            external_ids: album.body.external_ids,
            external_urls: album.body.external_urls,
            genres: album.body.genres,
            href: album.body.href,
            id: album.body.id,
            images: album.body.images,
            label: album.body.label,
            name: album.body.name,
            popularity: album.body.popularity,
            release_date: album.body.release_date,
            release_date_precision: album.body.release_date_precision,
            total_tracks: album.body.total_tracks,
            tracks: album.body.tracks.items.map(item => ({
                name: item.name,
                artist: item.artists.map(artist => artist.name).join(', '),
                duration: formatDuration(item.duration_ms)
            }))
        };

        res.json(albumDetails);
    } catch (error) {
        console.error('Error retrieving album:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the album.' });
    }
});



function formatDuration(duration_ms) {
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = ((duration_ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}



router.get('/newCountry', ensureAccessToken, async (req, res) => {
    const { q, type } = req.query; // q is the search query, type is the type of search (playlist, artist, track)
    
    try {
        let searchResults = null;

        if (type === 'playlist') {
            // Search for playlists containing keywords related to country genre
            searchResults = await searchCountryPlaylists(q);
        } else {
            // Perform a regular search for artists or tracks
            searchResults = await spotifyApi.search(q, [type]);
        }
        
        res.json(searchResults.body);
    } catch (error) {
        console.error('Error searching on Spotify:', error);
        res.status(500).json({ error: 'An error occurred while searching on Spotify.' });
    }
});

async function searchCountryPlaylists(query) {
    try {
        const playlistsResponse = await spotifyApi.search(query, ['playlist']);
        const playlists = playlistsResponse.body.playlists.items;

        const filteredPlaylists = playlists.filter(playlist => {

            const keywords = ['country', 'country music', 'country hits',]; 
            const playlistName = playlist.name.toLowerCase();
            const playlistDescription = playlist.description.toLowerCase();
            const ownerDisplayName = playlist.owner.display_name.toLowerCase();

            return keywords.some(keyword =>
                playlistName.includes(keyword) ||
                playlistDescription.includes(keyword) ||
                ownerDisplayName.includes(keyword)
            );
        });

        return { body: { playlists: filteredPlaylists } };
    } catch (error) {
        throw error;
    }
}

router.get('/newCountryLimit', ensureAccessToken, async (req, res) => {
    try {
        const { q, page, limit } = req.query;
        const offset = (page - 1) * limit;

        // Search for country playlists from Spotify based on the query
        const searchResults = await limitSearchCountryPlaylists(q, { limit, offset });

        const playlists = searchResults.body.playlists.items.map(playlist => ({
            id: playlist.id,
            name: playlist.name,
            imageUrl: playlist.images.length > 0 ? playlist.images[0].url : '', 
            tracksUrl: playlist.tracks.href 
        }));

        res.json({ playlists });
    } catch (error) {
        console.error('Error searching country playlists:', error);
        res.status(500).json({ error: 'An error occurred while searching country playlists.' });
    }
});

async function limitSearchCountryPlaylists(query, options) {
    try {
        // Search for country playlists containing keywords related to the query
        const playlistsResponse = await spotifyApi.search(query, ['playlist'], options);
        return playlistsResponse;
    } catch (error) {
        throw error;
    }
}



// Route for retrieving new album releases in the country genre 
router.get('/albumsTotal', ensureAccessToken, async (req, res) => {
    try {
        
        // Search for albums linked to the country genre
        const albumsResponse = await spotifyApi.searchAlbums('country', { limit: 50 });

        // Extract album objects from the response
        const newCountryAlbums = albumsResponse.body.albums.items;

        // Map the albums to the desired format
        const newAlbums = newCountryAlbums.map(album => ({
            id: album.id,
            name: album.name,
            imageUrl: album.images.length > 0 ? album.images[0].url : '', 
            artists: album.artists.map(artist => artist.name),
            releaseDate: album.release_date,
            tracksUrl: album.tracks && album.tracks.href 
        }));


        res.json({ newAlbums });
    } catch (error) {
        console.error('Error retrieving new country albums:', error);
        res.status(500).json({ error: 'An error occurred while retrieving new country albums.' });
    }
});


// Route for retrieving popular album releases in the country genre
router.get('/albumsLimit', ensureAccessToken, async (req, res) => {
    try {
        const { page, limit } = req.query;
        const offset = (page - 1) * limit;
        
        // Search for albums linked to the country genre
        const albumsResponse = await spotifyApi.searchAlbums('country', { limit: limit, offset: offset });

        // Extract album objects from the response
        const newCountryAlbums = albumsResponse.body.albums.items;

        // Map the albums to the desired format
        const newAlbums = newCountryAlbums.map(album => ({
            id: album.id,
            name: album.name,
            imageUrl: album.images.length > 0 ? album.images[0].url : '', 
            artists: album.artists.map(artist => artist.name),
            releaseDate: album.release_date,
            tracksUrl: album.tracks && album.tracks.href 
        }));
       
        res.json({ newAlbums });
    } catch (error) {
        console.error('Error retrieving popular country albums:', error);
        res.status(500).json({ error: 'An error occurred while retrieving popular country albums.' });
    }
});






router.get('/artistsTotal', ensureAccessToken, async (req, res) => {
    try {

        const countryArtists = await spotifyApi.searchArtists('country', { limit: 50 }); 
        const artistIds = countryArtists.body.artists.items.map(artist => artist.id);
        
        // Fetch albums of country genre artists
        const countryAlbumsPromises = artistIds.map(async (artistId) => {
            const albumsResponse = await spotifyApi.getArtistAlbums(artistId);
            return albumsResponse.body.items;
        });
        
        // Wait for all album requests to complete
        const countryAlbumsResponses = await Promise.all(countryAlbumsPromises);
        
        // Flatten the array of album arrays into a single array of albums
        const countryAlbums = countryAlbumsResponses.flat();
        
        // Map the albums to the desired format
        const formattedAlbums = countryAlbums.map(album => ({
            id: album.id,
            name: album.name,
            imageUrl: album.images.length > 0 ? album.images[0].url : '', 
            artists: album.artists.map(artist => artist.name),
            releaseDate: album.release_date,
            tracksUrl: album.tracks && album.tracks.href 
        }));


        res.json({ newAlbums, formattedAlbums });
    } catch (error) {
        console.error('Error retrieving new country albums:', error);
        res.status(500).json({ error: 'An error occurred while retrieving new country albums.' });
    }
});

// Route for retrieving popular artists releases in the country genre
router.get('/artistsLimit', ensureAccessToken, async (req, res) => {
    try {
         // Retrieve popular album releases in the country genre from Spotify with limitations
         const countryArtists = await spotifyApi.searchArtists('country', { limit: 50 }); 
         const artistIds = countryArtists.body.artists.items.map(artist => artist.id);
         
         // Fetch albums of country genre artists
         const countryAlbumsPromises = artistIds.map(async (artistId) => {
             const albumsResponse = await spotifyApi.getArtistAlbums(artistId);
             return albumsResponse.body.items;
         });
         
         // Wait for all album requests to complete
         const countryAlbumsResponses = await Promise.all(countryAlbumsPromises);
         
         // Flatten the array of album arrays into a single array of albums
         const countryAlbums = countryAlbumsResponses.flat();
         
         // Map the albums to the desired format
         const formattedAlbums = countryAlbums.map(album => ({
             id: album.id,
             name: album.name,
             imageUrl: album.images.length > 0 ? album.images[0].url : '', 
             artists: album.artists.map(artist => artist.name),
             releaseDate: album.release_date,
             tracksUrl: album.tracks && album.tracks.href 
         }));
 
        res.json({ formattedAlbums });
    } catch (error) {
        console.error('Error retrieving popular country artists:', error);
        res.status(500).json({ error: 'An error occurred while retrieving popular country artists.' });
    }
});


module.exports = router;







        // Couldn't specify country genre with this method

        // const newAlbumsResponse = await spotifyApi.getNewReleases({ country: 'US' });
        // const newAlbums = newAlbumsResponse.body.albums.items.filter(album => {
        //     // Check if the album's genres include 'country'
        //     return album.genres.includes('country');
        // }).map(album => ({
        //     id: album.id,
        //     name: album.name,
        //     imageUrl: album.images.length > 0 ? album.images[0].url : '',
        //     artists: album.artists.map(artist => artist.name),
        //     releaseDate: album.release_date,
        //     tracksUrl: album.tracks && album.tracks.href
        // }));