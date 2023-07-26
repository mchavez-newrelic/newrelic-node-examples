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
};

module.exports = {
  createIndex,
  indexExists,
  documentExists,
  searchDocument,
  createDocument,
  deleteDocument,
};
