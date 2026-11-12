const test = require('node:test');
const assert = require('node:assert/strict');
const destinations = require('../data/indiaDestinations');
const { parseHotelSearch, normalize, buildHotelPipeline } = require('../services/hotelSearch');
const {
  activeBookingStatuses,
  findRoomType,
  getRemainingRooms,
} = require('../services/bookingInventory');
const BookingController = require('../controllers/BookingController');
const { propertyOwner } = require('../middlewares/PropertyOwnerMiddleware');
const { validateDestination } = require('../controllers/DestinationController');
const PaymentService = require('../services/PaymentService');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const PropertyController = require('../controllers/PropertyController');
const mongoose = require('mongoose');
const Destination = require('../models/Destination');

const expectedStatesAndTerritories = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

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

test('curated destinations cover every Indian state and union territory', () => {
  const states = new Set(destinations
    .filter((destination) => destination.country === 'India' && destination.type !== 'country')
    .map((destination) => destination.state));
  assert.deepEqual([...states].sort(), [...expectedStatesAndTerritories].sort());
  assert.ok(destinations.length >= 100);
  assert.ok(destinations.every((destination) => (
    typeof destination.country === 'string' && destination.country.length > 1 &&
    destination.coordinates.latitude >= -90 &&
    destination.coordinates.latitude <= 90 &&
    destination.coordinates.longitude >= -180 &&
    destination.coordinates.longitude <= 180 &&
    Array.isArray(destination.aliases)
  )));
});

test('destination aliases and normalized keys are unique and support common spellings', () => {
  const normalizedNames = destinations.map((destination) => destination.normalizedName);
  assert.equal(new Set(normalizedNames).size, normalizedNames.length);
  assert.ok(destinations.some((destination) => destination.name === 'Bengaluru' && destination.aliases.includes('Bangalore')));
  assert.ok(destinations.some((destination) => destination.name === 'Mysuru' && destination.aliases.includes('Mysore')));
  assert.ok(destinations.some((destination) => destination.name === 'Puducherry' && destination.aliases.includes('Pondicherry')));
  for (const name of ['Nanded', 'Hingoli', 'Hyderabad', 'New Delhi', 'Goa', 'Dubai', 'London', 'Paris', 'Singapore', 'Bangkok', 'New York', 'Tokyo', 'Maldives', 'Bali', 'Switzerland', 'India', 'United States']) {
    assert.ok(destinations.some((destination) => destination.name === name), `${name} is present in the destination catalog`);
  }
});

test('destination validation rejects incomplete or malformed coordinates', () => {
  const destination = {
    name: 'Test City',
    state: 'Test State',
    country: 'India',
    type: 'City',
  };
  assert.match(validateDestination({
    ...destination,
    coordinates: { latitude: 12.9, longitude: '' },
  }).error, /both latitude and longitude/i);
  assert.match(validateDestination({
    ...destination,
    coordinates: null,
  }).error, /coordinates must be an object/i);
});

test('hotel search accepts optional filters and normalizes amenities case-insensitively', () => {
  const parsed = parseHotelSearch({
    destination: 'Bangalore',
    guests: '2',
    rooms: '1',
    amenities: 'Wi-Fi, parking',
    propertyType: 'Hotel',
    page: '2',
    limit: '10',
  });
  assert.equal(parsed.error, undefined);
  assert.deepEqual(parsed.criteria.amenities, ['wi-fi', 'parking']);
  assert.equal(parsed.criteria.budget, undefined);
  assert.equal(parsed.criteria.page, 2);
  assert.equal(parsed.criteria.includeDemo, true);
});

test('city alias, hotel name, price range, sort, and work-trip filters are accepted', () => {
  const parsed = parseHotelSearch({
    city: 'Mumbai, India',
    hotelName: 'Central',
    minPrice: '1000',
    maxPrice: '5000',
    workTrip: 'true',
    sortBy: 'rating',
  });
  assert.equal(parsed.error, undefined);
  assert.equal(parsed.criteria.destination, 'Mumbai, India');
  assert.equal(parsed.criteria.minPrice, 1000);
  assert.equal(parsed.criteria.budget, 5000);
  assert.equal(parsed.criteria.workTrip, true);
  assert.equal(parsed.criteria.sortBy, 'rating');
  assert.equal(parsed.criteria.hotelName, 'Central');
});

test('Mumbai with a country suffix resolves as a city, not all hotels in that country', async () => {
  const originalFindOne = Destination.findOne;
  Destination.findOne = () => ({
    lean: async () => ({
      name: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      aliases: ['Bombay'],
    }),
  });
  try {
    const parsed = parseHotelSearch({ city: 'Mumbai, India' });
    const pipeline = await buildHotelPipeline(parsed.criteria);
    const destinationFilter = pipeline[0].$match.$and.find((clause) =>
      clause.$or?.some((part) => part.normalizedCity));
    assert.deepEqual(destinationFilter.$or[0].normalizedCity.$in, ['mumbai', 'bombay']);
    assert.equal(destinationFilter.$or.some((part) => part.country), false);
  } finally {
    Destination.findOne = originalFindOne;
  }
});

