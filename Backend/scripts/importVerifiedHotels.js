const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Property = require('../models/Property');

const validHttpUrl = (value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const validateListing = (listing, index) => {
  const label = `records[${index}]`;
  if (!listing || typeof listing !== 'object' ||
    typeof listing.name !== 'string' || listing.name.trim().length < 2 || listing.name.trim().length > 120 ||
    typeof listing.city !== 'string' || listing.city.trim().length < 2 || listing.city.trim().length > 100 ||
    typeof listing.state !== 'string' || listing.state.trim().length < 2 || listing.state.trim().length > 100 ||
    typeof listing.externalListingId !== 'string' || !listing.externalListingId.trim() || listing.externalListingId.length > 200 ||
    typeof listing.sourceProvider !== 'string' || !listing.sourceProvider.trim() || listing.sourceProvider.length > 100 ||
    (listing.country !== undefined && (typeof listing.country !== 'string' || listing.country.trim().length < 2 || listing.country.trim().length > 100))) {
    throw new Error(`${label} requires name, city, state, sourceProvider, and externalListingId.`);
  }
  const maxGuestsPerRoom = listing.maxGuestsPerRoom === undefined ? 4 : Number(listing.maxGuestsPerRoom);
  const currency = listing.currency === undefined ? 'INR' : listing.currency;
  const propertyType = listing.propertyType || listing.type || 'Hotel';
  if (listing.price === undefined || listing.price === '' ||
    !Number.isFinite(Number(listing.price)) || Number(listing.price) < 0 ||
    Number(listing.price) > 100000000 ||
    !Number.isInteger(Number(listing.totalRooms)) || Number(listing.totalRooms) < 1 ||
    Number(listing.totalRooms) > 100000 ||
    !Number.isInteger(Number(listing.availableRooms)) || Number(listing.availableRooms) < 0 ||
    Number(listing.availableRooms) > Number(listing.totalRooms) ||
    !Number.isInteger(maxGuestsPerRoom) || maxGuestsPerRoom < 1 || maxGuestsPerRoom > 20) {
    throw new Error(`${label} has invalid price or room inventory.`);
  }
  if (typeof currency !== 'string' || !/^[A-Za-z]{3}$/.test(currency) ||
    typeof propertyType !== 'string' || propertyType.trim().length < 2 || propertyType.trim().length > 60 ||
    typeof (listing.description || '') !== 'string' || (listing.description || '').length > 4000 ||
    typeof (listing.location || `${listing.city}, ${listing.state}, India`) !== 'string' ||
    (listing.location || '').length > 200 ||
    typeof (listing.streetAddress || '') !== 'string' || (listing.streetAddress || '').length > 250) {
    throw new Error(`${label} has invalid property details, currency, or address.`);
  }
  if (!Array.isArray(listing.amenities || []) || (listing.amenities || []).length > 40 ||
    (listing.amenities || []).some((amenity) => (
      typeof amenity !== 'string' || !amenity.trim() || amenity.trim().length > 60
    ))) {
    throw new Error(`${label}.amenities must contain at most 40 non-empty strings of 60 characters or fewer.`);
  }
  if (!Array.isArray(listing.facilities || []) || (listing.facilities || []).length > 40 ||
    (listing.facilities || []).some((facility) => (
      typeof facility !== 'string' || !facility.trim() || facility.trim().length > 60
    ))) {
    throw new Error(`${label}.facilities must contain at most 40 non-empty strings of 60 characters or fewer.`);
  }
  if (!Array.isArray(listing.roomTypes || []) || (listing.roomTypes || []).length > 20 ||
    (listing.roomTypes || []).some((room) => (
      !room || typeof room !== 'object' ||
      typeof room.name !== 'string' || !room.name.trim() || room.name.trim().length > 80 ||
      (room.price !== undefined && (!Number.isFinite(Number(room.price)) || Number(room.price) < 0)) ||
      (room.maxGuests !== undefined && (!Number.isInteger(Number(room.maxGuests)) || Number(room.maxGuests) < 1 || Number(room.maxGuests) > 20)) ||
      (room.totalRooms !== undefined && (!Number.isInteger(Number(room.totalRooms)) || Number(room.totalRooms) < 0)) ||
      (room.availableRooms !== undefined && (!Number.isInteger(Number(room.availableRooms)) || Number(room.availableRooms) < 0)) ||
      (room.totalRooms !== undefined && room.availableRooms !== undefined && Number(room.availableRooms) > Number(room.totalRooms))
    ))) {
    throw new Error(`${label}.roomTypes contains invalid names, prices, capacity, or inventory.`);
  }
  for (const field of ['checkInTime', 'checkOutTime']) {
    if (listing[field] !== undefined && !/^([01]\d|2[0-3]):[0-5]\d$/.test(listing[field])) {
      throw new Error(`${label}.${field} must use 24-hour HH:mm format.`);
    }
  }
  if (listing.category !== undefined &&
    (typeof listing.category !== 'string' || listing.category.trim().length < 2 || listing.category.trim().length > 100)) {
    throw new Error(`${label}.category must contain between 2 and 100 characters.`);
  }
  if (listing.workTripFriendly !== undefined && typeof listing.workTripFriendly !== 'boolean') {
    throw new Error(`${label}.workTripFriendly must be true or false.`);
  }
  const images = listing.images || (listing.image ? [listing.image] : []);
  if (!Array.isArray(images) || images.length > 20 || images.some((image) => !validHttpUrl(image))) {
    throw new Error(`${label}.images must contain at most 20 HTTP(S) URLs.`);
  }
  const hasLatitude = listing.latitude !== undefined && listing.latitude !== '';
  const hasLongitude = listing.longitude !== undefined && listing.longitude !== '';
  if (hasLatitude !== hasLongitude) {
    throw new Error(`${label} must provide valid latitude and longitude together.`);
  }
  if (hasLatitude && hasLongitude) {
    if (!Number.isFinite(Number(listing.latitude)) || Number(listing.latitude) < -90 ||
      Number(listing.latitude) > 90 || !Number.isFinite(Number(listing.longitude)) ||
      Number(listing.longitude) < -180 || Number(listing.longitude) > 180) {
      throw new Error(`${label} must provide valid latitude and longitude together.`);
    }
  }
  if (listing.rating !== undefined &&
    (listing.rating === '' || !Number.isFinite(Number(listing.rating)) || Number(listing.rating) < 0 || Number(listing.rating) > 5 ||
      !Number.isInteger(Number(listing.ratingCount)) || Number(listing.ratingCount) < 1 ||
      typeof listing.ratingSource !== 'string' || !listing.ratingSource.trim())) {
    throw new Error(`${label} ratings require a value from 0 to 5, a positive ratingCount, and ratingSource.`);
  }
  if (listing.ratingCount !== undefined &&
    (!Number.isInteger(Number(listing.ratingCount)) || Number(listing.ratingCount) < 0)) {
    throw new Error(`${label}.ratingCount must be a non-negative whole number.`);
  }
};

const run = async () => {
  const inputPath = process.argv[2];
  if (!inputPath) throw new Error('Usage: npm run import:verified-hotels -- <authorized-listings.json>');
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be configured.');
  const resolvedPath = path.resolve(process.cwd(), inputPath);
  const records = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
  if (!Array.isArray(records) || records.length === 0 || records.length > 5000) {
    throw new Error('Input must be a non-empty JSON array of at most 5000 listings.');
  }
  records.forEach(validateListing);

  await mongoose.connect(process.env.MONGO_URI);
  const operations = records.map((listing) => {
    const latitude = listing.latitude;
    const longitude = listing.longitude;
    const document = {
      name: listing.name.trim(),
      location: (listing.location || `${listing.city}, ${listing.state}, India`).trim(),
      streetAddress: String(listing.streetAddress || '').trim(),
      city: listing.city.trim(),
      state: listing.state.trim(),
      country: String(listing.country || 'India').trim(),
      currency: String(listing.currency || 'INR').toUpperCase(),
      type: String(listing.propertyType || listing.type || 'Hotel').trim(),
      propertyType: String(listing.propertyType || listing.type || 'Hotel').trim(),
      category: String(listing.category || listing.propertyType || listing.type || 'Hotel').trim(),
      description: String(listing.description || '').trim(),
      image: (listing.images || [listing.image]).filter(Boolean)[0] || '',
      images: (listing.images || [listing.image]).filter(Boolean),
      price: Number(listing.price),
      totalRooms: Number(listing.totalRooms),
      availableRooms: Number(listing.availableRooms),
      maxGuestsPerRoom: Number(listing.maxGuestsPerRoom || 4),
      amenities: listing.amenities || [],
      facilities: listing.facilities || [],
      roomTypes: listing.roomTypes || [],
      checkInTime: listing.checkInTime || '15:00',
      checkOutTime: listing.checkOutTime || '11:00',
      workTripFriendly: listing.workTripFriendly || false,
      rating: listing.rating === undefined ? null : Number(listing.rating),
      ratingCount: listing.ratingCount === undefined ? 0 : Number(listing.ratingCount),
      ratingSource: listing.ratingSource ? String(listing.ratingSource) : '',
      ...(latitude !== undefined && longitude !== undefined
        ? { geoLocation: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] } }
        : {}),
      listingSource: 'authorized_api',
      sourceProvider: listing.sourceProvider.trim(),
      externalListingId: listing.externalListingId.trim(),
      isVerified: false,
      isDemo: false,
      approvalStatus: 'approved',
      active: true,
    };
    return {
      updateOne: {
        filter: {
          listingSource: 'authorized_api',
          sourceProvider: document.sourceProvider,
          externalListingId: document.externalListingId,
        },
        update: { $set: document },
        upsert: true,
      },
    };
  });
  const result = await Property.bulkWrite(operations, { ordered: false });
  console.log(`External listings imported: ${result.upsertedCount} added, ${result.modifiedCount} updated.`);
};

run()
  .catch((error) => {
    console.error('Verified hotel import failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
