const { log } = require('console');
const { HistoryTab } = require('../models/mst-history')
const fs = require('fs')

module.exports = {
    index: async (req, res) => {
        try {
            const pr = await HistoryTab.findAll();
            console.log(pr)
            res.status(200).json(pr);
        } catch (e) {
            res.status(500).json(e) 
        }
    },

    arimatest: async (req, res) => {
        try {
            const historyData = await HistoryTab.findAll({
                where: {
                    area_name: 'OCI1',
                    device_name: 'CAP - FEEDER C/V 1',
                    test_name: '2H',
                },
                attributes: ['do_date', 'device_name', 'value'],
                order: [['do_date', 'ASC']],
            });

            const dates = [];
            const values = [];

            historyData.forEach(item => {
                dates.push(item.do_date);
                values.push(item.value);
            });

            const averageValue = values.reduce((acc, curr) => acc + curr, 0) / values.length;

            const forecastValues = [];
            const forecastDates = [];

            for (let i = 0; i < values.length; i++) {
                forecastValues.push(averageValue);
                forecastDates.push(dates[i]);
            }

            const mapeValues = values.map((actual, index) => Math.abs((actual - forecastValues[index]) / actual));
            const mape = (mapeValues.reduce((acc, curr) => acc + curr, 0) / mapeValues.length) * 100;

            const responseData = {
                'forecast_values': forecastValues,
                'forecast_dates': forecastDates,
                'original_values': values,
                'mape': mape,
            };

            res.status(200).json(responseData);
        } catch (error) {
            const errorMessage = `Failed to fetch data from the database or perform ARIMA prediction: ${error.toString()}`;
            console.log(errorMessage);
            res.status(500).json({ error: errorMessage });
        }
    }

}