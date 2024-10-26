const express = require("express");
const testUserMiddleware = require("../middleware/testUser");

const router = express.Router();
const {
  getAllJobs,
  getOneJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
} = require("../controllers/jobs");

router.get("/", getAllJobs);
router.post("/", testUserMiddleware, createJob);
router.get("/stats", showStats);
router.get("/:jobId", getOneJob);
router.patch("/:jobId", testUserMiddleware, updateJob);
router.delete("/:jobId", testUserMiddleware, deleteJob);
module.exports = router;
