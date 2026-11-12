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

test('admin hotel listing returns the compatible hotels and pagination response shape', async () => {
  const originalFind = Property.find;
  const originalCountDocuments = Property.countDocuments;
  const rows = [{ _id: 'hotel-1', name: 'Test Hotel' }];
  let filterUsedByCount;
  Property.find = () => ({
    sort() { return this; },
    skip() { return this; },
    limit() { return this; },
    lean: async () => rows,
  });
  Property.countDocuments = async (filter) => {
    filterUsedByCount = filter;
    return 12;
  };

  try {
    const response = createResponse();
    await AdminController.getAllProperties({
      query: {
        page: '2',
        limit: '5',
        search: 'Jaipur',
        city: 'Jaipur',
        status: 'active',
        approvalStatus: 'approved',
      },
    }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body.data.hotels, rows);
    assert.deepEqual(response.body.data.properties, rows);
    assert.equal(response.body.data.total, 12);
    assert.equal(response.body.data.page, 2);
    assert.equal(response.body.data.totalPages, 3);
    assert.deepEqual(response.body.data.pagination, {
      page: 2,
      limit: 5,
      total: 12,
      pages: 3,
    });
    assert.equal(filterUsedByCount.$or[0].name.test('Hotel in Jaipur'), true);
    assert.equal(filterUsedByCount.$and[0].$or[0].city.test('Jaipur'), true);
    assert.deepEqual(filterUsedByCount.active, { $ne: false });
    assert.equal(filterUsedByCount.approvalStatus, 'approved');
  } finally {
    Property.find = originalFind;
    Property.countDocuments = originalCountDocuments;
  }
});
