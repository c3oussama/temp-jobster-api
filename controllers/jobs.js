const Job = require("../models/Job");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError } = require("../errors");
const mongoose = require("mongoose");
const moment = require("moment");

const getAllJobs = async (req, res) => {
  const { status, jobType, sort, search } = req.query;
  const queryObject = { createdBy: req.user.userId };
  if (search) {
    queryObject.position = { $regex: search, $options: "i" };
  }
  if (status && status != "all") {
    queryObject.status = status;
  }
  if (jobType && jobType != "all") {
    queryObject.jobType = jobType;
  }
  let results = Job.find(queryObject);
  switch (sort) {
    case "latest":
      results = Job.find(queryObject).sort("-createdAt");
      break;
    case "oldest":
      results = Job.find(queryObject).sort("createdAt");
      break;
    case "a-z":
      results = Job.find(queryObject).sort("position");
      break;
    case "z-a":
      results = Job.find(queryObject).sort("-position");
      break;
    default:
      results = Job.find(queryObject).sort("-createdAt");
      break;
  }
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  results = results.skip(skip).limit(limit);
  const jobs = await results;
  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / 10);
  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};

const getOneJob = async (req, res) => {
  const job = await Job.findOne({
    _id: req.params.jobId,
    createdBy: req.user.userId,
  });
  if (!job) {
    throw new NotFoundError("this job doesn't existe");
  }
  res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { jobId },
  } = req;
  if (company === "" || position === "") {
    throw new BadRequestError("please provide company and position");
  }

  const job = await Job.findOneAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!job) {
    throw new NotFoundError("This job doesn't exist.");
  }
  res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { jobId },
  } = req;
  const job = await Job.findOneAndDelete({
    _id: jobId,
    createdBy: userId,
  });
  if (!job) {
    throw new NotFoundError("this job doesn't existe");
  }
  res.status(StatusCodes.OK).json({ msg: "Job has been deleted" });
};

const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count; // Ajoute une clé avec le statut et son count
    return acc; // Retourne l'accumulateur mis à jour
  }, {}); // L'accumulateur commence avec un objet vide

  const defaultStats = {
    interview: stats.interview || 0,
    declined: stats.declined || 0,
    pending: stats.pending || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);
  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MMM Y");
      return { date, count };
    })
    .reverse();
  console.log(monthlyApplications);

  res
    .status(StatusCodes.OK)
    .json({ defaultStats: defaultStats, monthlyApplications });
};
module.exports = {
  getAllJobs,
  getOneJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
};
