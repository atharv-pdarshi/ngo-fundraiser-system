const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Expense = require('../models/Expense');
const Donation = require('../models/Donation');

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

// @route   POST /api/expenses
// @desc    Log a new expenditure (Admin only)
// @access  Admin
router.post('/', adminAuth, async (req, res) => {
    try {
        const { title, amount, category, date, description } = req.body;
        const expenseAmount = parseFloat(amount);

        // 1. Calculate Total Funds Collected
        const donationStats = await Donation.aggregate([
            { $match: { status: 'success' } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);
        const totalCollected = donationStats.length > 0 ? donationStats[0].totalAmount : 0;

        // 2. Calculate Total Funds Spent (Including this new one potentially)
        const expenseStats = await Expense.aggregate([
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);
        const totalSpent = expenseStats.length > 0 ? expenseStats[0].totalAmount : 0;

        // 3. Validation: Can we afford this?
        if (totalSpent + expenseAmount > totalCollected) {
            return res.status(400).json({
                msg: `Insufficient Funds! You have collected ₹${totalCollected} but spent ₹${totalSpent}. Cannot spend another ₹${expenseAmount}.`
            });
        }

        // 4. Create Expense
        const newExpense = new Expense({
            title,
            amount: expenseAmount,
            category,
            date,
            description
        });

        await newExpense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error while logging expense' });
    }
});

// @route   GET /api/expenses
// @desc    Get all expenses (Public - for Transparency Timeline)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/expenses/stats
// @desc    Get total spent
// @access  Public
router.get('/stats', async (req, res) => {
    try {
        const expenseStats = await Expense.aggregate([
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);
        const totalSpent = expenseStats.length > 0 ? expenseStats[0].totalAmount : 0;
        res.json({ totalSpent });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
