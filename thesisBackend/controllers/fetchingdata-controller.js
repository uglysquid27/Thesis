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

const dataFetch = async () => {
    try {
        const historicalData = await LabelTab.findAll({
            attributes: [
                [Sequelize.literal('DATE_FORMAT(FROM_UNIXTIME(UNIX_TIMESTAMP(time) - MOD(UNIX_TIMESTAMP(time), 600)), "%Y-%m-%d %H:%i:00")'), 'interval_time'],
                [fn('AVG', col('Label_Length_AVE')), 'Label_Length_AVE']
            ],
            where: {
                [Op.and]: [
                    { Label_Length_AVE: { [Op.ne]: 0 } },
                    { time: { [Op.not]: null } } 
                ]
            },
            group: [Sequelize.literal('interval_time')],
            order: [[literal('interval_time'), 'DESC']],
            limit: 90
        });

        const historicalValues = historicalData.map(item => ({
            time: formatTime(item.dataValues.interval_time),
            Label_Length_AVE: parseFloat(item.dataValues.Label_Length_AVE)
        }));

        return { historicalValues };
    } catch (error) {
        console.error('Error in Monte Carlo Forecasting:', error);
        throw error;
    }
};

module.exports = {
    index: async (req, res) => {
        try {
            const {historicalValues} = await dataFetch();
            res.status(200).json(historicalValues);
        } catch (error) {
            console.error('Error in index route:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};
