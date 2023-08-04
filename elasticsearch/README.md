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

## Custom instrumentation

This example app uses the New Relic [Datastore Instrumentation](https://newrelic.github.io/node-newrelic/tutorial-Datastore-Simple.html). The custom instrumentation for this example app can be found in `/elasticsearch/app/instrumentation.js`

The custom instrumentation follows the example given in the Datastore Instrumentation docs, with a couple modifications detailed below.
1. A query parser is implemented to parse the Elasticsearch query. The example app relies on the full Query DSL (Domain Specific Language) provided by [Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html), which is based on JSON rather than traditional SQL. As such, we implement a `queryParser` function to parse the parameters in the requests to the Express API endpoints to grab the appropriate query based on the type of operation (Create, Search, Delete).
2. Since the Node.js client for Elasticsearch dropped their [callback-style API](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/changelog-client.html#_drop_callback_style_api) since version 8.0, we must use a promise based API. As such, we specify `promise: true` in our returned object for [`shim.recordQuery`](https://newrelic.github.io/node-newrelic/DatastoreShim.html#recordQuery) rather than specifying the argument position of a callback.