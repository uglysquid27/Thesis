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
                order: [['do_date', 'ASC']], // Ensure data is sorted by date
            });

            const dates = [];
            const values = [];

            historyData.forEach(item => {
                dates.push(item.do_date);
                values.push(item.value);
            });

            // Calculate average value to use as the forecast
            const averageValue = values.reduce((acc, curr) => acc + curr, 0) / values.length;

            const forecastValues = [];
            const forecastDates = [];

            // Assuming a simple forecast where each subsequent value is the average of previous values
            for (let i = 0; i < values.length; i++) {
                forecastValues.push(averageValue);
                forecastDates.push(dates[i]);
            }

            // Calculate MAPE
            const mapeValues = values.map((actual, index) => Math.abs((actual - forecastValues[index]) / actual));
            const mape = (mapeValues.reduce((acc, curr) => acc + curr, 0) / mapeValues.length) * 100;

            const responseData = {
                'forecast_values': forecastValues,
                'forecast_dates': forecastDates,
                'original_values': values,
                'mape': mape,
            };

            // Return JSON response
            res.status(200).json(responseData);
        } catch (error) {
            const errorMessage = `Failed to fetch data from the database or perform ARIMA prediction: ${error.toString()}`;
            console.log(errorMessage);
            res.status(500).json({ error: errorMessage });
        }
    }


    // findById: async (req, res) => {
    //     try {
    //         const pr = await ActivityTab.findOne({
    //             where: {
    //                 id: req.params.id,
    //             },
    //         });
    //         res.status(200).json(pr);
    //     } catch (e) {
    //         console.log(e)
    //         res.status(500).json(e)
    //     }
    // },

    // store : async (req, res) => {
    //     try {
    //         console.log(req.body)
    //         const activity = await ActivityTab.create({
    //             activity: req.body.activity,
    //             duration: req.body.duration, 
    //             color: req.body.color,
    //         });

    //         res.status(200).json(activity);
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json(error);
    //     }
    // },



}