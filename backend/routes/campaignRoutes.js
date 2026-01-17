const express = require('express');
const Campaign = require('../models/Campaign');
const router = express.Router();

// GET all active campaigns
router.get('/', async (req, res) => {
    try {
        const campaigns = await Campaign.find({ isActive: true });
        res.json(campaigns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN: Create a campaign
router.post('/create', async (req, res) => {
    try {
        const campaign = new Campaign(req.body);
        await campaign.save();
        res.status(201).json(campaign);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;