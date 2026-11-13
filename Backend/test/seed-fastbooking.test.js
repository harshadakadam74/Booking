const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const backendPath = path.join(__dirname, '..');
const hotels = require(path.join(backendPath, 'hotels.json'));
const places = require(path.join(backendPath, 'places.json'));
const seedScript = fs.readFileSync(
  path.join(backendPath, 'scripts', 'seedFastBooking.js'),
  'utf8',
);

test('supplied local inventory contains 150 clearly labeled non-bookable demo listings and 109 places', () => {
  assert.equal(hotels.length, 150);
  assert.equal(places.length, 109);
  assert.equal(new Set(hotels.map((hotel) => hotel.externalListingId)).size, 150);
  assert.ok(hotels.every((hotel) => (
    hotel.name.startsWith('FastBooking Demo ') &&
    hotel.description.startsWith('DEMO ONLY:') &&
    hotel.isDemo === true &&
    hotel.isVerified === false
  )));
});

test('supplied demo inventory seeder is local-only, confirmed, idempotent and booking-disabled', () => {
  assert.match(seedScript, /process\.env\.NODE_ENV !== 'development'/);
  assert.match(seedScript, /isLoopbackMongoUri\(process\.env\.MONGO_URI\)/);
  assert.match(seedScript, /--confirm-demo/);
  assert.match(seedScript, /upsert: true/);
  assert.match(seedScript, /isDemo: true/);
  assert.match(seedScript, /isVerified: false/);
  assert.match(seedScript, /const demoHotelImages = \[/);
  assert.match(seedScript, /image: images\[0\]/);
  assert.match(seedScript, /images,/);
  assert.match(seedScript, /withImages: imageBearingHotels/);
  assert.match(seedScript, /bookingEnabled: false/);
});
