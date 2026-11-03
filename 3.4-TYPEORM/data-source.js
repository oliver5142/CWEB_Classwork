require("reflect-metadata");
const { DataSource } = require("typeorm");
const { Member } = require("./entity/Member");
const { Book } = require("./entity/Book");
const { BorrowRecord } = require("./entity/BorrowRecord");

module.exports.AppDataSource = new DataSource({
    type: "mysql",
    host: "mysql", // devcontainer use "mysql" - the service name in docker-compse.yml
    port: 3306,
    username: "root",
    password: "root",
    database: "library_management",
    synchronize: true,   // auto create tables
    logging: true,
    entities: [Member,Book,BorrowRecord],
});