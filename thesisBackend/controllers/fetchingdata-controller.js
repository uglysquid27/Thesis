const { log } = require('console');
const { LabelTab } = require('../models/label_plan');
const { Op, fn, col, literal, Sequelize } = require('sequelize');
const fs = require('fs');

const formatTime = (timeString) => {
    const date = new Date(timeString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const time = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    return `${day}/${month}/${year} ${time}:${min}:${sec}`;
};

const dataFetch = async (attributeName) => {
    try {
        const historicalData = await LabelTab.findAll({
            attributes: [
                [Sequelize.literal('DATE_FORMAT(FROM_UNIXTIME(UNIX_TIMESTAMP(time) - MOD(UNIX_TIMESTAMP(time), 600)), "%Y-%m-%d %H:%i:00")'), 'interval_time'],
                [Sequelize.fn('AVG', Sequelize.col(attributeName)), attributeName]
            ],
            where: {
                [Op.and]: [
                    { [attributeName]: { [Op.ne]: 0 } },
                    { time: { [Op.not]: null } }
                ]
            },
            group: [Sequelize.literal('interval_time')],
            order: [[Sequelize.literal('interval_time'), 'DESC']],
            limit: 40 // Fetch 40 data points
        });

        const historicalValues = historicalData.map(item => ({
            time: formatTime(item.dataValues.interval_time),
            [attributeName]: parseFloat(item.dataValues[attributeName])
        })).reverse(); // Reverse to get the data in chronological order

        return { historicalValues };
    } catch (error) {
        console.error('Error in dataFetch:', error);
        throw error;
    }
};

const index = async (req, res) => {
    try {
        const { attributeName } = req.body;

        if (!attributeName) {
            return res.status(400).json({ error: 'Attribute name is required' });
        }

        const result = await dataFetch(attributeName);
        res.json(result);
    } catch (error) {
        console.error('Error in index route:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    index
};
