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

const Plant = sequelize.define('plant', {
    nickname: { type: Sequelize.STRING },
    genus: { type: Sequelize.STRING },
    location: { type: Sequelize.STRING },
    picture: { type: Sequelize.STRING }
});

const Sample = sequelize.define('sample', {
    sensorId: { type: Sequelize.INTEGER },
    value: { type: Sequelize.INTEGER },
    unit: { type: Sequelize.STRING }
});

Plant.hasMany(Sample);

// force: true will drop the table if it already exists
sequelize.sync({force: true}).then(() => {
    // Table created
    plant = Plant.create({
        plantId: 0,
        nickname: "Caro",
        genus: "Dracaena fragrans",
        location: "Schlafzimmer",
        picture: "/images/c786defb5cb4463a109bc81e39e18f08.jpg"
    }).then((plant) => {
        sample = Sample.create({
            sensorId: 0,
            value: 24,
            unit: "celsius",
            plantId: plant.get('id')
        });
    });
});

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(3000, () => console.log('Example app listening on port 3000!'));