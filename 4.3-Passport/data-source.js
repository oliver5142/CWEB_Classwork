const { DataSource } = require("typeorm");
const { Booking } = require("./entity/Booking");
const { Cab } = require("./entity/Cab");

module.exports.AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: "cab-bookings.sqlite",
  synchronize: true,
  logging: false,
  entities: [Booking, Cab],
});