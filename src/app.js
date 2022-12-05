const express = require('express');
const bodyParser = require('body-parser');
const {sequelize} = require('./model');
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);
require('./routes/contracts.routes')(app);
require('./routes/jobs.routes')(app);
require('./routes/balances.routes')(app);
require('./routes/admin.routes')(app);
/**
//  * FIX ME
//  * @returns contract by id
//  */
// app.get('/contracts/:id',getProfile ,async (req, res) =>{
//     const {Contract} = req.app.get('models');
//     const {id} = req.params;
//     const contract = await Contract.findOne({where: {id}});
//     if(!contract) {
//         return res.status(404).send({
//             message: 'The contractor id provided does not exists'
//         });
//     }
//     res.json(contract);
// })
module.exports = app;
