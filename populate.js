require("dotenv").config();
const connectDB = require("./db/connect");
const Job = require("./models/Job");
const mock_data = require("./MOCK_DATA.json");

const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    await Job.create(mock_data);
    console.log("Success");
    process.exit(0);
  } catch (error) {
    console.log(error);
  }
};
start();
