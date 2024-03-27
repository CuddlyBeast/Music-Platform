const express = require('express');
const { Playlist, PlaylistTrack, Track } = require('../models')
const { authenticateUser } = require('../middleware/authenticationMiddleware')

const router = express.Router();

router.get("/playlists/:playlistId", authenticateUser, async (req, res) => {
    try {
        const { playlistId } = req.params;
        const userId = req.user.id;

        const playlist = await Playlist.findOne({ where: { id: playlistId, userId: userId } });

        if (!playlist) {
            return res.status(404).send({ error: "Playlist not found or does not belong to the user" });
        }

        // Fetch all tracks linked to the specified playlist
        const playlistTracks = await PlaylistTrack.findAll({
            where: { playlistId: playlistId },
            include: [{ model: Track }]
        });

        res.send(playlistTracks);
    } catch (error) {
        console.error('Error retrieving playlist tracks:', error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

router.put("/playlists/:playlistId", authenticateUser, async (req, res) => {
    try {
        const { playlistId } = req.params;
        const userId = req.user.id;
        const { action, trackId } = req.body;

        const playlist = await Playlist.findOne({ where: { id: playlistId, userId: userId } });

        if (!playlist) {
            return res.status(404).send({ error: "Playlist not found or does not belong to the user" });
        }

        if (action === 'add') {
            await PlaylistTrack.create({
                playlistId: playlistId,
                trackId: trackId
            });

            return res.send({ message: "Track added to playlist successfully" });
        } else if (action === 'remove') {

            await PlaylistTrack.destroy({
                where: { playlistId: playlistId, trackId: trackId }
            });

            return res.send({ message: "Track removed from playlist successfully" });
        } else {
            return res.status(400).send({ error: "Invalid action specified" });
        }
    } catch (error) {
        console.error('Error updating playlist:', error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

router.delete("/playlists/:playlistId", authenticateUser, async (req, res) => {
    try {
        const { playlistId } = req.params;
        const userId = req.user.id;

        const playlist = await Playlist.findOne({ where: { id: playlistId, userId: userId } });

        if (!playlist) {
            return res.status(404).send({ error: "Playlist not found or does not belong to the user" });
        }

        await playlist.destroy();

        await PlaylistTrack.destroy({ where: { playlistId: playlistId } });

        return res.send({ message: "Playlist deleted successfully" });
    } catch (error) {
        console.error('Error deleting playlist:', error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

router.post("/playlist", authenticateUser, async (req, res) => {
    try {
        const { title } = req.body; 
        const userId = req.user.id

        const newPlaylist = await Playlist.create({
            userId: userId,
            title,
        });

        res.send({
            message: "Playlist successful",
            Playlist: {
            id: newPlaylist.id,
            userId: newPlaylist.userId,
            title: newPlaylist.title,
            }
        })

    } catch (error) {
        console.error('Error creating Playlist:', error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

router.get("/playlists", authenticateUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const playlists = await Playlist.findAll({ where: { userId: userId } });
        res.send(playlists);
    } catch (error) {
        res.status(500).send({ error: "Internal Server Error" })
    }
})


module.exports = router;