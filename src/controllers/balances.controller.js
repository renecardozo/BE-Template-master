const Sequelize = require('sequelize');
const { status, type } = require('../constants');
const { Op } = Sequelize;

class Balances {
    static async setBalance(req, res){
        try {
            const { Contract, Job } = req.app.get('models');
            const sequelize  = req.app.get('sequelize');
            const { userId } = req.params;
            const { amount } = req.body;
            const { profile } = req;
            const contracts = await Contract.findAll({
                where: {
                    [Op.and]: [{ status: status.IN_PROGRESS }, { ClientId: userId }]
                }
            });
            const contractIdList = contracts.map(contract => contract.id);
            const jobs = await Job.findAll({
                attributes: [
                    [sequelize.fn('sum', sequelize.col('price')), 'totalPrice']
                ],
                where: {
                    ContractId: {
                        [Op.in]: contractIdList
                    }
                }
            });
            const { totalPrice } = jobs[0].dataValues;
            const limitToDeposit = totalPrice * 0.25;
            if (amount > limitToDeposit ) {
                return res.status(401).send({
                    message: 'You can not deposit more than 25% his total of jobs to pay'
                });
            };
            if (profile.type !== type.CLIENT) {
                return res.status(401).send({
                    message: 'Only clients can process a deposit'
                });
            }
            profile.balance = profile.balance + amount;
            profile.save();
            return res.status(200).send({
                message: 'Deposit processed successfully'
            });
        } catch (error) {
            return res.status(500).send({
                message: error.message
            });
        }
    }
}
module.exports = { Balances }
