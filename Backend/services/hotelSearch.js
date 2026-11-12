const Property = require('../models/Property');
const Destination = require('../models/Destination');
const Booking = require('../models/Booking');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalize = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

const parseHotelSearch = (query = {}) => {
  const rawDestination = query.destination ?? query.city;
  if (rawDestination !== undefined && typeof rawDestination !== 'string') {
    return { error: 'Destination must be a string.' };
  }
  const destination = rawDestination?.trim() || '';
  if ((destination && destination.length < 2) || destination.length > 100) {
    return { error: 'Destination must contain between 2 and 100 characters when supplied.' };
  }
  const rawHotelName = query.hotelName ?? query.name;
  if (rawHotelName !== undefined && typeof rawHotelName !== 'string') {
    return { error: 'Hotel name search must be a string.' };
  }
  const hotelName = rawHotelName?.trim() || '';
  if (hotelName.length > 120) return { error: 'Hotel name search cannot exceed 120 characters.' };
  if ((query.state !== undefined && typeof query.state !== 'string') ||
    (query.country !== undefined && typeof query.country !== 'string')) {
    return { error: 'State and country filters must be strings.' };
  }
  const state = query.state?.trim() || '';
  const country = query.country?.trim() || '';
  if (state.length > 100 || country.length > 100) {
    return { error: 'State and country filters cannot exceed 100 characters.' };
  }

  const guests = query.guests === undefined ? 1 : Number(query.guests);
  const rooms = query.rooms === undefined ? 1 : Number(query.rooms);
  if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
    return { error: 'Guests must be a whole number between 1 and 20.' };
  }
  if (!Number.isInteger(rooms) || rooms < 1 || rooms > 10 || rooms > guests) {
    return { error: 'Rooms must be a whole number between 1 and 10, and cannot exceed guests.' };
  }

  let minPrice;
  if (query.minPrice !== undefined && query.minPrice !== '') {
    minPrice = Number(query.minPrice);
    if (!Number.isFinite(minPrice) || minPrice < 0 || minPrice > 100000000) {
      return { error: 'Minimum price must be between zero and 100000000.' };
    }
  }
  let budget;
  const maxPrice = query.maxPrice ?? query.budget;
  if (maxPrice !== undefined && maxPrice !== '') {
    budget = Number(maxPrice);
    if (!Number.isFinite(budget) || budget < 0 || budget > 100000000) {
      return { error: 'Budget (maximum price) must be between zero and 100000000.' };
    }
  }
  if (minPrice !== undefined && budget !== undefined && minPrice > budget) {
    return { error: 'Minimum price cannot exceed maximum price.' };
  }

  let minRating;
  if (query.minRating !== undefined && query.minRating !== '') {
    minRating = Number(query.minRating);
    if (!Number.isFinite(minRating) || minRating < 1 || minRating > 5) {
      return { error: 'Minimum rating must be between 1 and 5.' };
    }
  }

  const checkIn = query.checkIn ? new Date(query.checkIn) : null;
  const checkOut = query.checkOut ? new Date(query.checkOut) : null;
  if (Boolean(query.checkIn) !== Boolean(query.checkOut) ||
    (checkIn && Number.isNaN(checkIn.getTime())) ||
    (checkOut && Number.isNaN(checkOut.getTime()))) {
    return { error: 'Provide both valid check-in and check-out dates.' };
  }
  if (checkIn && checkOut) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkIn < today || checkOut <= checkIn) {
      return { error: 'Check-in must be today or later and check-out must follow check-in.' };
    }
  }

  const amenities = query.amenities === undefined || query.amenities === ''
    ? []
    : (Array.isArray(query.amenities) ? query.amenities : String(query.amenities).split(','))
      .map((item) => normalize(item))
      .filter(Boolean);
  if (amenities.length > 15 || amenities.some((item) => item.length > 60)) {
    return { error: 'Provide up to 15 amenities, each no longer than 60 characters.' };
  }
  const rawPropertyType = query.propertyType ?? query.type;
  if (rawPropertyType !== undefined && typeof rawPropertyType !== 'string') {
    return { error: 'Property type must be a string.' };
  }
  const propertyType = rawPropertyType?.trim() || '';
  if (propertyType.length > 60) return { error: 'Property type cannot exceed 60 characters.' };
  if (query.category !== undefined && typeof query.category !== 'string') {
    return { error: 'Hotel category must be a string.' };
  }
  const category = query.category?.trim() || '';
  if (category.length > 60) return { error: 'Hotel category cannot exceed 60 characters.' };
  if (query.currency !== undefined && typeof query.currency !== 'string') {
    return { error: 'Currency must be a three-letter currency code.' };
  }
  const currency = query.currency?.trim().toUpperCase() || '';
  if (currency && !/^[A-Z]{3}$/.test(currency)) {
    return { error: 'Currency must be a three-letter currency code.' };
  }
  if (query.sortBy !== undefined && typeof query.sortBy !== 'string') {
    return { error: 'Sort must be price, price_desc, rating, popularity, or newest.' };
  }
  const sortBy = query.sortBy?.trim().toLowerCase() || 'price_asc';
  const sortValues = {
    price: 'price_asc',
    price_asc: 'price_asc',
    price_desc: 'price_desc',
    rating: 'rating',
    popularity: 'popularity',
    newest: 'newest',
  };
  if (!Object.hasOwn(sortValues, sortBy)) {
    return { error: 'Sort must be price, price_desc, rating, popularity, or newest.' };
  }
  const workTrip = query.workTrip === undefined || query.workTrip === ''
    ? false
    : ['true', true].includes(query.workTrip)
      ? true
      : ['false', false].includes(query.workTrip)
        ? false
        : null;
  if (workTrip === null) return { error: 'workTrip must be true or false.' };

  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 12 : Number(query.limit);
  if (!Number.isInteger(page) || page < 1 || page > 100000 ||
    !Number.isInteger(limit) || limit < 1 || limit > 30) {
    return { error: 'Page must be a positive integer and limit must be between 1 and 30.' };
  }

  if (query.includeDemo !== undefined && !['true', 'false', true, false].includes(query.includeDemo)) {
    return { error: 'includeDemo must be true or false.' };
  }

  return {
    criteria: {
      destination,
      state,
      country,
      hotelName,
      guests,
      rooms,
      minPrice,
      budget,
      minRating,
      amenities: [...new Set(amenities)],
      propertyType,
      category,
      currency,
      sortBy: sortValues[sortBy],
      workTrip,
      checkIn,
      checkOut,
      page,
      limit,
      includeDemo: query.includeDemo === 'true' || query.includeDemo === true,
    },
  };
};

