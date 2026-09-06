const Property = require('../models/Property');

const getProperties = async (req, res) => {
  try {
    const filter = { active: true };
    if (req.query.type) filter.type = req.query.type;

    const properties = await Property.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ message: 'Properties fetched successfully', properties });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getProperties };