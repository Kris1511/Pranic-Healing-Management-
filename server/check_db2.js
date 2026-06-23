const { Session, Patient, User } = require('./src/models');
async function check() {
  const sessions = await Session.findAll({ include: 'patient' });
  console.log("TOTAL SESSIONS:", sessions.length);
  const completedSessions = sessions.filter(s => s.status === 'Completed');
  console.log("COMPLETED SESSIONS:", completedSessions.length);
  if (completedSessions.length > 0) {
    console.log("SAMPLE COMPLETED SESSION:", completedSessions[0].toJSON());
  } else if (sessions.length > 0) {
    console.log("SAMPLE SESSION:", sessions[0].toJSON());
  }
}
check().catch(console.error).finally(() => process.exit(0));
