var restify = require("restify");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const Redis = require("ioredis");
const { faker } = require("@faker-js/faker");

const { v4: uuidv4 } = require("uuid");
const { Client } = require("@elastic/elasticsearch");

const mongodbConnection = require("./mongodbConnction.js");
const connection = require("./mysqlconnection.js");
const {
  getFunctionelastic,
  createFunctionelastic,
  updateFunctionelastic,
  deleteFunctionelastic,
} = require("./components/elastic.js");

const redis = new Redis(6379, process.env.REDISHOST);
const client = new Client({ node: process.env.ELASTIC_URI });
const server = restify.createServer({});

dotenv.config();
server.use(bodyParser.json());

server.get("/mysql/get", async function (req, res) {
  const result = await connection.query("SELECT * FROM users LIMIT 10");
  res.send(result);
});

server.post("/mysql/create", async (req, res) => {
  const { username, email, password } = req.body;
  const result = await connection.query(
    "INSERT INTO users (username, email, password)  VALUES (?,?,?)",
    [username, email, password]
  );
  res.send(result);
});

server.put("/mysql/update/:id", async (req, res) => {
  const id = req.params.id;
  const result = await connection.query("UPDATE users SET ? WHERE id = ?", [
    req.body,
    id,
  ]);
  res.send(result);
});

server.del("/mysql/delete/:id", async (req, res) => {
  const id = req.params.id;
  const result = await connection.query("DELETE FROM users WHERE id = ?", [id]);
  res.send(result);
});

server.get("/mongodb/get", async (req, res) => {
  const collection = await mongodbConnection();
  const result = await collection.find().toArray();
  res.send(result);
});

server.post("/mongodb/create", async (req, res) => {
  const { username, email, password } = req.body;
  const collection = await mongodbConnection();
  const id = uuidv4();
  const result = await collection.insertOne({
    id,
    username,
    email,
    password,
  });
  res.send(result);
});

server.put("/mongodb/update/:id", async (req, res) => {
  const collection = await mongodbConnection();
  const id = req.params.id;
  const result = await collection.updateOne({ id: id }, { $set: req.body });
  res.send(result);
});

server.del("/mongodb/delete/:id", async (req, res) => {
  const id = req.params.id;
  const collection = await mongodbConnection();
  const result = await collection.deleteOne({ id: id });
  res.send(result);
});

server.get("/redis/get", async (req, res) => {
  const result = await redis.hgetall(req.body.username);
  console.log(result);
  res.send(result);
});

server.post("/redis/create", async (req, res) => {
  const result = await redis.hset(req.body.username, req.body);
  console.log(result);
  res.send(result);
});

server.put("/redis/update", async (req, res) => {
  const result = await redis.hset(req.body.username, req.body);
  console.log(result);
  res.send(result);
});

server.del("/redis/delete/:name", async (req, res) => {
  console.log(req.params.name);
  const result = await redis.del(req.params.name);
  console.log(result);
  res.send(result);
});

server.get("/elasticsearch/get", async (req, res) => {
  const { body } = await client.search({ index: "doyaroya" });
  res.send(body);
});

server.post("/elasticsearch/create", async (req, res) => {
  // const index = req.body.username;
});

async function newFunc() {
  function createRandomUser() {
    return {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      registeredAt: Date.now(),
    };
  }
  setInterval(async () => {
    let newuser = createRandomUser();
    const result = await client.index({
      index: "doyaroya",
      body: newuser,
    });
    const resultmysql = await connection.query(
      "INSERT INTO users (username, email, password, registeredAt)  VALUES (?,?,?,?)",
      [newuser.username, newuser.email, newuser.password, newuser.registeredAt]
    );
  }, 3000);
}

newFunc();

server.put("/elasticsearch/update/:id", async (req, res) => {
  const id = req.params.id;
  const { index, data } = req.body;
  const result = await client.update({
    index: index,
    id: id,
    doc: data,
  });
  res.json(result);
});

server.del("/elasticsearch/delete/", async (req, res) => {
  const { index, id } = req.body;
  const result = await client.delete({
    index: index,
    id: id,
  });
  res.send(result);
});

// createRandomUser();

// users.forEach(element =>{
// setInterval(() => {
// console.log(users);
// }, 100);
// })

const port = process.env.PORT;
server.listen(port, function () {
  console.log("%s listening at %s", server.name, server.url);
});
