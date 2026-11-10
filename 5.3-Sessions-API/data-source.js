// data-source.js

const { DataSource } = require("typeorm");
const { User } = require("./entity/User");

module.exports.AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "app-data.sqlite",
  synchronize: true,
  entities: [User],
});