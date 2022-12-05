const Sequelize = require('sequelize');
const { status } = require('../constants');
const { Op } = Sequelize;

class Contracts {
    static async findAll(req, res) {
        try {
            const {Contract} = req.app.get('models');
            const data = await Contract.findAll({
                where: {
                    status: {
                        [Op.notIn]: [status.TERMINATED, status.NEW]
                    }
                }
            })
            if (!data) {
                return res.status(404).send({
                    message: 'Resource not found'
                });
            }
            return res.status(200).send(data);
        } catch (error) {
            return res.status(500).send({
                message: error.message
            });
        }
    }
    
    static async find(req, res) {
        try {
            const {Contract} = req.app.get('models');
            const {id} = req.params;
            const contract = await Contract.findOne({where: {id}});
            if(!contract) {
                return res.status(404).send({
                    message: 'The contractor id provided does not exists'
                });
            }
            res.json(contract);
        } catch (error) {
            return res.status(500).send({
                message: error.message
            });
        }
    }
}
module.exports = { Contracts }
