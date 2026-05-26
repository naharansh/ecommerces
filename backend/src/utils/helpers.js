const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SW-${timestamp}-${random}`;
};

const paginate = ({ page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset: parseInt(offset), page: parseInt(page) };
};

const formatPaginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  },
});

const requireId = (value, name = 'id') => {
  if (value === undefined || value === null || value === '') {
    const error = new Error(`Invalid ${name}: must be a valid identifier.`);
    error.statusCode = 400;
    throw error;
  }
  return value;
};

module.exports = { generateSlug, generateOrderNumber, paginate, formatPaginatedResponse, requireId };
