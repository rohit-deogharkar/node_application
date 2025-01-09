const { MongoClient } = require("mongodb");

const url = "mongodb://localhost:27017/";
const client = new MongoClient(url);

const mongodbConnection = async () => {
  try {
    await client.connect();
    const database = client.db("node_application");
    const collection = database.collection("na_collection");
    // console.log("Connected to MongoDB");
    return collection;
  } catch (error) {
    console.log("Error connecting to MongoDB", error);
  }
};

module.exports = mongodbConnection;
