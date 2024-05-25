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
            const forecastLength = parseInt(req.query.forecastLength) || 5; // Get forecast length from query parameter, default to 3

            const historyData = await HistoryTab.findAll({
                where: {
                    area_name: 'OCI2',
                    device_name: 'CV M2',
                    test_name: 'R',
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

            let bestModel = null;
            let bestMAPE = Number.POSITIVE_INFINITY;

            // Try different combinations of ARIMA parameters
            for (let p = 0; p <= 2; p++) {
                for (let d = 0; d <= 2; d++) {
                    for (let q = 0; q <= 2; q++) {
                        const arima = new ARIMA({ p, d, q }).fit(values);
                        const forecastValues = arima.predict(forecastLength).map(f => f[0]);
                        const mape = calculateMAPE(forecastValues, values.slice(-forecastLength));
                        console.log(`ARIMA (${p}, ${d}, ${q}) MAPE: ${mape}`);

                        if (mape < bestMAPE) {
                            bestModel = arima;
                            bestMAPE = mape;
                        }
                    }
                }
            }

            console.log('Best ARIMA Model:', bestModel);
            console.log('Best MAPE:', bestMAPE);

            // Forecast using the best model
            const forecastValues = bestModel.predict(forecastLength).map(f => f[0]);
            console.log('Forecast Values:', forecastValues);

            const responseData = {
                forecast_values: forecastValues,
                forecast_dates: dates.slice(-forecastLength),
                original_values: values.slice(-forecastLength),
                mape: bestMAPE,
            };

            res.status(200).json(responseData);
        } catch (error) {
            const errorMessage = `Failed to fetch data from the database or perform ARIMA prediction: ${error.toString()}`;
            console.log(errorMessage);
            res.status(500).json({ error: errorMessage });
        }
    }
};

// Function to calculate MAPE
function calculateMAPE(forecastValues, actualValues) {
    const mapeValues = forecastValues.map((forecast, i) => {
        if (actualValues[i] === 0 || forecast === null) {
            return 0; // Avoid division by zero and handle null values
        } else {
            return Math.abs((actualValues[i] - forecast) / actualValues[i]);
        }
    });
    return (mapeValues.reduce((acc, curr) => acc + curr, 0) / mapeValues.length) * 100;
}