const buildHotelPipeline = async (criteria) => {
  const destinationParts = criteria.destination.split(',').map((part) => part.trim()).filter(Boolean);
  const primaryDestination = destinationParts[0] || '';
  const normalizedDestination = normalize(primaryDestination);
  const destination = criteria.destination ? await Destination.findOne({
    active: true,
    $or: [
      { normalizedName: normalizedDestination },
      { aliases: { $elemMatch: { $regex: `^${escapeRegex(primaryDestination)}$`, $options: 'i' } } },
      { state: new RegExp(`^${escapeRegex(primaryDestination)}$`, 'i') },
    ],
  }).lean() : null;
  const cityTerms = destination
    ? [destination.name, ...(destination.aliases || [])].map(normalize)
    : primaryDestination ? [normalize(primaryDestination)] : [];
  const stateTerm = destination ? normalize(destination.state) : '';
  const countryQuery = destinationParts.length === 1
    ? normalize(destination?.type === 'country' ? destination.country : normalizedDestination)
    : '';
  const legacyRegex = primaryDestination ? new RegExp(escapeRegex(primaryDestination), 'i') : null;
  const exactCityRegex = cityTerms.length
    ? new RegExp(`^(?:${cityTerms.map(escapeRegex).join('|')})$`, 'i')
    : legacyRegex;
  const locationRegex = cityTerms.length
    ? new RegExp(`(?:^|[,\\s])(?:${cityTerms.map(escapeRegex).join('|')})(?=$|[,\\s])`, 'i')
    : legacyRegex;
  const filter = {
    active: { $ne: false },
    $or: [{ approvalStatus: 'approved' }, { approvalStatus: { $exists: false } }],
  };
  if (!criteria.includeDemo) filter.isDemo = { $ne: true };
  if (criteria.minPrice !== undefined || criteria.budget !== undefined) {
    filter.price = {
      ...(criteria.minPrice !== undefined ? { $gte: criteria.minPrice } : {}),
      ...(criteria.budget !== undefined ? { $lte: criteria.budget } : {}),
    };
  }
  if (criteria.hotelName) {
    filter.name = new RegExp(escapeRegex(criteria.hotelName), 'i');
  }
  if (criteria.state) {
    filter.$and ||= [];
    filter.$and.push({
      $or: [
        { normalizedState: normalize(criteria.state) },
        { state: new RegExp(`^${escapeRegex(criteria.state)}$`, 'i') },
      ],
    });
  }
  if (criteria.country) {
    filter.$and ||= [];
    filter.$and.push({
      $or: [
        { normalizedCountry: normalize(criteria.country) },
        { country: new RegExp(`^${escapeRegex(criteria.country)}$`, 'i') },
      ],
    });
  }
  if (criteria.workTrip) filter.workTripFriendly = true;
  if (criteria.currency) {
    filter.$and ||= [];
    filter.$and.push({
      $or: [
        { currency: new RegExp(`^${escapeRegex(criteria.currency)}$`, 'i') },
        { currency: { $exists: false } },
      ],
    });
  }
  if (criteria.propertyType) {
    filter.$and ||= [];
    filter.$and.push({
      $or: [
        { propertyType: new RegExp(`^${escapeRegex(criteria.propertyType)}$`, 'i') },
        { type: new RegExp(`^${escapeRegex(criteria.propertyType)}$`, 'i') },
      ],
    });
  }
  if (criteria.category) {
    filter.$and ||= [];
    filter.$and.push({ category: new RegExp(`^${escapeRegex(criteria.category)}$`, 'i') });
  }
  if (criteria.minRating !== undefined) {
    filter.$and ||= [];
    filter.$and.push({ rating: { $gte: criteria.minRating }, ratingCount: { $gt: 0 } });
  }
  if (criteria.amenities.length) {
    filter.$and ||= [];
    criteria.amenities.forEach((amenity) => {
      filter.$and.push({
        $or: [
          { normalizedAmenities: amenity },
          {
            amenities: {
              $elemMatch: {
                $regex: `^\\s*${escapeRegex(amenity)}\\s*$`,
                $options: 'i',
              },
            },
          },
        ],
      });
    });
  }

  if (criteria.destination) {
    filter.$and ||= [];
    filter.$and.push({
      $or: [
        { normalizedCity: { $in: cityTerms } },
        ...(stateTerm ? [{ normalizedState: stateTerm }] : []),
        { city: exactCityRegex },
        { state: stateTerm ? new RegExp(`^${escapeRegex(stateTerm)}$`, 'i') : legacyRegex },
        { location: locationRegex },
        ...(countryQuery ? [{ country: new RegExp(`^${escapeRegex(countryQuery)}$`, 'i') }] : []),
      ],
    });
  }

  const pipeline = [
    { $match: filter },
    ...(criteria.sortBy === 'popularity' ? [{
      $lookup: {
        from: Booking.collection.name,
        let: { propertyId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$propertyId', '$$propertyId'] },
              bookingStatus: { $in: ['CONFIRMED', 'CHECKED_IN', 'COMPLETED'] },
            },
          },
          { $count: 'bookingCount' },
        ],
        as: 'bookingStats',
      },
    }, {
      $addFields: {
        bookingCount: { $ifNull: [{ $arrayElemAt: ['$bookingStats.bookingCount', 0] }, 0] },
      },
    }] : []),
    ...(criteria.checkIn && criteria.checkOut ? [{
      $lookup: {
        from: Booking.collection.name,
        let: { propertyId: '$_id', propertyName: '$name' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $or: [
                      { $eq: ['$propertyId', '$$propertyId'] },
                      { $eq: ['$property', '$$propertyName'] },
                    ],
                  },
                  ...(criteria.checkIn && criteria.checkOut ? [
                    { $lt: ['$checkInDate', criteria.checkOut] },
                    { $gt: ['$checkOutDate', criteria.checkIn] },
                  ] : []),
                  { $in: ['$bookingStatus', ['PENDING', 'CONFIRMED', 'CHECKED_IN']] },
                ],
              },
            },
          },
          { $group: { _id: null, roomsBooked: { $sum: '$numberOfRooms' } } },
        ],
        as: 'stayUsage',
      },
    }, {
      $addFields: {
        roomsBooked: { $ifNull: [{ $arrayElemAt: ['$stayUsage.roomsBooked', 0] }, 0] },
        remainingRooms: {
          $max: [
            0,
            {
              $subtract: [
                {
                  $min: [
                    { $ifNull: ['$totalRooms', '$availableRooms'] },
                    { $ifNull: ['$availableRooms', '$totalRooms'] },
                  ],
                },
                { $ifNull: [{ $arrayElemAt: ['$stayUsage.roomsBooked', 0] }, 0] },
              ],
            },
          ],
        },
        guestsPerRoom: { $ifNull: ['$maxGuestsPerRoom', 4] },
      },
    }] : []),
    {
      $match: criteria.checkIn && criteria.checkOut
        ? { remainingRooms: { $gte: criteria.rooms }, $expr: { $gte: [{ $multiply: ['$guestsPerRoom', criteria.rooms] }, criteria.guests] } }
        : { availableRooms: { $gte: criteria.rooms }, $expr: { $gte: [{ $multiply: ['$guestsPerRoom', criteria.rooms] }, criteria.guests] } },
    },
    {
      $sort: criteria.sortBy === 'price_desc'
        ? { price: -1, name: 1 }
        : criteria.sortBy === 'rating'
          ? { rating: -1, ratingCount: -1, price: 1, name: 1 }
          : criteria.sortBy === 'popularity'
            ? { bookingCount: -1, ratingCount: -1, price: 1, name: 1 }
            : criteria.sortBy === 'newest'
              ? { createdAt: -1, _id: -1 }
            : { price: 1, name: 1 },
    },
    {
      $facet: {
        results: [
          { $skip: (criteria.page - 1) * criteria.limit },
          { $limit: criteria.limit },
        ],
        count: [{ $count: 'total' }],
      },
    },
  ];
  return pipeline;
};

const searchHotels = async (criteria) => {
  const [result = { results: [], count: [] }] = await Property.aggregate(await buildHotelPipeline(criteria));
  const properties = result.results.map((property) => {
    const availableRoomsForStay = criteria.checkIn && criteria.checkOut
      ? property.remainingRooms
      : property.availableRooms;
    for (const field of ['bookingStats', 'stayUsage', 'roomsBooked', 'guestsPerRoom']) {
      delete property[field];
    }
    return { ...property, availableRoomsForStay };
  });
  const total = result.count[0]?.total || 0;
  return {
    properties,
    pagination: {
      page: criteria.page,
      limit: criteria.limit,
      total,
      pages: Math.ceil(total / criteria.limit),
    },
    alternatives: total ? [] : [
      'Increase the nightly budget or remove the budget limit.',
      'Remove one or more amenity, property-type, or rating filters.',
      'Try a nearby destination or search by the state name.',
    ],
  };
};

module.exports = { parseHotelSearch, searchHotels, buildHotelPipeline, normalize };
