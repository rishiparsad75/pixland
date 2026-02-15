// Migration script to set existing users to 'active' status
// Run this once after deploying the status field update

const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const migrateUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Update all existing users without a status field to 'active'
        const result = await User.updateMany(
            { status: { $exists: false } },
            { $set: { status: 'active' } }
        );

        console.log(`Migration complete: ${result.modifiedCount} users updated to 'active' status`);

        // Also update any users with null status
        const nullResult = await User.updateMany(
            { status: null },
            { $set: { status: 'active' } }
        );

        console.log(`Fixed ${nullResult.modifiedCount} users with null status`);

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateUsers();
