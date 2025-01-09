const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const connection = mysql.createPool({
  host: process.env.HOSTNAME,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

module.exports = connection;
