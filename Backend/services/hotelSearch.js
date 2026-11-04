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
  const destination = typeof query.destination === 'string' ? query.destination.trim() : '';
  if ((destination && destination.length < 2) || destination.length > 100) {
    return { error: 'Destination must contain between 2 and 100 characters when supplied.' };
  }

  const guests = query.guests === undefined ? 1 : Number(query.guests);
  const rooms = query.rooms === undefined ? 1 : Number(query.rooms);
  if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
    return { error: 'Guests must be a whole number between 1 and 20.' };
  }
  if (!Number.isInteger(rooms) || rooms < 1 || rooms > 10 || rooms > guests) {
    return { error: 'Rooms must be a whole number between 1 and 10, and cannot exceed guests.' };
  }

  let budget;
  if (query.budget !== undefined && query.budget !== '') {
    budget = Number(query.budget);
    if (!Number.isFinite(budget) || budget <= 0 || budget > 100000000) {
      return { error: 'Budget must be a positive maximum nightly amount.' };
    }
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
  const propertyType = typeof (query.propertyType ?? query.type) === 'string'
    ? String(query.propertyType ?? query.type).trim()
    : '';
  if (propertyType.length > 60) return { error: 'Property type cannot exceed 60 characters.' };
  const currency = typeof query.currency === 'string' ? query.currency.trim().toUpperCase() : '';
  if (currency && !/^[A-Z]{3}$/.test(currency)) {
    return { error: 'Currency must be a three-letter currency code.' };
  }

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
      guests,
      rooms,
      budget,
      minRating,
      amenities: [...new Set(amenities)],
      propertyType,
      currency,
      checkIn,
      checkOut,
      page,
      limit,
      includeDemo: query.includeDemo !== 'false' && query.includeDemo !== false,
    },
  };
};

const buildHotelPipeline = async (criteria) => {
  const normalizedDestination = normalize(criteria.destination);
  const destination = criteria.destination ? await Destination.findOne({
    active: true,
    $or: [
      { normalizedName: normalizedDestination },
      { aliases: { $elemMatch: { $regex: `^${escapeRegex(criteria.destination)}$`, $options: 'i' } } },
      { state: new RegExp(`^${escapeRegex(criteria.destination)}$`, 'i') },
    ],
  }).lean() : null;
  const cityTerms = destination
    ? [destination.name, ...(destination.aliases || [])].map(normalize)
    : criteria.destination ? [normalize(criteria.destination)] : [];
  const stateTerm = destination ? normalize(destination.state) : '';
  const legacyRegex = criteria.destination ? new RegExp(escapeRegex(criteria.destination), 'i') : null;
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
  if (criteria.budget !== undefined) filter.price = { $lte: criteria.budget };
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
      ],
    });
  }

  const pipeline = [
    { $match: filter },
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
    { $sort: { price: 1, name: 1 } },
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
  const properties = result.results.map(({ stayUsage, roomsBooked, guestsPerRoom, ...property }) => ({
    ...property,
    availableRoomsForStay: criteria.checkIn && criteria.checkOut
      ? property.remainingRooms
      : property.availableRooms,
  }));
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
