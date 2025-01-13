const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const url = process.env.MONGO_URI;
const client = new MongoClient(url);
const collection = {};

const mongodbConnection = async () => {
  try {
    await client.connect();
    const database = client.db("node_application");
    collection.users = database.collection("na_collection");
    collection.logger = database.collection("logger_report");
    return collection;
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
  }
};

module.exports = mongodbConnection;
