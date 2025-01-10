var restify = require("restify");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const Redis = require("ioredis");
const { faker } = require("@faker-js/faker");

const { v4: uuidv4 } = require("uuid");
const { Client } = require("@elastic/elasticsearch");

const mongodbConnection = require("./mongodbConnction.js");
const connection = require("./mysqlconnection.js");
// const {
//   getFunctionelastic,
//   createFunctionelastic,
//   updateFunctionelastic,
//   deleteFunctionelastic,
// } = require("./components/elastic.js");

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

var calltype = ["missed", "auto-failed", "auto-drop", "dispose"];
var dispose_type = ["callback", "dnc", "etx"];
var dispose_name = ["followup", "do not call", "external transfer"];
var reasons = [
  "busy everywhere",
  "decline",
  "does not exist anywhere",
  "not acceptable",
];
var agentname = [
  "rohit",
  "sahil",
  "anupam",
  "ajay",
  "pradeep",
  "lakshadweep",
  "ayush",
];
var campaign_name = ["transactions", "securities"];
var process_name = [
  "collections",
  "fund transfers",
  "watchable",
  "allocations",
];

var states = ["hold", "mute", "conference"];

var ringingState = "ringing";
var callState = "call";
var transferState = "transfer";

function checkCallTypeSetDispose(calltype) {
  var disposedata = {};
  // data["states"] = getRandomState(calltype);
  if (calltype === "dispose") {
    disposedata["dispose_name"] = faker.helpers.arrayElement(dispose_name);
    if (disposedata["dispose_name"] === "followup") {
      disposedata["dispose_type"] = "callback";
    } else if (disposedata["dispose_name"] === "do not call") {
      disposedata["dispose_type"] = "dnc";
    }
    if (disposedata["dispose_name"] === "external transfer") {
      disposedata["dispose_type"] = "etx";
    }
  }
  if (calltype === "missed") {
    disposedata["dispose_name"] = "agent not found";
  }
  if (calltype == "auto-failed" || calltype == "auto-drop") {
    disposedata["dispose_name"] = faker.helpers.arrayElement(reasons);
  }
  return disposedata;
}

function getRandomState(calltype) {
  var randomstates = [];
  var disposedata = checkCallTypeSetDispose(calltype);
  if (
    calltype == "missed" ||
    calltype == "auto-failed" ||
    calltype == "auto-drop"
  ) {
    randomstates.push(ringingState, "");
  } else {
    if (disposedata.dispose_type === "etx") {
      randomstates.push(transferState);
    }
    for (i = 1; i <= Math.floor(Math.random() * 2) + 1; i++) {
      randomstates.push(states[Math.floor(Math.random() * states.length)]);
    }
    randomstates.push(callState, ringingState);
  }

  var timedRandomStates = addSecondsToState(randomstates);
  disposedata["states"] = timedRandomStates;
  return disposedata;
}

function addSecondsToState(randomstates) {
  var newTimedStates = {};
  if (!randomstates == "") {
    // randomstates.forEach((element) => {
    //   if (element == "conference") {
    //     newTimedStates[element] = Math.floor(Math.random() * 120) + 1;
    //   }
    //   if (element == "call") {
    //     newTimedStates[element] = Math.floor(Math.random() * 300) + 100;
    //   }
    //   if (element == "") {
    //     newTimedStates[element] = 0;
    //   } else {
    //     newTimedStates[element] = Math.floor(Math.random() * 20) + 1;
    //   }
    // });

    for (i = 0; i < randomstates.length; i++) {
      if (randomstates[i] == "call") {
        newTimedStates[randomstates[i]] = Math.floor(Math.random() * 300) + 100;
      }
      if (randomstates[i] == "conference") {
        newTimedStates[randomstates[i]] = Math.floor(Math.random() * 120) + 1;
      }
      if (randomstates[i] == "") {
        newTimedStates[randomstates[i]] = 0;
      } else {
        newTimedStates[randomstates[i]] = Math.floor(Math.random() * 20) + 1;
      }
    }
  }
  return newTimedStates;
}

