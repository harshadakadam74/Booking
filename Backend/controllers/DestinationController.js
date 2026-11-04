const Destination = require('../models/Destination');
const ApiResponse = require('../Utils/ApiResponse');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const validId = (id) => /^[a-f\d]{24}$/i.test(id);

const searchDestinations = async (req, res) => {
  try {
    const query = typeof req.query.search === 'string'
      ? req.query.search.trim()
      : typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (query.length > 100) {
      return res.status(400).json({ message: 'Destination search cannot exceed 100 characters.' });
    }
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
      return res.status(400).json({ message: 'Limit must be between 1 and 20.' });
    }

    const filter = { active: true };
    if (query) {
      const regex = new RegExp(escapeRegex(query), 'i');
      filter.$or = [
        { name: regex },
        { normalizedName: regex },
        { state: regex },
        { aliases: { $elemMatch: { $regex: escapeRegex(query), $options: 'i' } } },
      ];
    }
    const destinations = await Destination.find(filter)
      .select('name state country type coordinates description image aliases')
      .sort({ name: 1 })
      .limit(limit)
      .lean();
    return res.status(200).json({ destinations });
  } catch (error) {
    console.error('Destination search failed:', error.message);
    return res.status(500).json({ message: 'Unable to search destinations.' });
  }
};

const getAdminDestinations = async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
    const filter = {};
    if (req.query.status === 'active') filter.active = true;
    if (req.query.status === 'inactive') filter.active = false;
    if (req.query.status && !['active', 'inactive'].includes(req.query.status)) {
      return ApiResponse.error(res, 400, 'Status must be active or inactive.');
    }
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { name: regex },
        { state: regex },
        { aliases: { $elemMatch: { $regex: escapeRegex(search), $options: 'i' } } },
      ];
    }
    const [destinations, total] = await Promise.all([
      Destination.find(filter).sort({ state: 1, name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Destination.countDocuments(filter),
    ]);
    return ApiResponse.success(res, {
      destinations,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }, 'Destinations loaded.');
  } catch (error) {
    console.error('Admin destination listing failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to load destinations.');
  }
};

const validateDestination = (body) => {
  const { name, state, country = 'India', type, description = '', image = '', aliases = [], coordinates = {} } = body || {};
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100 ||
    typeof state !== 'string' || state.trim().length < 2 || state.trim().length > 100 ||
    typeof country !== 'string' || country.trim().length < 2 || country.trim().length > 80 ||
    typeof type !== 'string' || type.trim().length < 2 || type.trim().length > 60) {
    return { error: 'Name, state, country, and type must be valid non-empty strings.' };
  }
  if (typeof description !== 'string' || description.length > 1000 ||
    typeof image !== 'string' || image.length > 2048 ||
    !Array.isArray(aliases) || aliases.length > 20 ||
    aliases.some((alias) => typeof alias !== 'string' || !alias.trim() || alias.trim().length > 100)) {
    return { error: 'Description, image, or aliases have invalid values.' };
  }
  if (!coordinates || typeof coordinates !== 'object' || Array.isArray(coordinates)) {
    return { error: 'Coordinates must be an object containing latitude and longitude.' };
  }
  const hasLatitude = coordinates.latitude !== undefined && coordinates.latitude !== '';
  const hasLongitude = coordinates.longitude !== undefined && coordinates.longitude !== '';
  if (hasLatitude !== hasLongitude) {
    return { error: 'Coordinates must include both latitude and longitude.' };
  }
  const hasCoordinates = hasLatitude && hasLongitude;
  const latitude = Number(coordinates.latitude);
  const longitude = Number(coordinates.longitude);
  if (hasCoordinates && (
    !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
    !Number.isFinite(longitude) || longitude < -180 || longitude > 180
  )) {
    return { error: 'Coordinates must contain valid latitude and longitude values.' };
  }
  let imageUrl = '';
  if (image.trim()) {
    try {
      imageUrl = new URL(image).toString();
      if (!['http:', 'https:'].includes(new URL(imageUrl).protocol)) throw new Error('Unsupported protocol');
    } catch {
      return { error: 'Image must be a valid HTTP or HTTPS URL.' };
    }
  }
  const normalizedName = name.normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  return {
    value: {
      name: name.trim(),
      normalizedName,
      state: state.trim(),
      country: country.trim(),
      type: type.trim(),
      description: description.trim(),
      image: imageUrl,
      aliases: [...new Set(aliases.map((alias) => alias.trim()))],
      ...(hasCoordinates ? { coordinates: { latitude, longitude } } : { coordinates: {} }),
    },
  };
};

const createDestination = async (req, res) => {
  const { value, error } = validateDestination(req.body);
  if (error) return ApiResponse.error(res, 400, error);
  try {
    const destination = await Destination.create(value);
    return ApiResponse.success(res, { destination }, 'Destination created successfully.', 201);
  } catch (requestError) {
    if (requestError.code === 11000) return ApiResponse.error(res, 409, 'Destination already exists.');
    console.error('Destination creation failed:', requestError.message);
    return ApiResponse.error(res, 500, 'Unable to create destination.');
  }
};

const updateDestination = async (req, res) => {
  if (!validId(req.params.id)) return ApiResponse.error(res, 400, 'Invalid destination ID.');
  const { value, error } = validateDestination(req.body);
  if (error) return ApiResponse.error(res, 400, error);
  try {
    const destination = await Destination.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });
    if (!destination) return ApiResponse.error(res, 404, 'Destination not found.');
    return ApiResponse.success(res, { destination }, 'Destination updated successfully.');
  } catch (requestError) {
    if (requestError.code === 11000) return ApiResponse.error(res, 409, 'Destination already exists.');
    console.error('Destination update failed:', requestError.message);
    return ApiResponse.error(res, 500, 'Unable to update destination.');
  }
};

const setDestinationStatus = async (req, res) => {
  if (!validId(req.params.id)) return ApiResponse.error(res, 400, 'Invalid destination ID.');
  if (typeof req.body?.active !== 'boolean') {
    return ApiResponse.error(res, 400, 'Active status must be true or false.');
  }
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      { $set: { active: req.body.active } },
      { new: true, runValidators: true }
    );
    if (!destination) return ApiResponse.error(res, 404, 'Destination not found.');
    return ApiResponse.success(res, { destination }, 'Destination status updated.');
  } catch (error) {
    console.error('Destination status update failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to update destination status.');
  }
};

const deleteDestination = async (req, res) => {
  if (!validId(req.params.id)) return ApiResponse.error(res, 400, 'Invalid destination ID.');
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    if (!destination) return ApiResponse.error(res, 404, 'Destination not found.');
    return ApiResponse.success(res, {}, 'Destination deleted successfully.');
  } catch (error) {
    console.error('Destination deletion failed:', error.message);
    return ApiResponse.error(res, 500, 'Unable to delete destination.');
  }
};

module.exports = {
  searchDestinations,
  getAdminDestinations,
  createDestination,
  updateDestination,
  setDestinationStatus,
  deleteDestination,
  validateDestination,
};
