// Simple script to resume MongoDB Atlas cluster by connecting to it
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://mebishnusahu:Bishnu05%40@cluster0.n0nc4hi.mongodb.net/farmview_ai?appName=Cluster0';

console.log('🔄 Attempting to connect to MongoDB Atlas...');
console.log('⏳ This will automatically resume the paused cluster...\n');

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 60000, // 60 seconds timeout
  socketTimeoutMS: 60000,
})
.then(() => {
  console.log('✅ SUCCESS! MongoDB Atlas Cluster is now ACTIVE!');
  console.log('🎉 Cluster has been resumed successfully!');
  console.log('\n📝 Now you can start your server with: npm start');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Connection failed:', err.message);
  console.log('\n💡 Possible reasons:');
  console.log('   1. Cluster is still resuming (wait 2-3 more minutes)');
  console.log('   2. IP not whitelisted (check Network Access in Atlas)');
  console.log('   3. Cluster needs manual resume from dashboard');
  console.log('\n🔗 Dashboard: https://cloud.mongodb.com/');
  process.exit(1);
});

// Keep trying for 60 seconds
setTimeout(() => {
  console.log('\n⏰ Timeout reached. Cluster might need more time to resume.');
  process.exit(1);
}, 60000);
