const { EntitySchema } = require("typeorm");

module.exports.Booking = new EntitySchema({
  name: "Booking",
  tableName: "bookings",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    user: {
      type: "varchar",
    },
    from: {
      type: "varchar",
    },
    to: {
      type: "varchar",
    },
  },
});