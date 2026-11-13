const mongoose = require('mongoose');

const databaseConnect = async (uri = process.env.MONGO_URI) => {
  if (typeof uri !== 'string' || !uri.trim()) {
    throw new Error('MONGO_URI is missing. Create Backend/.env from Backend/.env.example and set your MongoDB connection URL.');
  }

  try {
    await mongoose.connect(uri.trim(), {
      family: 4,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('Database connected successfully');
  } catch (error) {
    const code = error.code ? ` (${error.code})` : '';
    throw new Error(
      `MongoDB connection failed${code}. Check that MongoDB is running and that MONGO_URI in Backend/.env is correct.`,
      { cause: error },
    );
  }
};

module.exports = databaseConnect;