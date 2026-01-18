const express = require('express');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign'); // NEW
const sendEmail = require('../utils/sendEmail'); // NEW
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

router.get('/my-history', auth, async (req, res) => {
    try {
        const donations = await Donation.find({ user: req.user.id })
            .populate('campaign', 'title') // Show campaign name in history
            .sort({ createdAt: -1 });
        res.json(donations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/create-checkout-session', auth, async (req, res) => {
    try {
        const { amount, campaignId } = req.body; // Receive campaignId

        const newDonation = new Donation({
            user: req.user.id,
            campaign: campaignId,
            amount: amount,
            status: 'pending'
        });
        await newDonation.save();

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: { name: 'NGO Donation' },
                    unit_amount: amount * 100,
                },
                quantity: 1,
            }],
            mode: 'payment',
            // Pass campaignId and donationId in URL
            success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&donation_id=${newDonation._id}&campaign_id=${campaignId}`,
            cancel_url: `${process.env.CLIENT_URL}/payment-failure`,
        });

        newDonation.orderId = session.id;
        await newDonation.save();
        res.json({ url: session.url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/verify-payment', auth, async (req, res) => {
    try {
        const { session_id, donation_id, campaign_id } = req.body;
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === 'paid') {
            // 1. Update Donation Status
            const donation = await Donation.findByIdAndUpdate(donation_id, {
                status: 'success',
                paymentId: session.payment_intent
            }).populate('user', 'name email');

            // 2. Update Campaign Raised Amount
            if (campaign_id) {
                await Campaign.findByIdAndUpdate(campaign_id, {
                    $inc: { raisedAmount: donation.amount }
                });
            }

            // 3. Trigger Real-Time Email
            try {
                await sendEmail(donation.user.email, "Donation Received! - NGO Relief", donation.user.name, donation.amount);
            } catch (mailErr) {
                console.log("Email failed but payment was success:", mailErr);
            }

            res.json({ status: 'success' });
        } else {
            res.json({ status: 'failed' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;