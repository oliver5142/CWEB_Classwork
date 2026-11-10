// entity/User.js

const { EntitySchema } = require("typeorm");

module.exports.User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "integer",
      generated: true,
    },
    name: {
      type: "varchar",
      length: 100,
    },
    email: {
      type: "varchar",
      length: 254,
      unique: true,
    },
    password: {
      type: "varchar",
      length: 255,
      select: false,
    },
  },
});