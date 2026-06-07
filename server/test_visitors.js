const visitorRepository = require('./src/repositories/visitor.repository');

const run = async () => {
  try {
    const data = await visitorRepository.findAll({});
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
};

run();
