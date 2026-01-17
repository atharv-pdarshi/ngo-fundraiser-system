const express = require('express');
const Donation = require('../models/Donation');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Invalid Token' });
    }
};

// GET HISTORY
router.get('/my-history', auth, async (req, res) => {
    try {
        const donations = await Donation.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(donations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1. CREATE STRIPE SESSION
router.post('/create-checkout-session', auth, async (req, res) => {
    try {
        const { amount } = req.body;

        // Create a Pending Donation in DB
        const newDonation = new Donation({
            user: req.user.id,
            amount: amount,
            status: 'pending'
        });
        await newDonation.save();

        // Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: 'Donation to NSS NGO',
                    },
                    unit_amount: amount * 100, // Amount in paise
                },
                quantity: 1,
            }],
            mode: 'payment',
            // Redirect URLs
            success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&donation_id=${newDonation._id}`,
            cancel_url: `${process.env.CLIENT_URL}/dashboard`,
        });

        // Update donation with session ID
        newDonation.orderId = session.id;
        await newDonation.save();

        res.json({ url: session.url });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Payment initiation failed' });
    }
});

// 2. VERIFY PAYMENT (Called after success redirect)
router.post('/verify-payment', auth, async (req, res) => {
    try {
        const { session_id, donation_id } = req.body;

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            await Donation.findByIdAndUpdate(donation_id, { 
                status: 'success',
                paymentId: session.payment_intent
            });
            res.json({ status: 'success' });
        } else {
            res.json({ status: 'failed' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Verification failed' });
    }
});

module.exports = router;