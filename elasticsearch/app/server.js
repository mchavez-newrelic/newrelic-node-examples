const express = require("express");
const app = express();
const port = 3000;

const {
  createIndex,
  indexExists,
  documentExists,
  searchDocument,
  createDocument,
  deleteDocument,
} = require("./elastic-util");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

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

app.listen(port, async () => {
  const hasIndex = await indexExists("posts")
  if (!hasIndex) {
    await createIndex("posts");
  }
  console.log(`Example app listening on port ${port}`);
});
