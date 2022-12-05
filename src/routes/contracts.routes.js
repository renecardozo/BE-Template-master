module.exports = app => {
    const { Contracts } = require('../controllers/contracts.controller');
    const { getProfile } = require('../middleware/getProfile')
    const router = require('express').Router();
    router.get('/:id', getProfile, Contracts.find);
    router.get('/', getProfile, Contracts.findAll);
    app.use('/contracts', router);
}
