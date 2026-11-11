const { getRazorpay } = require('../config/Payment');
const Payment = require('../models/Payment');

let stripeClient;
const getStripeClient = () => {
  if (stripeClient) return stripeClient;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  const Stripe = require('stripe');
  stripeClient = new Stripe(stripeKey, { apiVersion: '2022-11-15' });
  return stripeClient;
};

const createRazorpayOrder = async ({ amount, receipt }) => {
  return getRazorpay().orders.create({ amount, currency: 'INR', receipt });
};

const retrieveRazorpayPayment = async (paymentId) => {
  return getRazorpay().payments.fetch(paymentId);
};

const createStripePaymentIntent = async ({ amount, currency, metadata }) => {
  const stripe = getStripeClient();
  return stripe.paymentIntents.create({ amount, currency, metadata });
};

const retrieveStripePaymentIntent = async (paymentIntentId) => {
  const stripe = getStripeClient();
  return stripe.paymentIntents.retrieve(paymentIntentId);
};

const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const crypto = require('crypto');
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const expected = Buffer.from(generatedSignature);
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(
    expected,
    actual
  );
};

const savePayment = async (paymentData) => {
  return Payment.create(paymentData);
};

const getPaymentHistoryForUser = async (userId) => {
  return Payment.find({ userId }).sort({ createdAt: -1 });
};

const handleWebhook = async (req) => {
  const event = req.body;
  if (event.type === 'payment_intent.succeeded') {
    const payment = await Payment.findOne({ transactionId: event.data.object.id });
    if (payment) {
      payment.paymentStatus = 'SUCCESS';
      await payment.save();
    }
  }
  return event;
};

module.exports = {
  createRazorpayOrder,
  retrieveRazorpayPayment,
  createStripePaymentIntent,
  retrieveStripePaymentIntent,
  verifyRazorpaySignature,
  savePayment,
  getPaymentHistoryForUser,
  handleWebhook,
};
