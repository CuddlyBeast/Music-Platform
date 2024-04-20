const express = require('express');
const router = express.Router();
const { spotifyApi } = require('./authRoutes');

router.post('/playback/play', async (req, res) => {
    try {
        const { trackUri , deviceId } = req.body;
        const accessToken = req.headers.authorization.split(' ')[1];
        spotifyApi.setAccessToken(accessToken);

        await spotifyApi.play({
            uris: [trackUri],
            device_id: deviceId
        });

        res.status(200).json({ message: 'Playback started successfully.' });
    } catch (error) {
        console.error('Error starting playback:', error);
        res.status(500).json({ error: 'Playback failed. Please try again.' });
    }
});


router.post('/playback/pause', async (req, res) => {
    try {
        await spotifyApi.pause();

        res.status(200).json({ message: 'Playback paused successfully.' });
    } catch (error) {
        console.error('Error pausing playback:', error);
        res.status(500).json({ error: 'Pause playback failed. Please try again.' });
    }
});

router.post('/playback/resume', async (req, res) => {
    try {
        await spotifyApi.play();
        res.status(200).json({ message: 'Playback resumed successfully.' });
    } catch (error) {
        console.error('Error resuming playback:', error);
        res.status(500).json({ error: 'Resume playback failed. Please try again.' });
    }
});

router.get('/playback/state', async (req, res) => {
    try {
        const { body: playbackState } = await spotifyApi.getMyCurrentPlaybackState();

        res.status(200).json({ state: playbackState });
    } catch (error) {
        console.error('Error fetching current playback state:', error);
        res.status(500).json({ error: 'Failed to fetch current playback state' });
    }
});


router.post('/playback/next', async (req, res) => {
    try {
        await spotifyApi.skipToNext();

        res.status(200).json({ message: 'Skipped to the next track successfully.' });
    } catch (error) {
        console.error('Error skipping to the next track:', error);
        res.status(500).json({ error: 'Skipping to the next track failed. Please try again.' });
    }
});

router.post('/playback/previous', async (req, res) => {
    try {
        await spotifyApi.skipToPrevious();

        res.status(200).json({ message: 'Skipped to the previous track successfully.' });
    } catch (error) {
        console.error('Error skipping to the previous track:', error);
        res.status(500).json({ error: 'Skipping to the previous track failed. Please try again.' });
    }
});


module.exports = router;