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
    value: { type: Sequelize.FLOAT },
    unit: { type: Sequelize.STRING },
    statusLevel: { type: Sequelize.INTEGER}
});

const Optimum = sequelize.define('optimum', {
    type: { type: Sequelize.STRING },
    lowerThreshold: { type: Sequelize.FLOAT },
    higherThreshold: { type: Sequelize.FLOAT },
    plantId: { type: Sequelize.INTEGER}
});

Garden.hasMany(Plant);
Plant.hasMany(Sample);

// force: true will drop the table if it already exists
sequelize.sync({force: true}).then(() => {
    Optimum.findOrCreate({
        where: {
            type: "temp",
            plantId: 1
        },
        defaults: {
            type: "temp",
            lowerThreshold: 18.0,
            higherThreshold: 27.0,
            plantId: "1"
        }
    });

    Optimum.findOrCreate({
        where: {
            type: "humidity",
            plantId: 1
        },
        defaults: {
            type: "humidity",
            lowerThreshold: 40.0,
            higherThreshold: 100.0,
            plantId: "1"
        }
    });
    Optimum.findOrCreate({
        where: {
            type: "groundmoisture",
            plantId: 1
        },
        defaults: {
            type: "groundmoisture",
            lowerThreshold: 900.0,
            higherThreshold: 1200.0,
            plantId: "1"
        }
    });

    Optimum.findOrCreate({
        where: {
            type: "light",
            plantId: 1
        },
        defaults: {
            type: "light",
            lowerThreshold: 60000.0,
            higherThreshold: 67000.0,
            plantId: "1"
        }
    });

});




app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/api/samples/list', (req, res) => {
    Sample.findAll({
    }).then((result) => {
        res.json(result);
    });
});

app.get('/api/:plantId/samples', (req, res) => {
    const plantId = req.params.plantId;

    Sample.findAll({
        where: {plantId: plantId}
    }).then((result) => {
        res.json(result);
    });
});

app.get('/api/:plantId/graphData', (req, res) => {
    const plantId = req.params.plantId;
    const type = req.query.type;

    Sample.findAll({
        attributes: ['value', 'updatedAt', 'unit'],
        where: {
            plantId: plantId,
            type: type
        },
        limit: 15,
        order: [['updatedAt', 'DESC']]
    }).then((result) => {
        res.json(result.reverse());
    });
});

app.get('/api/:plantId/status', (req, res) => {
    const plantId = req.params.plantId;
    const type = req.query.type;
    const results = []

    Sample.findAll({
        attributes: ['type'],
        group: ['type']
    }).then((result) => {
        const promises = []
        result.forEach (function (r) {
            promises.push(Sample.findAll({
                attributes: ['type', 'statusLevel'],
                where: {
                    type: r.type
                },
                limit: 1,
                order: [['updatedAt', 'DESC']]
            }))
        });
        Promise.all(promises).then((finalResults) => {
                res.json(finalResults);
        });



        // res.json(result.reverse());
    });
});

app.get('/api/plants/list', (req, res) => {
    Plant.findAll({}).then((result) => {
        res.json(result);
    });
});

app.post('/api/samples', (req, res) => {
    const body = req.body;

    Plant.findOrCreate({ where: {
        id: body.plantId
    }}).spread((plant, created) => {
        Optimum.findOne({
            where: {
                type: body.type,
                plantId: plant.get('id')
            },
        }).then((optimum) => {
            if(body.value > optimum.higherThreshold)
                status = 2
            else if(body.value < optimum.lowerThreshold)
                status = 0
            else
                status = 1
            sample = Sample.create({
                sensorId: body.sensorId,
                plantId: plant.get('id'),
                type: body.type,
                value: body.value,
                unit: body.unit,
                statusLevel: status
            }).then((sample) => {
                res.json(sample);
            });
        });

    }).catch()
});

app.listen(process.env.PORT, () => console.log('Example app listening on port' + process.env.PORT + '!'));