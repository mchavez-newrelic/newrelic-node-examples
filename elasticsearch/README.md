# Using New Relic with Elasticsearch

This example shows how to implement a **REST API** using [Express](https://expressjs.com/) and [Elasticsearch](https://www.elastic.co/enterprise-search). It uses the Node.js client for Elasticsearch which you can find more info [here](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html).

## Getting started

**Note**: You must have [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.

 1. Clone or fork this repository.
 2. Copy `sample.env` to `.env` and fill out the following keys:
    ```sh
    NEW_RELIC_LICENSE_KEY=<New Relic License Key>
    ```
 3. Change your `ELASTIC_PASSWORD` in `.env` 
 4. Change directories to the elasticsearch example app `cd elasticsearch` 
 5. Start the elasticsearch container `docker-compose up -d --build elasticsearch`

### 1. Install dependencies

Install npm dependencies:
```
npm install
```

### 2. Start the REST API server

```
npm run start
```

The server is now running on `http://localhost:3000`. You can send the API requests implemented in `index.js`, e.g. `http://localhost:3000/create-document`.

### Additional Configuration

If you want to debug the elasticsearch example app, add the `--inspect-brk` to the `npm run start` command so that it looks as follows:

```
node --inspect-brk -r dotenv/config -r ./app/instrumentation app/server.js
```

## Using the REST API

You can access the REST API of the server using the following endpoints:

### `GET`

- `/search`: Fetches one or more documents
  - Query Parameters:
    - `title`: This specifies which documents should be retrieved through a fuzzy match on the title

### `POST`

- `/create-document`: Create a new document
  - Body:
    - `title: String` (required): The title of the document

### `DELETE`

- `/delete-document`: Delete a document
  - Query Parameters:
    - `title`: This specifies which document should be deleted through an exact match on the title
