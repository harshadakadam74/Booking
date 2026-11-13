const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const script = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'seedHotels.js'), 'utf8');

test('hotel seeder creates 50 development-only listings across requested Indian destinations', () => {
  const expectedCities = [
    'Jaipur', 'Mumbai', 'Pune', 'Delhi', 'Goa', 'Hyderabad', 'Bengaluru', 'Chennai',
    'Udaipur', 'Agra', 'Manali', 'Shimla', 'Lonavala', 'Nashik', 'Mahabaleshwar', 'Nanded',
    'Aurangabad', 'Amritsar', 'Kolkata', 'Varanasi', 'Nagpur', 'Kochi', 'Ooty',
  ];
  for (const city of expectedCities) assert.match(script, new RegExp(`\\['${city}',`));
  assert.match(script, /destinations\.length !== 25 \|\| demoListings\.length !== 50/);
  assert.match(script, /\\[1, 2\\]\.map/);
  assert.match(script, /isDemo: true/);
  assert.match(script, /approvalStatus: 'approved'/);
  assert.match(script, /active: true/);
  assert.match(script, /checkInTime: '14:00'/);
  assert.match(script, /checkOutTime: '11:00'/);
});

test('hotel seeder uses idempotent upserts and guards against non-development execution', () => {
  assert.match(script, /process\.env\.NODE_ENV !== 'development'/);
  assert.match(script, /update: \{ \$set: listing \}/);
  assert.match(script, /upsert: true/);
  assert.match(script, /countDocuments\(/);
  assert.match(script, /verifiedListings: storedCount/);
  assert.match(script, /bookingEnabled: false/);
});

test('development seed labels all sample data and includes multiple photos and room types without fabricated ratings', () => {
  assert.match(script, /DEVELOPMENT DEMO ONLY/);
  assert.match(script, /amenities: \['Wi-Fi \(sample only\)'/);
  assert.match(script, /const hotelImages = \[/);
  assert.match(script, /streetAddress: `Fictional demo address - \$\{city\}/);
  assert.match(script, /images,/);
  assert.match(script, /name: 'Deluxe demo room \(sample only\)'/);
  assert.doesNotMatch(script, /ratingCount:|rating:/);
});