function addAllStates(calltype) {
  var disposedata = getRandomState(calltype);
  disposedata["calltype"] = calltype;
  // console.log(data);
  // data.states.forEach((element) => {
  //   totalCallTime += element;
  // });
  // return totalCallTime;
  var onlystates = Object.values(disposedata.states);
  var totalCallTime = 0;
  // onlystates.forEach((element) => {
  //   if(element == 'ringing'){
  //     continue
  //   }
  //
  // });
  var onlykey = Object.keys(disposedata.states);

  for (i = 0; i < onlystates.length; i++) {
    if (onlykey[i] === "ringing") {
      continue;
    }
    totalCallTime += onlystates[i];
  }
  disposedata["totalCallTime"] = totalCallTime;
  console.log(onlystates);
  // console.log(onlystates);
  // console.log(data.states)
  // return disposedata
  // console.log(disposedata);
  return disposedata;
}
// addAllStates("dispose");
// var newd = Math.floor(Math.random() * 300) + 200;
// console.log(newd);
// console.log(data);

async function newFunc() {
  // function createRandomUser() {
  //   return {
  //     username: faker.internet.userName(),
  //     email: faker.internet.email(),
  //     password: faker.internet.password(),
  //     registeredAt: Date.now(),
  //   };
  // }
  // var dispose = dispose_type[Math.floor(Math.random() * dispose_type.length)];
  // console.log(dispose);
  //
  // setInterval(async () => {
  //   let newuser = createRandomUser();
  //   const result = await client.index({
  //     index: "doyaroya",
  //     body: newuser,
  //   });

  var newCall = {};
  // newCall["calltype"] = ;
  var alldata = addAllStates(
    calltype[Math.floor(Math.random() * calltype.length)]
  );
  // console.log(alldata);
  newCall["callstart"] = new Date();
  newCall["calltype"] = alldata.calltype;
  newCall["dispose_type"] = alldata.dispose_type;
  newCall["dispose_name"] = alldata.dispose_name;
  newCall["duration"] = alldata.totalCallTime;
  newCall["agentname"] = faker.helpers.arrayElement(agentname);
  newCall["campaign_name"] = faker.helpers.arrayElement(campaign_name);
  newCall["process_name"] = faker.helpers.arrayElement(process_name);
  newCall["leadset"] = Math.floor(Math.random() * 10) + 1;
  newCall["reference_uuid"] = uuidv4();
  newCall["customer_uuid"] = uuidv4();
  newCall["hold"] = alldata.states.hold;
  newCall["mute"] = alldata.states.mute;
  newCall["ringing"] = alldata.states.ringing;
  newCall["conference"] = alldata.states.conference;
  newCall["transfer"] = alldata.states.transfer;
  newCall["call"] = alldata.states.call;
  newCall["dispose_time"] = alldata.states.call
    ? Math.floor(Math.random() * 10) + 1
    : 0;

  console.log(newCall);
  const resultmysql = await connection.query(
    "INSERT INTO logger_report (callstart,call_type,dispose_name,dispose_type,duration,agentname,campaign_name,process_name,leadset_id,reference_uuid,customer_uuid,hold,mute,ringing,transfer_time,conference,call_time,dispose_time)  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      newCall.callstart,
      newCall.calltype,
      newCall.dispose_name,
      newCall.dispose_type,
      newCall.duration,
      newCall.agentname,
      newCall.campaign_name,
      newCall.process_name,
      newCall.leadset,
      newCall.reference_uuid,
      newCall.customer_uuid,
      newCall.hold,
      newCall.mute,
      newCall.ringing,
      newCall.transfer,
      newCall.conference,
      newCall.call,
      newCall.dispose_time,
    ]
  );
}

setInterval(() => {
  newFunc();
}, 1000);

// function addSeconds(date, seconds) {
//   date.setSeconds(date.getSeconds() + seconds);
//   return date;
// }

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

server.get("/mysql/sumarrize", async (req, res) => {
  const result = await connection.query("");
});

const port = process.env.PORT;
server.listen(port, function () {
  console.log("%s listening at %s", server.name, server.url);
});
