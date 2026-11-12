const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const script = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'seedHotels.js'), 'utf8');

test('hotel seeder covers each requested Indian city with two development-only demos', () => {
  const expectedCities = [
    'Jaipur', 'Mumbai', 'Pune', 'Delhi', 'Goa', 'Hyderabad', 'Bengaluru', 'Chennai',
    'Udaipur', 'Agra', 'Manali', 'Shimla', 'Lonavala', 'Nashik', 'Mahabaleshwar', 'Nanded',
    'Aurangabad', 'Amritsar', 'Kolkata', 'Varanasi',
  ];
  for (const city of expectedCities) assert.match(script, new RegExp(`\\['${city}',`));
  assert.match(script, /\\[1, 2\\]\.map/);
  assert.match(script, /isDemo: true/);
  assert.match(script, /approvalStatus: 'pending'/);
  assert.match(script, /active: false/);
});

test('hotel seeder uses insert-only upserts and guards against non-development execution', () => {
  assert.match(script, /process\.env\.NODE_ENV !== 'development'/);
  assert.match(script, /update: \{ \$setOnInsert: listing \}/);
  assert.match(script, /upsert: true/);
  assert.match(script, /countDocuments\(/);
  assert.match(script, /existingListingsPreserved: true/);
  assert.match(script, /bookingEnabled: false/);
});

test('development seed labels synthetic data and does not fabricate reviews or photos', () => {
  assert.match(script, /DEVELOPMENT DEMO ONLY/);
  assert.match(script, /amenities: \['Development sample amenity \(not verified\)'\]/);
  assert.doesNotMatch(script, /ratingCount:|rating:|images:/);
});
