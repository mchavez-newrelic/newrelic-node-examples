const express = require("express");
const app = express();
const port = 3000;

const elasticClient = require("./elastic-client");
const bodyParser = require("body-parser");

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

const documentExists = async (indexName, postId) => {
  const result = await elasticClient.exists({
    id: postId,
    index: indexName,
  });

  return result;
};

const searchDocument = async (title) => {
  const result = await elasticClient.search({
    index: "posts",
    query: { fuzzy: { title } },
  });

  return result;
};

const createDocument = async (title) => {
  await elasticClient.index({
    index: "posts",
    id: title,
    document: {
      title,
    },
  });
};

const deleteDocument = async (title) => {
  await elasticClient.delete({
    id: title,
    index: "posts",
  });
}

app.get("/search", async (req, res) => {
  const result = await searchDocument(req.body.document);

  const hits = result.hits.hits;
  const results = hits.map((document) => document._source.title);

  res.status(200).json({ results });
});

app.post("/create-document", async (req, res) => {
  const documentTitle = req.body.document;
  const duplicateDocument = await documentExists("posts", documentTitle);

  if (duplicateDocument) {
    res
      .status(409)
      .json({ message: `Document ${documentTitle} already exists` });
    return;
  }

  await createDocument(documentTitle);

  res.status(201).json({ message: `Document ${documentTitle} created` });
});

app.post("/delete-document", async (req, res) => {
  const documentTitle = req.body.document;
  const documentInIndex = await documentExists("posts", documentTitle);

  if (!documentInIndex) {
    res
      .status(404)
      .json({ message: `Document ${documentTitle} does not exist` });
    return;
  }

  await deleteDocument(documentTitle);

  res.status(200).json({ message: `Document ${documentTitle} deleted` });
});

app.listen(port, () => {
  if (!indexExists("posts")) {
    createIndex("posts");
  }
  console.log(`Example app listening on port ${port}`);
});
