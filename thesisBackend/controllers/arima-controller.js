const { log } = require('console');
const { HistoryTab } = require('../models/mst-history');
const { LabelTab } = require('../models/label_plan');
const { Op, fn, col, literal } = require('sequelize');
const fs = require('fs');
const tslib = require('tslib');

// Function to calculate ARIMA forecast
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

        // Extract historical data values and dates
        const historicalValues = historicalData.map(item => item.Label_Length_AVE);
        const historicalDates = historicalData.map(item => item.date);

        // Use tslib for ARIMA forecasting
        const model = new tslib.ARIMA({
            data: historicalValues,
            p: 2, // AR order, adjust as needed
            d: 1, // Integrated order, adjust as needed
            q: 1 // MA order, adjust as needed
        });

        // Fit the model
        model.fit();

        // Forecast future values
        const forecastedValues = model.forecast(10); // Forecast the next 10 values

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
