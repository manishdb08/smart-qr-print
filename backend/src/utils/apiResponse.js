function successResponse(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
}

function errorResponse(res, message = 'An error occurred', statusCode = 500, details = null) {
  return res.status(statusCode).json({
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    message,
    ...(details ? { details } : {})
  });
}

module.exports = {
  successResponse,
  errorResponse
};
