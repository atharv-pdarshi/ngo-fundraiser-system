const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Campaign = require('./models/Campaign');
const Donation = require('./models/Donation');
const Expense = require('./models/Expense');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB for Seeding');

        // 1. Clear existing data
        await User.deleteMany({});
        await Campaign.deleteMany({});
        await Donation.deleteMany({});
        await Expense.deleteMany({});
        console.log('🧹 Cleared existing data');

        // 2. Create Users (Real Names)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = await User.insertMany([
            { name: "Admin User", email: "admin@ngo.com", password: hashedPassword, role: "admin", phone: "9876543210" },
            { name: "Priya Sharma", email: "priya.sharma@gmail.com", password: hashedPassword, role: "user", phone: "9898989898" },
            { name: "Amit Verma", email: "amit.verma@yahoo.com", password: hashedPassword, role: "user", phone: "9123456789" },
            { name: "Dr. Rajesh Koothrappali", email: "rajesh.astro@caltech.edu", password: hashedPassword, role: "user", phone: "9988776655" },
            { name: "Sarah Jenkins", email: "sarah.j@outlook.com", password: hashedPassword, role: "user", phone: "8877665544" },
            { name: "Vikram Malhotra", email: "vikram.m@corporatemail.com", password: hashedPassword, role: "user", phone: "7766554433" }
        ]);
        console.log('👥 Created 6 Users (1 Admin, 5 Donors)');

        // 3. Create Campaigns with Real Images
        const campaigns = await Campaign.insertMany([
            {
                title: "Kerala Flood Relief 2026",
                description: "Urgent funds needed for food, shelter, and medical aid for families affected by the recent floods in Kerala/Wayanad region.",
                targetAmount: 500000,
                raisedAmount: 0, // Will update below
                imageUrl: "https://images.unsplash.com/photo-1547638385-d242398d3615?auto=format&fit=crop&w=800&q=80" // Alternative Flood/Rain image
            },
            {
                title: "Educate a Girl Child",
                description: "Sponsor tuition fees, books, and uniforms for 100 meritorious girls in rural Rajasthan.",
                targetAmount: 200000,
                raisedAmount: 0,
                imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80" // Education image
            },
            {
                title: "Save the Stray Dogs",
                description: "Building a new shelter and providing vaccinations for stray dogs in Mumbai.",
                targetAmount: 150000,
                raisedAmount: 0,
                imageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80" // Dog image
            },
            {
                title: "Clean Water for Bihaar",
                description: "Installing 50 water purifiers in drought-hit villages.",
                targetAmount: 300000,
                raisedAmount: 0,
                imageUrl: "https://images.unsplash.com/photo-1538300342682-cf57afb97285?auto=format&fit=crop&w=800&q=80" // Water image
            }
        ]);
        console.log('🌍 Created 4 Realistic Campaigns');

        // 4. Create Donations (Linking Real Users to Campaigns) - INCREASED AMOUNTS FOR POSITIVE BALANCE
        const donors = users.filter(u => u.role === 'user');
        const donationData = [
            { user: donors[0]._id, campaign: campaigns[0]._id, amount: 150000, status: 'success' }, // Big donation for Flood Relief
            { user: donors[1]._id, campaign: campaigns[0]._id, amount: 50000, status: 'success' },
            { user: donors[2]._id, campaign: campaigns[1]._id, amount: 100000, status: 'success' }, // Education
            { user: donors[3]._id, campaign: campaigns[2]._id, amount: 25000, status: 'success' },  // Dogs
            { user: donors[4]._id, campaign: campaigns[3]._id, amount: 200000, status: 'success' }, // Water
            { user: donors[0]._id, campaign: campaigns[1]._id, amount: 50000, status: 'success' },
            { user: donors[1]._id, campaign: campaigns[2]._id, amount: 1000, status: 'pending' } // One pending
        ];

        await Donation.insertMany(donationData);
        console.log('💸 Created Sample Donations');

        // Update Campaign Raised Amounts
        for (let d of donationData) {
            if (d.status === 'success') {
                await Campaign.findByIdAndUpdate(d.campaign, { $inc: { raisedAmount: d.amount } });
            }
        }
        console.log('📈 Updated Campaign Stats');

        // 5. Create Expenses (Linked to Campaigns logically via Title)
        const expenses = [
            {
                title: "Relief Kits for Wayanad",
                amount: 45000,
                category: "Food",
                date: new Date('2026-01-10'),
                description: "Rice, Dal, and Oil packets for 200 families."
            },
            {
                title: "Books & Stationery Wholesale",
                amount: 12000,
                category: "Education",
                date: new Date('2026-01-12'),
                description: "Bulk purchase of math and science textbooks."
            },
            {
                title: "Dog Shelter Construction Material",
                amount: 28000,
                category: "Operational",
                date: new Date('2026-01-15'),
                description: "Cement and bricks for the new kennel wing."
            },
            {
                title: "Water Filter Units (Batch 1)",
                amount: 150000,
                category: "Logistics",
                date: new Date('2026-01-18'),
                description: "Purchase of 20 industrial grade water filters."
            },
            {
                title: "Marketing: Facebook Ads",
                amount: 5000,
                category: "Marketing",
                date: new Date('2026-01-05'),
                description: "Ad campaign to raise awareness for stray dogs."
            }
        ];

        await Expense.insertMany(expenses);
        console.log('📝 Created Realistic Expense Logs');

        console.log('✨ Data Seeding Completed Successfully! You can login as admin@ngo.com / password123');
        process.exit();

    } catch (err) {
        console.error('❌ Error seeding data:', err);
        process.exit(1);
    }
};

seedData();
