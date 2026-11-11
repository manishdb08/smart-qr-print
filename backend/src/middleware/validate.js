const { ValidationError } = require('../utils/errors');

const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers
    });

    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  } catch (err) {
    if (err.errors) {
      const formatted = err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message
      }));
      return next(new ValidationError('Request validation failed', formatted));
    }
    next(err);
  }
};

module.exports = validate;
