const Razorpay = require('razorpay');

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured');
  }

  if (process.env.RAZORPAY_KEY_ID.includes('your_') ||
      process.env.RAZORPAY_KEY_ID.includes('replace_') ||
      process.env.RAZORPAY_KEY_SECRET.includes('your_') ||
      process.env.RAZORPAY_KEY_SECRET.includes('replace_')) {
    throw new Error('Replace Razorpay placeholder credentials with Test Mode keys');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

module.exports = { getRazorpay };