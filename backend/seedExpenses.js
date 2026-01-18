const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Expense = require('./models/Expense');

dotenv.config();

const seedExpenses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB for Seeding');

        const expenses = [
            {
                title: "Emergency Food Packets",
                amount: 15000,
                category: "Food",
                date: new Date('2025-12-25'),
                description: "Distributed 500 food packets to flood victims in District A."
            },
            {
                title: "Winter Blankets Distribution",
                amount: 25000,
                category: "Operational",
                date: new Date('2026-01-05'),
                description: "Purchased and distributed 200 blankets for the homeless shelter."
            },
            {
                title: "Medical Camp Setup",
                amount: 12000,
                category: "Medical",
                date: new Date('2026-01-10'),
                description: "Medicines and basic checkup equipment."
            },
            {
                title: "School Supplies for Kids",
                amount: 8000,
                category: "Education",
                date: new Date('2026-01-15'),
                description: "Notebooks, pens, and bags for 50 underprivileged children."
            }
        ];

        // Clear existing expenses to avoid duplicates (Optional, but good for testing)
        // await Expense.deleteMany({}); 

        await Expense.insertMany(expenses);
        console.log('✅ Added 4 sample expense logs successfully!');

        process.exit();
    } catch (err) {
        console.error('❌ Error seeding expenses:', err);
        process.exit(1);
    }
};

seedExpenses();
