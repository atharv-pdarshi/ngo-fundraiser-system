const express = require('express');
const User = require('../models/User');
const Donation = require('../models/Donation');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Middleware: Verify Token AND Check if Admin
const adminAuth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admins only.' });
        }
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        
        // Sum of all SUCCESSFUL donations
        const donationStats = await Donation.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);

        const totalDonations = donationStats.length > 0 ? donationStats[0].totalAmount : 0;

        res.json({ totalUsers, totalDonations });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users WITH their total donation amount
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.aggregate([
            { $match: { role: 'user' } }, // 1. Get only normal users
            {
                $lookup: { // 2. Join with Donations table
                    from: 'donations',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'donationHistory'
                }
            },
            {
                $addFields: { // 3. Calculate Total Success Donation
                    totalDonated: {
                        $sum: {
                            $map: {
                                input: { 
                                    $filter: { // Only count 'success' donations
                                        input: "$donationHistory", 
                                        as: "d", 
                                        cond: { $eq: ["$$d.status", "success"] } 
                                    } 
                                },
                                as: "validDonation",
                                in: "$$validDonation.amount"
                            }
                        }
                    }
                }
            },
            {
                $project: { // 4. Clean up output (Hide password & history array)
                    password: 0,
                    donationHistory: 0,
                    __v: 0
                }
            },
            { $sort: { createdAt: -1 } } // 5. Newest users first
        ]);
        
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/admin/donations
// @desc    Get all donations
router.get('/donations', adminAuth, async (req, res) => {
    try {
        // .populate() replaces user ID with actual user details (Name, Email)
        const donations = await Donation.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(donations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;