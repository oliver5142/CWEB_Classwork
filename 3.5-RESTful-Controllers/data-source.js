const { DataSource } = require('typeorm');
const { User } = require('./entity/User');

module.exports.AppDataSource = new DataSource({
    type: 'mysql',
    host: 'mysql',      // in devcontainer use 'mysql' as the host
    port: 3306,
    username: 'root',       // your MySQL username
    password: 'root',           // your MySQL password
    database: 'typeorm_api_controllers',    // make sure this DB exists
    synchronize: true,      // auto-create tables
    logging: false,
    entities: [User],
});