// seed-db.js

const { AppDataSource } = require("./data-source");
const { User } = require("./entity/User");

const users = [
  { name: "Amy", email: "amy@t.ca", password: "1234Pwd" },
  { name: "Bob", email: "bob@t.ca", password: "1234Pwd" },
  { name: "Cole", email: "cole@t.ca", password: "1234Pwd" },
];

module.exports.seedDB = async () => {
  //wipe db to reset
  await AppDataSource.synchronize(true);
  
  const repository = AppDataSource.getRepository(User);
  const userResult = await repository.save(users);
  console.log("Seeded Users:", userResult)
}