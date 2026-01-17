const express = require('express');
const Donation = require('../models/Donation');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware to verify Token
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// GET MY DONATIONS
router.get('/my-history', auth, async (req, res) => {
    try {
        const donations = await Donation.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(donations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// INITIATE DONATION (Basic Version)
router.post('/create', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        const newDonation = new Donation({
            user: req.user.id,
            amount,
            status: 'pending' // Pending until payment is verified
        });
        const savedDonation = await newDonation.save();
        res.json(savedDonation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;