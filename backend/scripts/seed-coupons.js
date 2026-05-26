const { Coupon } = require('../src/models');

(async () => {
  try {
    const coupons = [
      { code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, min_order_amount: 50, max_discount: 50, usage_limit: 100, is_active: true, expires_at: '2027-12-31' },
      { code: 'SAVE20', discount_type: 'percentage', discount_value: 20, min_order_amount: 100, max_discount: 100, usage_limit: 50, is_active: true, expires_at: '2027-12-31' },
      { code: 'FLAT50', discount_type: 'fixed', discount_value: 50, min_order_amount: 200, usage_limit: 30, is_active: true, expires_at: '2027-12-31' },
      { code: 'FREESHIP', discount_type: 'fixed', discount_value: 10, min_order_amount: 75, usage_limit: 200, is_active: true, expires_at: '2027-12-31' },
      { code: 'SUMMER25', discount_type: 'percentage', discount_value: 25, min_order_amount: 0, max_discount: 75, usage_limit: 100, is_active: true, expires_at: '2026-09-01' },
    ];

    for (const c of coupons) {
      const existing = await Coupon.findOne({ where: { code: c.code } });
      if (!existing) {
        await Coupon.create(c);
        console.log(`Created coupon: ${c.code}`);
      } else {
        console.log(`Coupon ${c.code} already exists`);
      }
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
