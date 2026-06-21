const db = require('./src/models');
async function checkRoles() {
  const users = await db.User.findAll({ attributes: ['id', 'email', 'role'] });
  console.log("Users and Roles:");
  users.forEach(u => console.log(`${u.email} : ${u.role}`));
  process.exit(0);
}
checkRoles();
