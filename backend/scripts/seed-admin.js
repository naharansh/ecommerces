const bcrypt = require('bcryptjs');
const { User } = require('../src/models');

const seedAdmin = async () => {
  try {
    const email = 'admin@shopwave.com';
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log('Admin user already exists:', email);
      process.exit(0);
    }

    const password_hash = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'Admin',
      email,
      password_hash,
      role: 'admin',
      is_verified: true,
    });

    console.log('Admin user created:');
    console.log('  Email:    admin@shopwave.com');
    console.log('  Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
    process.exit(1);
  }
};

seedAdmin();
