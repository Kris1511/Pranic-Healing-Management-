const { admin, initializeFirebase } = require('./src/config/firebase.config');

initializeFirebase();

async function resetPassword() {
  try {
    const userRecord = await admin.auth().getUserByEmail('anu11@gmail.com');
    await admin.auth().updateUser(userRecord.uid, {
      password: 'password123'
    });
    console.log('Successfully updated password for anu11@gmail.com to password123');
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('User anu11@gmail.com not found in Firebase. Creating it...');
      const newUser = await admin.auth().createUser({
        email: 'anu11@gmail.com',
        password: '123456',
        emailVerified: true
      });
      console.log('Created user with UID:', newUser.uid, '. Remember to update the DB firebaseUid if needed.');
    } else {
      console.error('Error:', error);
    }
  }
  process.exit(0);
}

// wait a moment for init
setTimeout(resetPassword, 1000);
