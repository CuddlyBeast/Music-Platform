const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/playback/play', async (req, res) => {
    try {
        const { trackUri, accessToken } = req.body; 

        await axios({
            method: 'put',
            url: 'https://api.spotify.com/v1/me/player/play',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                uris: [trackUri] 
            }
        });

        res.status(200).json({ message: 'Playback started successfully.' });
    } catch (error) {
        console.error('Error starting playback:', error);
        res.status(500).json({ error: 'Playback failed. Please try again.' });
    }
});


router.post('/playback/pause', async (req, res) => {
    try {
        const accessToken = req.headers.authorization.split(' ')[1]; // Extract access token from request header

        await axios({
            method: 'put',
            url: 'https://api.spotify.com/v1/me/player/pause',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json({ message: 'Playback paused successfully.' });
    } catch (error) {
        console.error('Error pausing playback:', error);
        res.status(500).json({ error: 'Pause playback failed. Please try again.' });
    }
});


router.post('/playback/next', async (req, res) => {
    try {
        const accessToken = req.headers.authorization.split(' ')[1]; // Extract access token from request header

        await axios({
            method: 'post',
            url: 'https://api.spotify.com/v1/me/player/next',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.status(200).json({ message: 'Skipped to the next track successfully.' });
    } catch (error) {
        console.error('Error skipping to the next track:', error);
        res.status(500).json({ error: 'Skipping to the next track failed. Please try again.' });
    }
});


router.post('/playback/previous', async (req, res) => {
    try {
        const accessToken = req.headers.authorization.split(' ')[1]; // Extract access token from request header

        await axios({
            method: 'post',
            url: 'https://api.spotify.com/v1/me/player/previous',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.status(200).json({ message: 'Skipped to the previous track successfully.' });
    } catch (error) {
        console.error('Error skipping to the previous track:', error);
        res.status(500).json({ error: 'Skipping to the previous track failed. Please try again.' });
    }
});


module.exports = router;