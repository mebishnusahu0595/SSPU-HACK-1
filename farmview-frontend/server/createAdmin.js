// Script to create default admin user
// Run: node createAdmin.js

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Admin = require('./models/Admin.model');

async function createDefaultAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('📡 Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Default admin already exists!');
      console.log('Username: admin');
      console.log('Use existing credentials to login');
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      username: 'admin',
      email: 'admin@farmview.com',
      password: 'Admin@123', // Change this in production!
      role: 'super-admin'
    });

    await admin.save();

    console.log('✅ Default admin created successfully!');
    console.log('================================');
    console.log('Username: admin');
    console.log('Password: Admin@123');
    console.log('Role: super-admin');
    console.log('================================');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');
    
    process.exit(0);

  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
}

createDefaultAdmin();
