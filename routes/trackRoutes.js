const express = require('express');
const { Track } = require('../models')
const { authenticateUser } = require('../middleware/authenticationMiddleware')

const router = express.Router();


// Route for retrieving track details by track ID
router.get('/tracks/:trackId', authenticateUser, async (req, res) => {
    try {
        const { trackId } = req.params;
        const track = await Track.findByPk(trackId);
        res.json(track.body);
    } catch (error) {
        console.error('Error retrieving track details:', error);
        res.status(500).json({ error: 'An error occurred while retrieving track details.' });
    }
});


// Route for searching tracks by name or other criteria.
router.get('/tracks/search', authenticateUser, async (req, res) => {
    try {
        const { query } = req.query;
        const tracks = await Track.findAll({
            where: {
                title: {
                    [Sequelize.Op.iLike]: `%${query}%` // Case-insensitive search
                }
            }
        });
        res.json(tracks);
    } catch (error) {
        console.error('Error searching tracks:', error);
        res.status(500).json({ error: 'An error occurred while searching tracks.' });
    }
});


router.post("/track", authenticateUser, async (req, res) => {
    try {
        console.log('req track body',req.body)
        const { spotifyId, title, artist, album, durationMs, releaseDate, image } = req.body; 

    const existingTrack = await Track.findOne({ where: { spotifyId } });

        if (existingTrack) {
            res.send({
                message: "Track already exists",
                Track: {
                    id: existingTrack.id,
                    spotifyId: existingTrack.spotifyId,
                    title: existingTrack.title,
                    artist: existingTrack.artist,
                    album: existingTrack.album,
                    durationMs: existingTrack.durationMs,
                    releaseDate: existingTrack.releaseDate,
                    image: existingTrack.image,
                }
            });
        } else {
            const newTrack = await Track.create({
                spotifyId,
                title,
                artist,
                album,
                durationMs,
                releaseDate,
                image,
            });

            res.send({
                message: "Track created successfully",
                Track: {
                    id: newTrack.id,
                    spotifyId: newTrack.spotifyId,
                    title: newTrack.title,
                    artist: newTrack.artist,
                    album: newTrack.album,
                    durationMs: newTrack.durationMs,
                    releaseDate: newTrack.releaseDate,
                    image: newTrack.image,
                }
            });
        }

    } catch (error) {
        console.error('Error creating Track:', error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});


module.exports = router;