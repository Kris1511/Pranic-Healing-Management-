const db = require('./src/models');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  await db.sequelize.authenticate();
  
  console.log("=== HEALERS FULL DUMP ===");
  const healers = await db.Healer.findAll({ include: ['branch'] });
  healers.forEach(h => {
    console.log(h.toJSON());
  });

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
