const { Session } = require('./src/models');
async function updateDb() {
  const sessions = await Session.findAll();
  for (let s of sessions) {
    if (s.status === 'scheduled' || s.status === 'Scheduled') {
      s.status = 'completed';
      await s.save();
    }
  }
  console.log("Updated sessions to 'completed'.");
}
updateDb().catch(console.error).finally(() => process.exit(0));
