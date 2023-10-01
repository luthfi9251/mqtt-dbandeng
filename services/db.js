const mysql = require("serverless-mysql")({
  config: {
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  },
});

exports.query = async (query, values) => {
  let results = await mysql.query(query, values);
  await mysql.end();
  return results;
};
