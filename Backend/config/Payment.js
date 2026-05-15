const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-11-15',
});

const createPaymentIntent = async ({ amount, currency = 'usd', metadata = {} }) => {
  return stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    payment_method_types: ['card'],
  });
};

const retrievePaymentIntent = async (paymentIntentId) => {
  return stripe.paymentIntents.retrieve(paymentIntentId);
};

module.exports = {
  stripe,
  createPaymentIntent,
  retrievePaymentIntent,
};