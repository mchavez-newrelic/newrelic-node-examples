const express = require("express");
const app = express();
const port = 3000;

const elasticClient = require("./elastic-client");
const bodyParser = require("body-parser")

app.use(bodyParser.urlencoded({ extended: true }));

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

app.get("/search", async (req, res) => {
  const result = await elasticClient.search({
    index: "posts",
    query: { fuzzy: { title: req.body.document } },
  });

  const hits = result.hits.hits;
  const results = hits.map((document) => document._source.title);

  res.status(200).json({ results });
});

app.post("/create-document", async (req, res) => {
  const documentTitle = req.body.document;
  const duplicateDocument = await postExists("posts", documentTitle);

  if (duplicateDocument) {
    res.status(409).json({ message: `Document ${documentTitle} already exists` });
    return;
  }

  await elasticClient.index({
    index: "posts",
    id: documentTitle,
    document: {
      title: documentTitle,
    },
  });

  res.status(201).json({ message: `Document ${documentTitle} created` });
});

app.post("/delete-document", async (req, res) => {
  const documentTitle = req.body.document;
  const documentExists = await postExists("posts", documentTitle);

  if (!documentExists) {
    res.status(404).json({ message: `Document ${documentTitle} does not exist` });
    return;
  }

  await elasticClient.delete({
    id: documentTitle,
    index: "posts",
  });

  res.status(200).json({ message: `Document ${documentTitle} deleted` });
});

app.listen(port, () => {
  if (!indexExists("posts")) {
    createIndex("posts");
  }
  console.log(`Example app listening on port ${port}`);
});
