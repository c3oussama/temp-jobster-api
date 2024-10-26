const { BadRequestError } = require("../errors");

const testUserMiddleware = async (req, res, next) => {
  if (req.user.testUser) {
    throw new BadRequestError("Test User Can Read Only");
  }
  next();
};
module.exports = testUserMiddleware;
