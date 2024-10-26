const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");

const authenticatedMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError(
      "you are not allowed to access, please provide an email and password"
    );
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const testUser = payload.userId === "671cff2f8dd76436d431d777";
    req.user = { userId: payload.userId, testUser };
    next();
  } catch (error) {
    throw new UnauthenticatedError(
      "you are not allowed to access, please provide an email and password"
    );
  }
};

module.exports = authenticatedMiddleware;
