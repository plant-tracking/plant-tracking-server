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

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(3000, () => console.log('Example app listening on port 3000!'));