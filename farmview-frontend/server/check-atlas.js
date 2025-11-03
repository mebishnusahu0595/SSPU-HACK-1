// Quick Atlas connection test
const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://mebishnusahu:Bishnu05%40@cluster0.n0nc4hi.mongodb.net/farmview_ai?appName=Cluster0';
const LOCAL_URI = 'mongodb://localhost:27017/farmview_ai';

console.log('🔍 Checking MongoDB Connections...\n');

// Test Atlas
console.log('1️⃣ Testing MongoDB Atlas...');
mongoose.connect(ATLAS_URI, {
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log('   ✅ ATLAS IS ACTIVE AND CONNECTED!\n');
  mongoose.disconnect();
  testLocal();
})
.catch(err => {
  console.log('   ❌ Atlas connection failed:', err.message);
  console.log('   💡 Cluster is still PAUSED or RESUMING\n');
  mongoose.disconnect();
  testLocal();
});

function testLocal() {
  console.log('2️⃣ Testing Local MongoDB...');
  mongoose.connect(LOCAL_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log('   ✅ LOCAL MONGODB IS CONNECTED!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Summary:');
    console.log('   • Atlas: Check above');
    console.log('   • Local: Working ✅');
    console.log('   • Current .env: Using LOCAL');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  })
  .catch(err => {
    console.log('   ❌ Local MongoDB not running:', err.message);
    process.exit(1);
  });
}
