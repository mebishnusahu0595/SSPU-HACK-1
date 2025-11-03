// Auto-resume MongoDB Atlas Free Cluster by connecting
const mongoose = require('mongoose');

const ATLAS_URI = 'mongodb+srv://mebishnusahu:Bishnu05%40@cluster0.n0nc4hi.mongodb.net/farmview_ai?appName=Cluster0';

let attemptCount = 0;
const maxAttempts = 20; // Try for ~10 minutes (30 sec each)

console.log('🔄 Auto-resuming MongoDB Atlas Free Cluster...');
console.log('📝 Free clusters resume automatically on connection attempt');
console.log('⏳ This may take 2-5 minutes...\n');

function tryConnect() {
  attemptCount++;
  console.log(`🔌 Attempt ${attemptCount}/${maxAttempts} - Connecting to Atlas...`);
  
  mongoose.connect(ATLAS_URI, {
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 30000,
  })
  .then(() => {
    console.log('\n✅ SUCCESS! MongoDB Atlas cluster is now ACTIVE!');
    console.log('🎉 Cluster has been auto-resumed!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Next Steps:');
    console.log('   1. Press Ctrl+C to stop this script');
    console.log('   2. Start your server: npm start');
    console.log('   3. Your Atlas data is now available!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Keep connection alive for a bit
    setTimeout(() => {
      mongoose.disconnect();
      process.exit(0);
    }, 5000);
  })
  .catch(err => {
    console.log(`   ⏳ Cluster still waking up... (${err.message.split(':')[0]})`);
    mongoose.disconnect();
    
    if (attemptCount < maxAttempts) {
      console.log(`   ⏰ Waiting 30 seconds before retry...\n`);
      setTimeout(tryConnect, 30000); // Wait 30 seconds, then retry
    } else {
      console.log('\n❌ Max attempts reached. Cluster might need more time.');
      console.log('💡 Try again in 5 minutes or check Atlas dashboard.');
      process.exit(1);
    }
  });
}

// Start connection attempts
tryConnect();
