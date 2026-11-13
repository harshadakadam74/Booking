const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const databaseConnect = require('../config/db');

test('database connection reports when MONGO_URI is not configured', async () => {
  await assert.rejects(
    databaseConnect('  '),
    /MONGO_URI is missing.*Backend\/\.env\.example/,
  );
});

test('database connection passes the configured URI and connection timeout to mongoose', async () => {
  const originalConnect = mongoose.connect;
  let connection;
  mongoose.connect = async (uri, options) => {
    connection = { uri, options };
    return mongoose;
  };

  try {
    await databaseConnect(' mongodb://localhost:27017/booking ');
    assert.equal(connection.uri, 'mongodb://localhost:27017/booking');
    assert.deepEqual(connection.options, {
      family: 4,
      serverSelectionTimeoutMS: 10000,
    });
  } finally {
    mongoose.connect = originalConnect;
  }
});

test('database connection returns a clear error when MongoDB cannot be reached', async () => {
  const originalConnect = mongoose.connect;
  const connectionError = Object.assign(new Error('connection refused'), {
    code: 'ECONNREFUSED',
  });
  mongoose.connect = async () => {
    throw connectionError;
  };

  try {
    await assert.rejects(
      databaseConnect('mongodb://localhost:27017/booking'),
      (error) => {
        assert.match(error.message, /MongoDB connection failed \(ECONNREFUSED\)/);
        assert.match(error.message, /Check that MongoDB is running/);
        assert.equal(error.cause, connectionError);
        return true;
      },
    );
  } finally {
    mongoose.connect = originalConnect;
  }
});
