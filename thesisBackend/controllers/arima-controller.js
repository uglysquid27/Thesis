const { log } = require('console');
const { HistoryTab } = require('../models/mst-history');
const { LabelTab } = require('../models/label_plan');
const { Op, fn, col, literal } = require('sequelize');
const fs = require('fs');
const tslib = require('tslib');

const arimaForecast = async () => {
    try {
        const historicalData = await LabelTab.findAll({
            attributes: [
                [literal('DISTINCT DATE(time)'), 'date'],
                'Label_Length_AVE'
            ],
            where: {
                [Op.or]: [
                    { Label_Length_AVE: { [Op.ne]: 0 } }
                ]
            },
            group: [literal('DATE(time)')],
            order: [[literal('DATE(time)'), 'ASC']],
            limit: 100
        });

        const historicalValues = historicalData.map(item => item.Label_Length_AVE);
        const historicalDates = historicalData.map(item => item.date);

        const model = new tslib.ARIMA({
            data: historicalValues,
            p: 2, 
            d: 1,
            q: 1 
        });

        model.fit();

        const forecastedValues = model.forecast(10); 

        console.log('ARIMA Forecast:', forecastedValues);
        return forecastedValues;
    } catch (error) {
        console.error('Error in ARIMA Forecasting:', error);
        throw error;
    }
};

module.exports = {
    index: async (req, res) => {
        try {
            const forecastData = await arimaForecast();
            res.status(200).json(forecastData);
        } catch (error) {
            console.error('Error in index route:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};
