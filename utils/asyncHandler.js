function asyncHandler(fn) {
    return async function (req, res, next) {
      try {
        await fn(req, res, next);
      } catch (e) {
        res.send(e.message);
      }
    };
  }
  module.exports=asyncHandler