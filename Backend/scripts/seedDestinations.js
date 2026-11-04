const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const destinations = require('../data/indiaDestinations');
const Destination = require('../models/Destination');

const run = async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be configured.');
  await mongoose.connect(process.env.MONGO_URI);
  const operations = destinations.map((destination) => ({
    updateOne: {
      filter: { normalizedName: destination.normalizedName },
      update: { $setOnInsert: destination },
      upsert: true,
    },
  }));
  const result = await Destination.bulkWrite(operations, { ordered: false });
  console.log(`Destinations seeded: ${result.upsertedCount} added; existing records left unchanged.`);
};

run()
  .catch((error) => {
    console.error('Destination seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
