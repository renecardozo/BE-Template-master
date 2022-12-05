module.exports = app => {
    const { Admin } = require('../controllers/admin.controller');
    const { getProfile } = require('../middleware/getProfile')
    const router = require('express').Router();
    router.get('/best-profession', getProfile, Admin.getBestProfession);
    router.get('/best-clients', getProfile, Admin.getBestClients);
    app.use('/admin', router);
}
