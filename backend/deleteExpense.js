const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Expense = require('./models/Expense');

dotenv.config();

const deleteFoodLog = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Deleting the specific "Emergency Food Packets" log created by the seed script
        const result = await Expense.deleteOne({ title: "Emergency Food Packets" });

        if (result.deletedCount > 0) {
            console.log('✅ Successfully deleted "Emergency Food Packets" log.');
        } else {
            console.log('⚠️ Could not find "Emergency Food Packets" log to delete.');
        }

        process.exit();
    } catch (err) {
        console.error('❌ Error deleting expense:', err);
        process.exit(1);
    }
};

deleteFoodLog();
