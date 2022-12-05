const Sequelize = require('sequelize');
const { Op } = Sequelize;

class Admin {
    static async getBestProfession(req, res) {
        try {
            const { Contract, Job, Profile } = req.app.get('models');
            const { start, end } = req.query;
            const sequelize  = req.app.get('sequelize');
            const startDate = new Date(start);
            const endDate = new Date(end);
            if (startDate.getTime() > endDate.getTime()) {
                return res.send(401).send({
                    message: 'Start date can not be greather than end Date'
                })
            }
            const ContractWithContractorsId = await Contract.findAll({
                include: [{
                    model: Job,
                    where: {
                        paymentDate: {
                            [Op.between]: [startDate, endDate]
                        }
                    }
                }],
                attributes: ['ContractorId']
            });
            const contractorIdList = ContractWithContractorsId.map(contract => contract.ContractorId);
            const mostEarnedProfession = await Profile.findAll({
                attributes: [
                    'firstName',
                    'lastName',
                    'profession',
                    [sequelize.fn('max', sequelize.col('balance')), 'max_balance']
                ],
                where: {
                    id: {
                        [Op.in]: contractorIdList
                    }
                }
            })
            return res.status(200).send(mostEarnedProfession);
        } catch (error) {
            res.status(500).send({
                message: error.message
            });
        }
    }

    static async getBestClients(req, res) {
        try {
            const { Contract, Job, Profile } = req.app.get('models');
            const { start, end } = req.query;
            let limit = req.query.limit;
            const sequelize  = req.app.get('sequelize');
            const startDate = new Date(start);
            const endDate = new Date(end);
            if (startDate.getTime() > endDate.getTime()) {
                return res.send(401).send({
                    message: 'Start date can not be greather than end Date'
                })
            }
            if (limit < 2) {
                limit = 2;
            }
            const ContractWithPrices = await Contract.findAll({
                include: [{
                    model: Job,
                    where: {
                        paymentDate: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    attributes: ['price'],
                }],
                attributes: ['ClientId']
            });
            let contracWithTotalPrice = ContractWithPrices.map(contract => {
                const jobPriceTotal = contract.Jobs.reduce((price, current) => price + current.price, 0);
                contract.jobPriceTotal = jobPriceTotal;
                return contract;
            });
            contracWithTotalPrice = contracWithTotalPrice.sort((a, b) => parseFloat(a.jobPriceTotal) - parseFloat(b.jobPriceTotal));
            const topPaidClient = contracWithTotalPrice.slice(0, limit);
            const clientIdList = topPaidClient.map(contract => contract.ClientId);
            const clientPaidMostForJobs = await Profile.findAll({
                attributes: [
                    'id',
                    [sequelize.literal("firstName || ' ' || lastName"), 'fullName']
                ],
                where: {
                    id: {
                        [Op.in]: clientIdList
                    }
                },
                limit
            });
            const paidMostForJobs = clientPaidMostForJobs.map(profile => {
                const topPaid = topPaidClient.find(top => top.ClientId === profile.id);
                if (topPaid) {
                    profile.dataValues.paid = topPaid.jobPriceTotal
                }
                return profile;
            })
            return res.status(200).send(paidMostForJobs);
        } catch (error) {
            return res.status(500).send({
                message: error.message
            });
        }
    }
}

module.exports = { Admin }