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




// Route for retrieving the top country recommendations from Spotify
router.get('/playlists/top-country-songs', ensureAccessToken, async (req, res) => {
    try {

        const topTracks = await spotifyApi.getRecommendations({
            limit: 50,
            seed_genres: ['country'], 
            min_popularity: 10, 
            market: 'US', 
        });

        const topCountrySongs = topTracks.body.tracks.map(item => ({
            uri: item.uri,
            id: item.id,
            title: item.name,
            artist: item.artists.map(artist => artist.name).join(', '),
            albumImageUrl: item.album.images[0].url,
            albumTitle: item.album.name,
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
                uri: track.uri,
                id: track.id,
                title: track.name,
                artist: track.artists.map(artist => artist.name).join(', '),
                albumImageUrl: track.album.images[0].url,
                albumTitle: track.album.name,
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
            uri: track.uri,
            id: track.id,
            title: track.name,
            artist: track.artists.map(artist => artist.name).join(', '),
            albumImageUrl: track.album.images[0].url,
            albumTitle: track.album.name,
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
            id: playlist.body.id,
            name: playlist.body.name,
            description: playlist.body.description,
            playCount: playlist.body.tracks.total,
            imageUrl: playlist.body.images.length > 0 ? playlist.body.images[0].url : '',
            tracks: playlist.body.tracks.items.map(item => ({
                uri: item.track.uri,
                id: item.track.id,
                name: item.track.name,
                artist: item.track.artists.map(artist => artist.name).join(', '),
                imageUrl: item.track.album.images.length > 0 ? item.track.album.images[0].url : '',
                albumTitle: item.track.album.name,
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
                uri: item.uri,
                id: item.id,
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

        const topArtistsResponse = await spotifyApi.getPlaylistsForCategory('country', { limit: 1 });
        const playlistId = topArtistsResponse.body.playlists.items[0].id;
        const playlistTracksResponse = await spotifyApi.getPlaylistTracks(playlistId, { limit: 100 });

        // Create a set of unique artist IDs
        const artistIdsSet = new Set();
        playlistTracksResponse.body.items.forEach(item => {
            artistIdsSet.add(item.track.artists[0].id);
        });

        const artistIds = Array.from(artistIdsSet);

        // Fetch information about the top country artists
        const artistsInfoPromises = artistIds.map(async artistId => {
            const artistInfoResponse = await spotifyApi.getArtist(artistId);
            const artistInfo = artistInfoResponse.body;
            return {
                id: artistInfo.id,
                name: artistInfo.name,
                imageUrl: artistInfo.images.length > 0 ? artistInfo.images[0].url : '',
                popularity: artistInfo.popularity,
                followers: artistInfo.followers.total
            };
        });

        const artistsInfo = await Promise.all(artistsInfoPromises);

        res.json({ artistsInfo });
    } catch (error) {
        console.error('Error retrieving popular country artists:', error);
        res.status(500).json({ error: 'An error occurred while retrieving popular country artists.' });
    }
});

// Route for retrieving popular artists releases in the country genre
router.get('/artistsLimit', ensureAccessToken, async (req, res) => {
    try {
        const { page, limit } = req.query;
        const offset = (page - 1) * limit;
        const targetOffset = offset + parseInt(limit);

       // Retrieve popular artists releases in the country genre from Spotify with limitations
       const topArtistsResponse = await spotifyApi.getPlaylistsForCategory('country', { limit: 1 });
       const playlistId = topArtistsResponse.body.playlists.items[0].id;
       const playlistTracksResponse = await spotifyApi.getPlaylistTracks(playlistId, { limit: 100 });

       // Create a set of unique artist IDs
       const artistIdsSet = new Set();
       playlistTracksResponse.body.items.forEach(item => {
           artistIdsSet.add(item.track.artists[0].id);
       });

        // Convert the set to an array
        const allArtistIds = Array.from(artistIdsSet);

        // Filter the artist IDs based on the offset and limit
        const paginatedArtistIds = allArtistIds.filter((id, index) => index >= offset && index < targetOffset);


       // Fetch information about the top country artists
       const artistsInfoPromises = paginatedArtistIds.map(async artistId => {
           const artistInfoResponse = await spotifyApi.getArtist(artistId);
           const artistInfo = artistInfoResponse.body;
           return {
               id: artistInfo.id,
               name: artistInfo.name,
               imageUrl: artistInfo.images.length > 0 ? artistInfo.images[0].url : '',
               popularity: artistInfo.popularity,
               followers: artistInfo.followers.total
           };
       });

       const artistsInfo = await Promise.all(artistsInfoPromises);

       res.json({ artistsInfo });
    } catch (error) {
        console.error('Error retrieving popular country with limits:', error);
        res.status(500).json({ error: 'An error occurred while retrieving popular country artists with limits.' });
    }
});



// Route for retrieving the albums of a specific artist from Spotify
router.get('/totalArtistAlbums/:id', ensureAccessToken, async (req, res) => {
    const { id: artistId } = req.params;
    try {
        const artist = await spotifyApi.getArtistAlbums(artistId);
        res.json(artist.body);
    } catch (error) {
        console.error('Error retrieving artist:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the artist albums.' });
    }
});


// Route for retrieving the albums of a specific artist from Spotify with limits
router.get('/limitArtistAlbums/:id', ensureAccessToken, async (req, res) => {
    const { id: artistId } = req.params;
    const { page, limit } = req.query;
    const offset = (page - 1) * limit;
    try {
        const artist = await spotifyApi.getArtistAlbums(artistId, { limit, offset });
        res.json(artist.body);
    } catch (error) {
        console.error('Error retrieving artist:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the artist albums.' });
    }
});


router.get('/recentlyPlayedTracks', ensureAccessToken, async (req, res) => {
    try {
        const recentlyPlayedResponse = await spotifyApi.getMyRecentlyPlayedTracks();
        const recentlyPlayedTracks = recentlyPlayedResponse.body.items;

        const uniqueTracks = new Set();
        const filteredTracks = recentlyPlayedTracks.filter(track => {
            const key = `${track.track.name}-${track.track.artists[0].name}`;
            if (!uniqueTracks.has(key)) {
                uniqueTracks.add(key);
                return true; 
            }
            return false; 
        }).map(item => ({
            ...item.track,
        }));

        res.json(filteredTracks);
    } catch (error) {
        console.error('Error retrieving recently played tracks:', error);
        res.status(500).json({ error: 'An error occurred while retrieving recently played tracks.' });
    }
});


router.get('/recentlyPlayedAlbums', ensureAccessToken, async (req, res) => {
    try {
        const recentlyPlayedResponse = await spotifyApi.getMyRecentlyPlayedTracks();
        const recentlyPlayedTracks = recentlyPlayedResponse.body.items;

        // Extract album IDs from the recently played tracks
        const uniqueAlbumIds = new Set();
        const uniqueRecentlyPlayedTracks = recentlyPlayedTracks.filter(track => {
            if (track.track.album.album_type === 'album' && !uniqueAlbumIds.has(track.track.album.id)) {
                uniqueAlbumIds.add(track.track.album.id);
                return true;
            }
            return false;
        });

        // Fetch album details for each album ID
        const albumDetailsPromises = uniqueRecentlyPlayedTracks.map(track => spotifyApi.getAlbum(track.track.album.id));
        const albumDetailsResponses = await Promise.all(albumDetailsPromises);
        const albumDetails = albumDetailsResponses.map(response => response.body);

        res.json(albumDetails);
    } catch (error) {
        console.error('Error retrieving recently played albums:', error);
        res.status(500).json({ error: 'An error occurred while retrieving recently played albums.' });
    }
});


router.get('/recentlyPlayedAlbumsLimit', ensureAccessToken, async (req, res) => {
    try {
        const { page, limit } = req.query;
        const offset = (page - 1) * limit;

        const recentlyPlayedResponse = await spotifyApi.getMyRecentlyPlayedTracks();
        const recentlyPlayedTracks = recentlyPlayedResponse.body.items;

        // Extract album IDs from the recently played tracks
        const uniqueAlbumIds = new Set();
        const uniqueRecentlyPlayedTracks = recentlyPlayedTracks.filter(track => {
            if (track.track.album.album_type === 'album' && !uniqueAlbumIds.has(track.track.album.id)) {
                uniqueAlbumIds.add(track.track.album.id);
                return true;
            }
            return false;
        });

        const paginatedUniqueAlbumIds = uniqueRecentlyPlayedTracks
        .map(track => track.track.album.id)
        .slice(offset, offset + limit);

        // Fetch album details for each album ID
        const albumDetailsPromises = paginatedUniqueAlbumIds.map(albumId => spotifyApi.getAlbum(albumId));
        const albumDetailsResponses = await Promise.all(albumDetailsPromises);
        const albumDetails = albumDetailsResponses.map(response => response.body);

        res.json(albumDetails);
    } catch (error) {
        console.error('Error retrieving recently played albums:', error);
        res.status(500).json({ error: 'An error occurred while retrieving recently played albums.' });
    }
});

router.get('/mySavedTracks', ensureAccessToken, async (req, res) => {
    try {
        const savedTracksResponse = await spotifyApi.getMySavedTracks();
        const savedTracks = savedTracksResponse.body.items;

        const uniqueTracks = new Set();
        const filteredTracks = savedTracks.filter(track => {
            const key = `${track.track.name}-${track.track.artists[0].name}`;
            if (!uniqueTracks.has(key)) {
                uniqueTracks.add(key);
                return true; 
            }
            return false; 
        }).map(item => ({
            ...item.track,
        }));

        
        res.json(filteredTracks);
    } catch (error) {
        console.error('Error retrieving saved tracks:', error);
        res.status(500).json({ error: 'An error occurred while retrieving saved tracks.' });
    }
});

router.get('/mySavedAlbums', ensureAccessToken, async (req, res) => {
    try {
        const savedAlbumsResponse = await spotifyApi.getMySavedAlbums();
        const savedAlbums = savedAlbumsResponse.body.items;

        res.json(savedAlbums);
    } catch (error) {
        console.error('Error retrieving saved albums:', error);
        res.status(500).json({ error: 'An error occurred while retrieving saved albums.' });
    }
});

router.get('/mySavedAlbumsLimit', ensureAccessToken, async (req, res) => {
    try {
        const { page, limit } = req.query;
        const offset = (page - 1) * limit;

        const savedAlbumsResponse = await spotifyApi.getMySavedAlbums({limit: limit, offset: offset});
        const savedAlbums = savedAlbumsResponse.body.items;

        res.json(savedAlbums);
    } catch (error) {
        console.error('Error retrieving saved albums:', error);
        res.status(500).json({ error: 'An error occurred while retrieving saved albums.' });
    }
});

router.get('/mySavedPlaylists', ensureAccessToken, async (req, res) => {
    try {
        const savedPlaylistsResponse = await spotifyApi.getUserPlaylists();
        const savedPlaylists = savedPlaylistsResponse.body.items;

        const playlists = savedPlaylists.map(playlist => {
            return {
                id: playlist.id,
                name: playlist.name,
                owner: playlist.owner.display_name,
                tracks: playlist.tracks.total,
                href: playlist.href,
                uri: playlist.uri,
                image: playlist.images.length > 0 ? playlist.images[0].url : null
            };
        });

        res.json(playlists);
    } catch (error) {
        console.error('Error retrieving user\'s saved playlists:', error);
        res.status(500).json({ error: 'An error occurred while retrieving user\'s saved playlists.' });
    }
});

router.get('/mySavedPlaylistsLimit', ensureAccessToken, async (req, res) => {
    try {
        const { page, limit } = req.query;
        const offset = (page - 1) * limit;

        const savedPlaylistsResponse = await spotifyApi.getUserPlaylists({limit: limit, offset: offset});
        const savedPlaylists = savedPlaylistsResponse.body.items;

        const playlists = savedPlaylists.map(playlist => {
            return {
                id: playlist.id,
                name: playlist.name,
                owner: playlist.owner.display_name,
                tracks: playlist.tracks.total,
                href: playlist.href,
                uri: playlist.uri,
                image: playlist.images.length > 0 ? playlist.images[0].url : null
            };
        });

        res.json(playlists);
    } catch (error) {
        console.error('Error retrieving user\'s saved playlists:', error);
        res.status(500).json({ error: 'An error occurred while retrieving user\'s saved playlists.' });
    }
});


router.get('/search', ensureAccessToken, async (req, res) => {
    try {
        const { filter, searchText } = req.query;

        let searchType = '';
        switch (filter) {
            case 'tracks':
                searchType = 'track';
                break;
            case 'playlists':
                searchType = 'playlist';
                break;
            case 'artists':
                searchType = 'artist';
                break;
            case 'albums':
                searchType = 'album';
                break;
            default:
                searchType = 'track';
        }

        const options = {
            limit: 30,
            market: 'US' 
            //could create own logic to search for only country genre but might be better to just allow user the freedom to search anything
        };

        const searchResults = await spotifyApi.search(searchText, [searchType], options);
           
        res.json(searchResults.body);
    } catch (error) {
        console.error('Error fetching search results:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Search with Limit for html with pagination 
router.get('/searchLimit', ensureAccessToken, async (req, res) => {
    try {
        console.log(req.query)
        const { filter, searchText, page, limit } = req.query;


        let searchType = '';
        switch (filter) {
            case 'tracks':
                searchType = 'track';
                break;
            case 'playlists':
                searchType = 'playlist';
                break;
            case 'artists':
                searchType = 'artist';
                break;
            case 'albums':
                searchType = 'album';
                break;
            default:
                searchType = 'track';
        }

        const offset = (page - 1) * limit;

        const options = {
            limit: limit,
            offset: offset || 0,
            market: 'US' 
        };

        const searchResults = await spotifyApi.search(searchText, [searchType], options);
           
        res.json(searchResults.body);
    } catch (error) {
        console.error('Error fetching search results:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/save-track/:trackId', ensureAccessToken, async (req, res) => {
    const { trackId } = req.params;
    try {
        await spotifyApi.addToMySavedTracks([trackId]);
        res.status(200).send('Track saved successfully');
    } catch (error) {
        console.error('Error saving track:', error);
        res.status(500).send('Error saving track');
    }
});

// Route to save an album to the user's library
router.put('/save-album/:albumId', ensureAccessToken, async (req, res) => {
    const { albumId } = req.params;
    try {
        await spotifyApi.addToMySavedAlbums([albumId]);
        res.status(200).send('Album saved successfully');
    } catch (error) {
        console.error('Error saving album:', error);
        res.status(500).send('Error saving album');
    }
});

// Route to save a playlist to the user's library
router.put('/save-playlist/:playlistId', ensureAccessToken, async (req, res) => {
    const { playlistId } = req.params;
    try {
        await spotifyApi.followPlaylist(playlistId);
        res.status(200).send('Playlist saved successfully');
    } catch (error) {
        console.error('Error saving playlist:', error);
        res.status(500).send('Error saving playlist');
    }
});

router.delete('/remove-track/:trackId', ensureAccessToken, async (req, res) => {
    const { trackId } = req.params;
    try {
        await spotifyApi.removeFromMySavedTracks([trackId]);
        res.status(200).send('Track removed successfully');
    } catch (error) {
        console.error('Error removing track:', error);
        res.status(500).send('Error removing track');
    }
});

// Route to remove an album from the user's library
router.delete('/remove-album/:albumId', ensureAccessToken, async (req, res) => {
    const { albumId } = req.params;
    try {
        await spotifyApi.removeFromMySavedAlbums([albumId]);
        res.status(200).send('Album removed successfully');
    } catch (error) {
        console.error('Error removing album:', error);
        res.status(500).send('Error removing album');
    }
});

// Route to remove a playlist from the user's library
router.delete('/remove-playlist/:playlistId', ensureAccessToken, async (req, res) => {
    const { playlistId } = req.params;
    try {
        await spotifyApi.unfollowPlaylist(playlistId);
        res.status(200).send('Playlist unfollowed successfully');
    } catch (error) {
        console.error('Error unfollowing playlist:', error);
        res.status(500).send('Error unfollowing playlist');
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