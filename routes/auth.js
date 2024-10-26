const express = require("express");
const router = express.Router();
const authenticatedMiddleware = require("../middleware/authentication");
const testUserMiddleware = require("../middleware/testUser");
const rateLimiter = require("express-rate-limit");

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 1 request per windowMs
  message: {
    msg: "Too many requests from this IP address, please try again after 15 minutes.",
  },
});

const { login, register, updateUser } = require("../controllers/auth");

router.post("/login", apiLimiter, login);
router.post("/register", apiLimiter, register);
router.patch(
  "/updateUser",
  authenticatedMiddleware,
  testUserMiddleware,
  updateUser
);

module.exports = router;
