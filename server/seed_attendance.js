const { sequelize } = require('./src/config/db.config');
const { User, Branch, Attendance } = require('./src/models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    
    // Find a branch
    let branch = await Branch.findOne();
    if (!branch) {
      branch = await Branch.create({ name: 'Central Branch', status: 'active' });
      console.log('Created a test branch.');
    }

    // Find or create a user
    const { Healer } = require('./src/models');
    let user = await User.findOne({ where: { role: 'healer' } });
    if (!user) {
       user = await User.create({
         firebaseUid: 'test-healer-uid-123',
         email: 'test.healer@example.com',
         name: 'Dr. Sarah Connor',
         role: 'healer',
         branchId: branch.id,
         status: 'active'
       });
       console.log('Created a test healer.');
    }

    // Find or create a matching healer profile
    let healer = await Healer.findOne({ where: { email: 'test.healer@example.com' } });
    if (!healer) {
      healer = await Healer.create({
        healerId: 'HLR-99999',
        name: 'Dr. Sarah Connor',
        email: 'test.healer@example.com',
        branchId: branch.id,
        status: 'Active',
      });
      console.log('Created a test healer record.');
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if attendance exists
    let attendance = await Attendance.findOne({ where: { userId: user.id, date: today } });
    if (!attendance) {
      await Attendance.create({
        userId: user.id,
        branchId: user.branchId,
        date: today,
        checkIn: new Date(),
        status: 'present'
      });
      console.log('Created a test attendance record for today.');
    } else {
      console.log('Attendance record already exists for today.');
    }

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    process.exit();
  }
};

seed();
