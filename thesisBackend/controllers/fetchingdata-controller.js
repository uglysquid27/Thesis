const { log } = require('console');
const { LabelTab } = require('../models/label_plan');
const { Op, fn, col, literal } = require('sequelize');
const fs = require('fs');

const formatTime = (timeString) => {
    const date = new Date(timeString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const monteCarloForecast = async () => {
    try {
        const historicalData = await LabelTab.findAll({
            attributes: [
                'time',
                'Label_Length_AVE'
            ],
            where: {
                [Op.and]: [
                    { Label_Length_AVE: { [Op.ne]: 0 } },
                    { time: { [Op.not]: null } } 
                ]
            },
            order: [[literal('DATE(time)'), 'DESC']],
            limit: 90
        });

        const historicalValues = historicalData.map(item => ({
            time: formatTime(item.time),
            Label_Length_AVE: item.Label_Length_AVE
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
            const {historicalValues} = await monteCarloForecast();
            res.status(200).json(historicalValues);
        } catch (error) {
            console.error('Error in index route:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};
