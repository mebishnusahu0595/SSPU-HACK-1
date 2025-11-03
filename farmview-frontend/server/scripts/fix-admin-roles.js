const mongoose = require('mongoose');
const Admin = require('../models/Admin.model');
require('dotenv').config();

const fixAdminRoles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Update all admins without a role to have 'admin' role
    const result = await Admin.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'admin' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} admin records with default 'admin' role`);

    // Also update any admins with null or undefined role
    const result2 = await Admin.updateMany(
      { $or: [{ role: null }, { role: undefined }] },
      { $set: { role: 'admin' } }
    );

    console.log(`✅ Updated ${result2.modifiedCount} admin records with null/undefined role`);

    // List all admins
    const admins = await Admin.find({}).select('username email role isActive');
    console.log('\n📋 Current admins:');
    admins.forEach(admin => {
      console.log(`  - ${admin.username} (${admin.email}) - Role: ${admin.role} - Active: ${admin.isActive}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixAdminRoles();
