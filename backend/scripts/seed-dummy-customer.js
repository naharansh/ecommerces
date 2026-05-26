const bcrypt = require('bcryptjs');
const { User, Cart } = require('../src/models');

(async () => {
  try {
    const existing = await User.findOne({ where: { email: 'dummy@example.com' } });
    if (existing) {
      console.log('Dummy customer already exists:', existing.email);
      process.exit(0);
    }

    const hash = await bcrypt.hash('password123', 12);
    const user = await User.create({
      name: 'Dummy Customer',
      email: 'dummy@example.com',
      password_hash: hash,
      role: 'customer',
      is_verified: true,
      phone: '+1-555-0000',
    });
    await Cart.create({ user_id: user.id });
    console.log('Created dummy customer:', user.email, '(password: password123)');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
