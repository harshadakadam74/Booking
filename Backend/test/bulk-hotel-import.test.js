const test = require('node:test');
const assert = require('node:assert/strict');
const AdminController = require('../controllers/AdminController');
const Property = require('../models/Property');

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const hotel = (name, overrides = {}) => ({
  name,
  city: 'Pune',
  location: 'Pune, Maharashtra, India',
  address: '12 Sample Road',
  price: 2500,
  totalRooms: 10,
  availableRooms: 8,
  images: ['https://example.com/hotel.jpg'],
  roomTypes: [{ name: 'Standard', price: 2500, maxGuests: 2, totalRooms: 10, availableRooms: 8 }],
  ...overrides,
});

const mockExistingHotels = (rows = []) => {
  const originalFind = Property.find;
  Property.find = () => ({
    select() { return this; },
    lean: async () => rows,
  });
  return () => { Property.find = originalFind; };
};

test('bulk hotel preview reports valid rows, duplicates, and invalid rows without writing', async () => {
  const restoreFind = mockExistingHotels();
  const originalCreate = Property.create;
  let createCalled = false;
  Property.create = async () => { createCalled = true; };

  try {
    const response = createResponse();
    await AdminController.importProperties({
      body: {
        previewOnly: true,
        records: [
          hotel('Pune Hotel'),
          hotel('Pune Hotel'),
          hotel(''),
        ],
      },
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.valid, 1);
    assert.equal(response.body.data.failed, 2);
    assert.deepEqual(response.body.data.results.map((row) => row.status), ['ready', 'failed', 'failed']);
    assert.match(response.body.data.results[1].error, /Duplicates another hotel/);
    assert.equal(createCalled, false);
  } finally {
    restoreFind();
    Property.create = originalCreate;
  }
});

test('bulk hotel preview detects a listing already stored in the database', async () => {
  const restoreFind = mockExistingHotels([{
    name: 'Existing hotel',
    city: 'Pune',
    location: 'Pune, Maharashtra, India',
    address: '12 Sample Road',
  }]);

  try {
    const response = createResponse();
    await AdminController.importProperties({
      body: { previewOnly: true, records: [hotel('Existing hotel')] },
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.valid, 0);
    assert.equal(response.body.data.results[0].status, 'failed');
    assert.match(response.body.data.results[0].error, /already exists/);
  } finally {
    restoreFind();
  }
});

test('bulk hotel import returns per-record success and failure counts', async () => {
  const restoreFind = mockExistingHotels();
  const originalCreate = Property.create;
  const savedRecords = [];
  Property.create = async (record) => {
    if (record.name === 'Database failure') throw new Error('Simulated database failure');
    savedRecords.push(record);
    return { _id: record.name, ...record };
  };

  try {
    const response = createResponse();
    await AdminController.importProperties({
      body: {
        continueOnError: true,
        records: [
          hotel('Saved hotel', { approvalStatus: 'pending', active: false }),
          hotel('Database failure'),
        ],
      },
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.imported, 1);
    assert.equal(response.body.data.failed, 1);
    assert.deepEqual(response.body.data.results.map((row) => row.status), ['imported', 'failed']);
    assert.equal(response.body.data.properties[0].name, 'Saved hotel');
    assert.equal(savedRecords[0].approvalStatus, 'pending');
    assert.equal(savedRecords[0].active, false);
  } finally {
    restoreFind();
    Property.create = originalCreate;
  }
});
