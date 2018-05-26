const express = require('express');
const Sequelize = require('sequelize');

const app = express();

const sequelize = new Sequelize('plant-tracking-data', 'root', 'root', {
    host: 'localhost',
    dialect: 'mysql',

    // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
    operatorsAliases: false
});

sequelize.authenticate();

const PlantSample = sequelize.define('plant_sample', {
    sensorId: { type: Sequelize.INTEGER },
    timestamp: { type: Sequelize.INTEGER },
    value: { type: Sequelize.INTEGER },
    unit: { type: Sequelize.STRING }
});

// force: true will drop the table if it already exists
PlantSample.sync({force: true}).then(() => {
    // Table created
    return PlantSample.create({
        sensorId: 0,
        timestamp: 1527347005,
        value: 24,
        unit: "celsius"
    });
});

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(3000, () => console.log('Example app listening on port 3000!'));