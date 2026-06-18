const db = require('./src/models');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  await db.sequelize.authenticate();
  const [affectedCount] = await db.User.update(
    { status: 'active' },
    { where: { status: 'inactive' } }
  );
  console.log(`Reactivated ${affectedCount} inactive users.`);
  process.exit(0);
}
run().catch(err => {
  console.error(err);
  process.exit(1);
});
