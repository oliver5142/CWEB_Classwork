const { EntitySchema } = require("typeorm");

module.exports.Cab = new EntitySchema({
  name: "Cab",
  tableName: "cabs",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    type: {
      type: "varchar",
    },
    name: {
      type: "varchar",
    },
    customer_name: {
      type: "varchar",
    },
    phone: {
      type: "varchar",
    },
    pricePerKm: {
      type: "int",
    },
    status: {
      type: "int",
    },
    image: {
      type: "varchar",
    },
  },
});