const Sequelize = require('sequelize');
const { status, type } = require('../constants');
const { Op } = Sequelize;

class Jobs {
    static async getUnpaid(req, res) {
        try {
            const { Contract, Job } = req.app.get('models');
            const data = await Contract.findAll({
                include: [{
                    model: Job,
                    where: {
                        paid: {
                            [Op.is]: [status.UNPAID]
                        }
                    }
                }],
                where: {
                    status: {
                        [Op.notIn]: [status.TERMINATED]
                    },
                }
            });
            if (!data) {
                return res.status(404).send({
                    message: 'Resource not found'
                });
            }
            return res.status(200).send(data);
        } catch (error) {
            res.status(500).send({
                message: error.message
            });
        }
    }
    static async payJob(req, res) {
        try {
            const { Contract, Job, Profile } = req.app.get('models');
            const { job_id } = req.params;
            const { profile } = req;
            if (profile.type !== type.CLIENT) {
                return res.status(401).send({
                    message: 'Only clients can process a paid'
                });
            }
            const job = await Job.findOne({
                where: {
                    id: job_id
                }
            });
            if (profile.balance >= job.price) {
                profile.balance = profile.balance - job.price;
                profile.save();
                const contract = await Contract.findOne({
                    where: {
                        id: job.ContractId
                    }
                })
                const { ContractorId } = contract;
                const profileContractor = await Profile.findOne({
                    where: {
                        id: ContractorId
                    }
                });
                job.paid = true;
                job.paymentDate = new Date();
                job.save();
                profileContractor.balance = profileContractor.balance + job.price;
                profileContractor.save();
                return res.status(200).send({
                    message: 'Paid process successfully, please review thier balance'
                });
            }
        } catch (error) {
            res.status(500).send({
                message: error.message
            });
        }
    }
}
module.exports = { Jobs }