test('all requested amenities remain required and are whitespace-normalized', () => {
  const parsed = parseHotelSearch({
    destination: 'Delhi',
    amenities: [' WiFi ', ' parking '],
  });
  assert.deepEqual(parsed.criteria.amenities, ['wifi', 'parking']);
});

test('destination, currency, type, and all amenity constraints combine without broad hotel-name matching', async () => {
  const originalFindOne = Destination.findOne;
  Destination.findOne = () => ({
    lean: async () => ({
      name: 'New Delhi',
      state: 'Delhi',
      aliases: ['Delhi', 'NCR'],
    }),
  });
  try {
    const parsed = parseHotelSearch({
      destination: ' DELHI ',
      budget: '3000',
      currency: 'INR',
      propertyType: 'Hotel',
      amenities: ['WiFi', ' Parking '],
      guests: '2',
      rooms: '1',
    });
    const pipeline = await buildHotelPipeline(parsed.criteria);
    const match = pipeline[0].$match;
    assert.equal(match.price.$lte, 3000);
    assert.ok(match.$and.some((clause) => clause.$or?.some((part) => part.currency)));
    assert.ok(match.$and.some((clause) => clause.$or?.some((part) => part.propertyType)));
    assert.equal(match.$and.filter((clause) => clause.$or?.some((part) => part.amenities)).length, 2);
    assert.ok(match.$and.some((clause) => clause.$or?.some((part) => part.normalizedCity)));
    assert.equal(match.$and.some((clause) => clause.$or?.some((part) => part.name)), false);
    assert.equal(pipeline.some((stage) => stage.$lookup), false);
  } finally {
    Destination.findOne = originalFindOne;
  }
});

test('budget is used as entered in its stated currency without conversion', () => {
  for (const budget of [2, 2000, 3000, 5000]) {
    const parsed = parseHotelSearch({
      destination: ' Delhi ',
      budget: String(budget),
      currency: 'inr',
      guests: '2',
      rooms: '1',
    });
    assert.equal(parsed.error, undefined);
    assert.equal(parsed.criteria.destination, 'Delhi');
    assert.equal(parsed.criteria.budget, budget);
    assert.equal(parsed.criteria.currency, 'INR');
  }
});

test('destination normalization ignores case and surrounding whitespace', () => {
  assert.equal(normalize('  DELHI '), normalize('delhi'));
  assert.equal(normalize('  Delhi  '), 'delhi');
});

test('hotel search rejects malformed dates, budgets, guest counts, and amenity lists', () => {
  assert.match(parseHotelSearch({ destination: 'Pune', budget: '-1' }).error, /Budget/);
  assert.match(parseHotelSearch({ destination: 'Pune', guests: '0' }).error, /Guests/);
  assert.match(parseHotelSearch({ destination: 'Pune', rooms: '3', guests: '2' }).error, /Rooms/);
  assert.match(parseHotelSearch({ destination: 'Pune', checkIn: 'not-a-date', checkOut: '2030-01-03' }).error, /dates/);
  assert.match(parseHotelSearch({ destination: 'Pune', amenities: Array(16).fill('wifi') }).error, /amenities/i);
});

test('date search requires a future, increasing stay range', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);
  assert.equal(BookingController.getDateRangeError(tomorrow, dayAfter), '');
  assert.match(BookingController.getDateRangeError(dayAfter, tomorrow), /after check-in/);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  assert.match(BookingController.getDateRangeError(yesterday, tomorrow), /past/);
});

test('booking eligibility rejects an invalid MongoDB hotel ID', async () => {
  const response = createResponse();
  await BookingController.getBookingEligibility({
    body: {
      propertyId: 'not-an-object-id',
      checkInDate: 'invalid',
      checkOutDate: '2030-01-03',
      numberOfGuests: 0,
      numberOfRooms: 0,
    },
  }, response);

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /valid hotel ID/i);
});

test('hotel lookup distinguishes malformed IDs, missing hotels, and successful reads', async () => {
  const invalidResponse = createResponse();
  await PropertyController.getPropertyById({ params: { id: 'invalid' } }, invalidResponse);
  assert.equal(invalidResponse.statusCode, 400);

  const originalFindById = Property.findById;
  try {
    Property.findById = () => ({ lean: async () => null });
    const missingResponse = createResponse();
    await PropertyController.getPropertyById({
      params: { id: '507f1f77bcf86cd799439011' },
    }, missingResponse);
    assert.equal(missingResponse.statusCode, 404);

    const expectedHotel = { _id: '507f1f77bcf86cd799439011', name: 'Test Hotel' };
    Property.findById = () => ({ lean: async () => expectedHotel });
    const foundResponse = createResponse();
    await PropertyController.getPropertyById({
      params: { id: expectedHotel._id },
    }, foundResponse);
    assert.equal(foundResponse.statusCode, 200);
    assert.deepEqual(foundResponse.body.property, expectedHotel);
  } finally {
    Property.findById = originalFindById;
  }
});

