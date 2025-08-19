const mongoose = require("mongoose");
const initData = require("./data.js"); // Assuming you have a data.js file with sample data
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://localhost:27017/wnaderlust";

async function connectDB() {
  await mongoose.connect(MONGO_URL);
}

connectDB()
  .then(() => {
    console.log("Database connection established");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "68850ff89bb8c38f95637400",
  }));
  await Listing.insertMany(initData.data);
  console.log("Database initialized with sample data");
};

initDB();
