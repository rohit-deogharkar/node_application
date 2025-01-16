var restify = require("restify");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const Redis = require("ioredis");
const { faker } = require("@faker-js/faker");

const { v4: uuidv4 } = require("uuid");
const { Client } = require("@elastic/elasticsearch");

const mongodbConnection = require("./mongodbConnction.js");
const connection = require("./mysqlconnection.js");
const newFunc = require("./util.js");

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
  const [results, fields] = await connection.query(
    "SELECT * FROM logger_report limit 10"
  );
  res.send(results);
});

server.get("/mysql/get/summarize/:condition", async (req, res) => {
  const condition = req.params.condition;

  if (condition == "hourly") {
    const [results, fields] = await connection.query(`select 
    date(callstart) as date,
    time(callstart) as hour, 
    count(callid) as total_calls,
    sum(duration) as total_duration,
    sum(call_time) as total_call_time, 
    sum(hold) as total_hold_time, 
    sum(mute) as total_mute_time, 
    sum(transfer_time) as total_transfer_time, 
    sum(conference) as total_conference_time,
    sum(ringing) as total_ringing_time 
    from logger_report 
    group by 
    hour(callstart);
    `);
    res.send(results);
  }
  if (condition == "agentwise") {
    const [results, fields] = await connection.query(`select
      date(callstart) as date,
      agentname,
      count(callid) as total_calls,
      sum(duration) as total_duration,
      sum(call_time) as total_call_time, 
      sum(hold) as total_hold_time, 
      sum(mute) as total_mute_time, 
      sum(transfer_time) as total_transfer_time, 
      sum(conference) as total_conference_time,
      sum(ringing) as total_ringing_time 
      from logger_report 
      group by 
      agentname
      order by
      agentname;
      `);
    res.send(results);
  }
});

server.get("/mysql/get/filter", async (req, res) => {
  // const { fieldname, valuename } = req.body;
  let staticvar = [
    {
      field: "agentname",
      value: "rohit",
    },
    // {
    //   field: "campaign_name",
    //   value: "securities",
    // },
    // {
    //   field: "process_name",
    //   value: "collections",
    // },
  ];
  let condition = "";
  staticvar.map((e) => {
    condition += `${e.field}="${e.value}" AND `;
  });

  let newArray = condition.split(" ");

  newArray.pop();
  newArray.pop();

  let newCondition = newArray.join(" ");
  
  let query = `SELECT * FROM logger_report WHERE ${newCondition}`;
  const [results, field] = await connection.query(query);
  res.send(results);
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

server.get("/mongodb/get/summarize", async (req, res) => {
  const collection = await mongodbConnection();
  const result = await collection.logger
    .aggregate([
      {
        $group: {
          _id: { hour: { $hour: "$callstart" } },
          total_calls: { $sum: 1 },
          total_ringing_time: { $sum: "$ringing" },
          total_duration: { $sum: "$duration" },
          total_call_time: { $sum: "$call" },
          total_hold_time: { $sum: "$hold" },
          total_mute_time: { $sum: "$mute" },
          total_transfer_time: { $sum: "$transfer" },
          total_conference_time: { $sum: "$conference" },
        },
      },
      { $sort: { "_id.hour": 1 } },
    ])
    .toArray();
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
  const result = await client.search({ index: "rohit_logger_report" });
  let response = [];
  result.body.hits.hits.map((element) => {
    response.push(element._source);
  });
  res.send(response);
});

server.get("/elasticsearch/get/summarize", async (req, res) => {
  try {
    const result = await client.search({
      index: "rohit_logger_report",
      body: {
        size: 0,
        aggs: {
          hour: {
            date_histogram: {
              field: "callstart",
              calendar_interval: "hour",
            },
            aggs: {
              total_duration: {
                sum: {
                  field: "duration",
                },
              },
              total_call_time: {
                sum: {
                  field: "call",
                },
              },
              total_hold_time: {
                sum: {
                  field: "hold",
                },
              },
              total_mute_time: {
                sum: {
                  field: "mute",
                },
              },
              total_transfer_time: {
                sum: {
                  field: "transfer",
                },
              },
              total_conference_time: {
                sum: {
                  field: "conference",
                },
              },
              total_ringing_time: {
                sum: {
                  field: "ringing",
                },
              },
            },
          },
        },
      },
    });

    // res.send(body);
    // console.log(result);
    // res.send(result.body.aggregations.hour.buckets);
    let newArray = result.body.aggregations.hour.buckets;
    let response = {};
    result.body.aggregations.hour.buckets.map((element) => {
      res.send(element);
      response[element] = 1;
    });
    let newKeys = Object.keys(newArray[1]);
    for (i = 0; i < newKeys.length; i++) {
      response[newKeys[i]] = 1;
    }
    res.send(response);
  } catch (err) {
    console.log(err);
  }
});

server.post("/elasticsearch/create", async (req, res) => {
  // const index = req.body.username;
});

async function insertFunction(newCall) {
  const resultelastic = client.index({
    index: "rohit_logger_report",
    body: newCall,
  });

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
  const collection = await mongodbConnection();
  const resultmongodb = await collection.logger.insertOne(newCall);
}

// setInterval(async () => {
//   const newCall = await newFunc();
//   insertFunction(newCall);
// }, 6000);

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

server.get("/mysql/sumarrize", async (req, res) => {
  const result = await connection.query("");
});

const port = process.env.PORT;
server.listen(port, function () {
  console.log("%s listening at %s", server.name, server.url);
});
