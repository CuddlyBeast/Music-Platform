// window.onSpotifyWebPlaybackSDKReady = () => {
//     const token = 'YOUR_ACCESS_TOKEN'; // Replace 'YOUR_ACCESS_TOKEN' with your actual access token

//     // Initialize the Spotify player
//     const player = new Spotify.Player({
//         name: 'My Spotify Web Playback SDK Player',
//         getOAuthToken: cb => { cb(token); }
//     });

//     // Connect to the Spotify player
//     player.connect().then(success => {
//         if (success) {
//             console.log('The Web Playback SDK has been connected to Spotify!');
//         } else {
//             console.error('Failed to connect to Spotify using the Web Playback SDK.');
//         }
//     });

//     // Add event listeners to handle playback events
//     player.addListener('ready', ({ device_id }) => {
//         console.log('Ready with Device ID', device_id);
//     });

//     player.addListener('player_state_changed', state => {
//         console.log('Player state changed:', state);
//     });

//     player.addListener('not_ready', ({ device_id }) => {
//         console.log('Device ID has gone offline', device_id);
//     });
// };