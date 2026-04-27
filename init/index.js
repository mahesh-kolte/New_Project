 require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.ATLAS_URL;

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to Atlas DB");
}

const initDB = async () => {
  await Listing.deleteMany({});

  const userId = new mongoose.Types.ObjectId("69ede838564c2f1687068862");

  const data = initData.data.map((obj) => ({
    ...obj,
    owner: userId,
  }));

  await Listing.insertMany(data);

  console.log("🔥 Atlas DB initialized with owner!");
};

main().then(initDB);