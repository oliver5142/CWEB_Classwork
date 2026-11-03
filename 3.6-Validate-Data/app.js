const express = require('express');
const { AppDataSource } = require('./data-source');
const userRoutes = require('./user-routes');

const app = express();
const PORT = 5000;

app.use(express.json()); // for JSON requests
app.use(express.urlencoded({ extended: true })); // for form submissions

// Initialize TypeORM
AppDataSource.initialize()
.then(() => {
    console.log('Data Source has been initialized!');

    // Routes
    app.use('/users', userRoutes);

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})
.catch((err) => console.error('Error during Data Source initialization', err));