const { User } = require('./src/models');
const { connectDB } = require('./src/config/db.config');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const privateKey = process.env.FIREBASE_PRIVATE_KEY 
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
  : undefined;

async function run() {
  await connectDB();
  
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      }),
    });
  }

  // Get all users from local DB
  const localUsers = await User.findAll();
  console.log("--- Local Users in MySQL ---");
  for (const u of localUsers) {
    console.log(`Email: ${u.email}, Role: ${u.role}, FirebaseUid: ${u.firebaseUid}, Raw Password in DB: ${u.password}`);
    
    // Fetch from Firebase Auth
    try {
      const fbUser = await admin.auth().getUser(u.firebaseUid);
      console.log(`  -> Firebase Auth match: Found. Email: ${fbUser.email}`);
    } catch (err) {
      console.log(`  -> Firebase Auth match: NOT FOUND (${err.message})`);
      if (err.code === 'auth/user-not-found') {
        try {
          const fbUserByEmail = await admin.auth().getUserByEmail(u.email);
          console.log(`     but found by email in Firebase with different UID: ${fbUserByEmail.uid}`);
        } catch (e) {
          console.log(`     and NOT found by email in Firebase: ${e.message}`);
        }
      }
    }
  }
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
