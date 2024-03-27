const express = require('express');
const { UserInteraction } = require('../models')
const { authenticateUser } = require('../middleware/authenticationMiddleware')

const router = express.Router();

// use the trackId to find out the artist and possibly add that artists name to a following section in profile
router.post("/:id/follow", authenticateUser, async (req, res) => {
    try {
        const trackId = req.params.id;
        const userId = req.user.id;
        const interactionType = "follow";

        const newInteraction = await UserInteraction.create({
            userId: userId,
            trackId: trackId,
            interactionType: interactionType,
        });

        res.send({
            message: "Interaction successful",
            Interaction: {
            id: newInteraction.id,
            userId: newInteraction.userId,
            trackId: newInteraction.trackId,
            interactionType: newInteraction.interactionType,
            }
        })

    } catch (error) {
        console.error('Error creating Interaction:', error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

// favourite is directly linked to the track so possibly the if favourited the tracks is automatically moved to a favourites playlist
router.post("/:id/favourite", authenticateUser, async (req, res) => {
    try {
        const trackId = req.params.id;
        const userId = req.user.id;
        const interactionType = "favourite";

        const newInteraction = await UserInteraction.create({
            userId: userId,
            trackId: trackId,
            interactionType: interactionType,
        });

        res.send({
            message: "Interaction successful",
            Interaction: {
            id: newInteraction.id,
            userId: newInteraction.userId,
            trackId: newInteraction.trackId,
            interactionType: newInteraction.interactionType,
            }
        })

    } catch (error) {
        console.error('Error creating Interaction:', error);
        res.status(500).send({ error: "Internal Server Error" });
    }
});

module.exports = router;