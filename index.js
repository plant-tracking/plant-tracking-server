require('dotenv').config()

const express = require('express');
const Sequelize = require('sequelize');

const app = express();

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
    host: 'localhost',
    dialect: 'mysql',

    // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
    operatorsAliases: false
});

app.use(express.json());

sequelize.authenticate();

const Garden = sequelize.define('garden');

const Plant = sequelize.define('plant', {
    nickname: { type: Sequelize.STRING },
    genus: { type: Sequelize.STRING },
    location: { type: Sequelize.STRING },
    picture: { type: Sequelize.STRING }
});

const Sample = sequelize.define('sample', {
    sensorId: { type: Sequelize.INTEGER },
    type: { type: Sequelize.STRING },
    value: { type: Sequelize.INTEGER },
    unit: { type: Sequelize.STRING }
});

Garden.hasMany(Plant);
Plant.hasMany(Sample);

// force: true will drop the table if it already exists
sequelize.sync({force: true}).then(() => {
});

app.get('/', (req, res) => res.send('Hello World!'));

app.post('/api/samples', (req, res) => {
    const body = req.body;

    Plant.findOrCreate({ where: {
        id: body.plantId
    }}).spread((plant, created) => {
        sample = Sample.create({
            sensorId: body.sensorId,
            plantId: plant.get('id'),
            type: body.type,
            value: body.value,
            unit: body.unit
        }).then((sample) => {
            res.json(sample);
        });
    }).catch()
});

app.listen(process.env.PORT, () => console.log('Example app listening on port' + process.env.PORT + '!'));