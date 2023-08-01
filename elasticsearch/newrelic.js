require("dotenv");

exports.config = {
  app_name: "Demo Elasticsearch Application",
  license_key: process.env.LICENSE_KEY,
  api: {
    esm: {
      custom_instrumentation_entrypoint: "/app/instrumentation.js",
    },
  },
  logging: {
    level: "trace"
  }
};
