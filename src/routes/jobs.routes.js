module.exports = app => {
    const { Jobs } = require('../controllers/jobs.controller');
    const { getProfile } = require('../middleware/getProfile')
    const router = require('express').Router();
    router.get('/unpaid', getProfile, Jobs.getUnpaid);
    router.post('/:job_id/pay', getProfile, Jobs.payJob);
    app.use('/jobs', router);
}
