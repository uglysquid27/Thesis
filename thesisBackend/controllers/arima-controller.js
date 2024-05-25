const { log } = require('console');
const { HistoryTab } = require('../models/mst-history')
const fs = require('fs')
const ARIMA = require('arima');

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
            const forecastLength = parseInt(req.query.forecastLength) || 3; // Get forecast length from query parameter, default to 3

            const historyData = await HistoryTab.findAll({
                where: {
                    area_name: 'OCI1',
                    device_name: 'CAP - FEEDER C/V 1',
                    test_name: '2H',
                },
                attributes: ['do_date', 'value'],
                order: [['do_date', 'ASC']],
            });

            const dates = [];
            const values = [];

            historyData.forEach(item => {
                dates.push(item.do_date);
                values.push(parseFloat(item.value));
            });

            console.log('Original Values:', values);

            // Configure the ARIMA model
            const p = 1; // Order of the AR part
            const d = 0; // Number of differences needed for stationarity
            const q = 1; // Order of the MA part

            // Create and fit the ARIMA model
            const arima = new ARIMA({ p, d, q }).fit(values);
            console.log('Model fitted');

            // Forecasting the next value
            const forecastValues = arima.predict(forecastLength).map(f => f[0]);
            console.log('Forecast Values:', forecastValues);

            // Ensure forecastValues has the same length as forecastLength
            if (forecastValues.length !== forecastLength) {
                console.error(`Expected ${forecastLength} forecast values but got ${forecastValues.length}`);
                while (forecastValues.length < forecastLength) {
                    forecastValues.push(null);
                }
            }

            // Calculate MAPE (Mean Absolute Percentage Error)
            const originalValues = values.slice(-forecastLength - forecastLength, -forecastLength);
            console.log('Original Values for MAPE:', originalValues);

            if (originalValues.length !== forecastValues.length) {
                console.error(`Mismatch in lengths: originalValues(${originalValues.length}), forecastValues(${forecastValues.length})`);
            }

            const mapeValues = originalValues.map((actual, index) => {
                const forecast = forecastValues[index];
                if (actual === 0 || forecast === null) {
                    return 0; // Avoid division by zero and null forecast values
                } else {
                    return Math.abs((actual - forecast) / actual);
                }
            });

            console.log('MAPE Values:', mapeValues);

            const mape = (mapeValues.reduce((acc, curr) => acc + curr, 0) / mapeValues.length) * 100;
            console.log('MAPE:', mape);

            const responseData = {
                forecast_values: forecastValues,
                forecast_dates: dates.slice(-forecastLength),
                original_values: originalValues,
                mape: mape,
            };

            res.status(200).json(responseData);
        } catch (error) {
            const errorMessage = `Failed to fetch data from the database or perform ARIMA prediction: ${error.toString()}`;
            console.log(errorMessage);
            res.status(500).json({ error: errorMessage });
        }
    }

}