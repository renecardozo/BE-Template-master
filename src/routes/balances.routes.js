module.exports = app => {
    const { Balances } = require('../controllers/balances.controller');
    const { getProfile } = require('../middleware/getProfile')
    const router = require('express').Router();
    router.post('/deposit/:userId', getProfile, Balances.setBalance);
    app.use('/balances', router);
}