test('billing address accepts Indian PIN formats without city-to-PIN mappings', () => {
  for (const [city, zipCode] of [
    ['Nanded', '431600'],
    ['Basmath', '431512'],
  ]) {
    const result = BookingController.validateBillingAddress({
      address: '12 Example Road',
      city,
      state: 'Maharashtra',
      zipCode,
      country: 'IN',
    });
    assert.equal(result.error, undefined);
  }

  assert.match(BookingController.validateBillingAddress({
    address: '12 Example Road',
    city: 'Nanded',
    state: 'Maharashtra',
    zipCode: '43160',
    country: 'IN',
  }).error, /6-digit Indian PIN/i);
});

test('Razorpay signatures are verified safely, including malformed signatures', () => {
  const crypto = require('crypto');
  const orderId = 'order_test';
  const paymentId = 'payment_test';
  const secret = 'test-secret';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  assert.equal(PaymentService.verifyRazorpaySignature(orderId, paymentId, signature, secret), true);
  assert.equal(PaymentService.verifyRazorpaySignature(orderId, paymentId, 'bad', secret), false);
  assert.equal(PaymentService.verifyRazorpaySignature('', paymentId, signature, secret), false);
});

test('room inventory cannot exceed the smaller of listed and total room counts', () => {
  assert.equal(getRemainingRooms({ totalRooms: 10, availableRooms: 8 }, 3), 5);
  assert.equal(getRemainingRooms({ totalRooms: 10, availableRooms: 0 }, 0), 0);
  assert.equal(getRemainingRooms({ totalRooms: 4, availableRooms: 4 }, 5), 0);
  assert.equal(getRemainingRooms({ totalRooms: 4 }, 1), 3);
});

test('embedded room types are resolved by ID and inventory is bounded by listed and total counts', () => {
  const roomTypeId = new mongoose.Types.ObjectId();
  const property = {
    roomTypes: [{
      _id: roomTypeId,
      name: 'Standard',
      totalRooms: 4,
      availableRooms: 3,
    }],
  };

  assert.equal(findRoomType(property, roomTypeId.toString()).name, 'Standard');
  assert.equal(findRoomType(property, new mongoose.Types.ObjectId().toString()), null);
  assert.equal(getRemainingRooms(property.roomTypes[0], 2), 1);
});

test('pending, confirmed, and checked-in bookings all consume inventory', () => {
  assert.deepEqual(activeBookingStatuses, ['PENDING', 'CONFIRMED', 'CHECKED_IN']);
});

test('legacy bookings remain valid without the optional property reference', async () => {
  const booking = new Booking({
    user: new mongoose.Types.ObjectId(),
    property: 'Legacy Hotel',
    checkInDate: new Date('2030-01-01'),
    checkOutDate: new Date('2030-01-02'),
    numberOfGuests: 1,
    numberOfRooms: 1,
    totalPrice: 100,
    pricePerNight: 100,
    numberOfNights: 1,
  });
  await booking.validate();
  assert.equal(booking.propertyId, undefined);
});

test('booking creation rejects invalid dates before hotel lookup', async () => {
  const response = createResponse();
  await BookingController.createBooking({
    body: {
      propertyId: '507f1f77bcf86cd799439011',
      checkInDate: '2030-01-03',
      checkOutDate: '2030-01-02',
      numberOfGuests: 2,
      numberOfRooms: 1,
    },
  }, response);
  assert.equal(response.statusCode, 400);
});

test('booking creation does not resolve hotels by name', async () => {
  const response = createResponse();
  await BookingController.createBooking({
    body: {
      property: 'Hotel entered by name',
      checkInDate: '2030-01-01',
      checkOutDate: '2030-01-02',
      numberOfGuests: 1,
      numberOfRooms: 1,
    },
    headers: {},
  }, response);
  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /hotel ID/i);
});

test('property-owner middleware rejects customers and allows property owners', () => {
  const response = createResponse();
  let continued = false;
  propertyOwner({ user: { role: 'CUSTOMER' } }, response, () => { continued = true; });
  assert.equal(response.statusCode, 403);
  assert.equal(continued, false);

  propertyOwner({ user: { role: 'OWNER' } }, createResponse(), () => { continued = true; });
  assert.equal(continued, true);
});
