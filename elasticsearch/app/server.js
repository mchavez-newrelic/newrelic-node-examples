const express = require("express");
const app = express();
const port = 3000;

const elasticClient = require("./elastic-client");

const createIndex = async (indexName) => {
  await elasticClient.indices.create({
    index: indexName,
  });
};

const indexExists = async (indexName) => {
  const result = await elasticClient.indices.exists({
    index: indexName,
  });

  return result;
};

const postExists = async (indexName, postId) => {
  const result = await elasticClient.exists({
    id: postId,
    index: indexName,
  });

  return result;
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/es-demo", (req, res) => {
  res
    .status(200)
    .json({ message: "Elasticsearch Skeleton reporting for duty! 💀" });
});

app.post("/create-post", async (req, res) => {
  const duplicatePost = await postExists("posts", "My document");

  if (duplicatePost) {
    res.status(409).json({ message: "Document already exists" });
    return;
  }

  await elasticClient.index({
    index: "posts",
    id: "My document",
    document: {
      title: "My document",
    },
  });

  res.status(201).json({ message: "Document created" });
});

app.listen(port, () => {
  if (!indexExists("posts")) {
    createIndex("posts");
  }
  console.log(`Example app listening on port ${port}`);
});
