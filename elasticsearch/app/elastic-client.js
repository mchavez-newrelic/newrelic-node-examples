const { Client } = require("@elastic/elasticsearch");
require("dotenv");

const elasticClient = new Client({
  node: "http://localhost:9200",
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD,
  },
});

module.exports = elasticClient;
