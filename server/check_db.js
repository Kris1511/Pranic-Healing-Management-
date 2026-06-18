const db = require('./src/models');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  await db.sequelize.authenticate();
  const users = await db.User.findAll();
  console.log("=== DB USERS ===");
  users.forEach(u => {
    console.log({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      name: u.name,
      firebaseUid: u.firebaseUid
    });
  });
  process.exit(0);
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
