# Music Sharing Platform

___

![Love Sign](./public/assets/genres/pexels-loe-moshkovska-722245.jpg "LoveCountry")
> I think there's enough room in country music for everybody.
-Charley Pride

## Project Description 

The primary goal of this project was to gain experience working with a popular API, in particular the Spotify API. The secondary target was to place my own unique spin on the application to target a niche in line with my interests. The focal point thus became a country genre music sharing platform. The application covers all potential areas of interest for country genre fans contain 18 sub-genres, recommendations, popular and new playlists, playlists based on mood, popular albums and artists, a fully functional search bar, Spotify liked track/playlists/artists, recently listened to songs/albums, and easy to create and maintain personal YouCountry? playlists. In order to listen music on YouCountry? Spotify premium is required due to the Spotify API restrictions. However, with Spotify premium YouCountry?'s music player is fully functional allowing users to listen, seek, skip next/previous, pause, play, control volume, autoplay, shuffle, repeat song or playlist, and continue listening to current song while browsing (cannot listen to an entire playlist that has its origin on another page). 

#### The Technologies Used: 
- Node.js and the Express.js framework
- Bcrypt and Json Web Token for encryption/authorisation
- Helmet, Express-session and CORS for added security
- Swagger: API Documentation

## How to Use the Project

*Use node/nodemon server.js in the terminal to start the server*

**Basic User Interaction Example**

1. http://localhost:3000/chill/signup - post route for creating a profile.
    1. Requires a username as well as a unique email and password.
    2. The password must be at least 8 characters long including lowercase, uppercase, and numeric values.
2. http://localhost:3000/chill/signin - post route to sign-in to a specific profile.
    1. Upon successful sign-in the user will be authenticated obtaining a JWT token.
    2. This allows the user to access and create/modify playlists linked to their account
3. http://localhost:3000/chill/playlists/top-country-songs - Asks the spotify API for country genre recommendations for the user.
    1. Each page has its own route which asks for the necessary information from the Spotify API. 
    2. This route is used in the landing page and the expanded recommendations section.
    3. This route populates the 5 tracks on the landing page (1 in the trending section and 4 in the recommendations section).
    4. The track name, artist name, album image, and track duration are requested and displayed from the Spotify API
4. http://localhost:3000/chill/playback/play - post route which takes the device id and track uri informing the Spotify API to output the track's audio.
    1. The user can click on the track or "Listen Now" button to start the track (using the track uri), which is then shown and managable through the music player.
    2. This route is also utilized when the user requests the next/previous track or is using any of the autoplay functions are invoked. 
5. http://localhost:3000/chill/save-track/:trackId - put route allows a user to like tracks, albums or playlists.
    1. When the heart icon is selected it adds the track/album/playlist to their respective Spotify liked section which in YouCountry? is represented by MyTracks/MyAlbums/MyPlaylists
    2. Multiple clicks do not create duplicates or unlike the track/album/playlist but they can be found and deleted in their respective section by clicking the cross icon. 
6. http://localhost:3000/chill/playlists - get route allows a user to add a track to any of their created personal playlists.
    1. The signed in user once the plus icon is selected will view a pop-up menu with their playlists, an add button, and cross icon.
    2. The cross icon when clicked cancels the process if the user no longer wants to add the track to their playlists. 
    3. Each playlist has a box beside it. If the box or playlist name is clicked it will check the box or uncheck it.
    4. Once the user has check marked every playlist they want to add the track to they click the add button to finalise the process.  
7. http://localhost:3000/chill/playlist - post route allows the user to create a new playlist.
    1. This route is activated when the user clicks "+ Create New" button on the sidebar. (only functions for a signed in user)
    2. After activation a pop-up appears asking the user to name the new playlist then hit ok or cancel to confirm or deny the process.
    3. Once confirmed the playlist will be added to the database and visible to the user in the sidebar under PLAYLIST. 
    4. Now when the user attempts to add a track to their playlists the new playlist will be visible.
    5. A playlist without tracks is blank but once a track has been added the playlist and track information will appear. 
8. http://localhost:3000/chill/personalPlaylist/:playlistId - get route is activated when the user clicks on a personal playlist located under the "+ Create New" button.
    1. This route loads the playlist name and the date it was created on as well as the default image.
    2. While simultaneously loading all track data that is linked to the selected playlist.
    3. The "Delete" button can be click to remove the selected playlist in its entirity. The user's playlist is safeguarded by a pop-up confirmation box in the case of an accident or reconsideration.   
    3. Again each track allows for the option to be added to the user's liked tracks and added to other personal playlists. (If a playlist already has the selected track in it there is error handling so no issues arise)
    4. There is the additional option also to click the cross icon removing the track's link to the selected playlist and reloading the page to show the user it has been removed. 
    5. Like all tracks on YouCountry?; from the personal playlist section each track can be played if clicked and controlled by using the music player as a proxy. 


### Copyright

**Copyright 2024, Jonathan Cuddy, All rights reserved.**
:smiley: