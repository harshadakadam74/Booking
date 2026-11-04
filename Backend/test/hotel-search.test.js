const test = require('node:test');
const assert = require('node:assert/strict');
const destinations = require('../data/indiaDestinations');
const { parseHotelSearch } = require('../services/hotelSearch');
const { activeBookingStatuses, getRemainingRooms } = require('../services/bookingInventory');
const BookingController = require('../controllers/BookingController');
const { propertyOwner } = require('../middlewares/PropertyOwnerMiddleware');
const { validateDestination } = require('../controllers/DestinationController');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

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
  const states = new Set(destinations.map((destination) => destination.state));
  assert.deepEqual([...states].sort(), [...expectedStatesAndTerritories].sort());
  assert.ok(destinations.length >= 100);
  assert.ok(destinations.every((destination) => (
    destination.country === 'India' &&
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

test('room inventory cannot exceed the smaller of listed and total room counts', () => {
  assert.equal(getRemainingRooms({ totalRooms: 10, availableRooms: 8 }, 3), 5);
  assert.equal(getRemainingRooms({ totalRooms: 10, availableRooms: 0 }, 0), 0);
  assert.equal(getRemainingRooms({ totalRooms: 4, availableRooms: 4 }, 5), 0);
  assert.equal(getRemainingRooms({ totalRooms: 4 }, 1), 3);
});

test('pending, confirmed, and checked-in bookings all consume inventory', () => {
  assert.deepEqual(activeBookingStatuses, ['PENDING', 'CONFIRMED', 'CHECKED_IN']);
});

test('legacy bookings remain valid without the optional property reference', () => {
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
  assert.equal(booking.validateSync(), undefined);
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

test('property-owner middleware rejects customers and allows property owners', () => {
  const response = createResponse();
  let continued = false;
  propertyOwner({ user: { role: 'CUSTOMER' } }, response, () => { continued = true; });
  assert.equal(response.statusCode, 403);
  assert.equal(continued, false);

  propertyOwner({ user: { role: 'OWNER' } }, createResponse(), () => { continued = true; });
  assert.equal(continued, true);
});
