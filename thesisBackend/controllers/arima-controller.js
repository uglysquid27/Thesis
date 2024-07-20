const { LabelTab } = require('../models/label_plan');
const { Op, fn, col, literal, Sequelize } = require('sequelize');
const express = require('express');
const app = express();
const ss = require('simple-statistics');

// Function to format time
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

// Function to calculate differenced values
const calculateDifferenced = (values) => {
    const differenced = [];
    for (let i = 1; i < values.length; i++) {
        differenced.push(values[i] - values[i - 1]);
    }
    return differenced;
};

// Function to forecast using simple exponential smoothing (for demonstration)
const forecastExponentialSmoothing = (data, alpha = 0.3) => {
    const forecast = [];
    let lastForecast = data[0];
    
    for (let i = 0; i < data.length; i++) {
        lastForecast = alpha * data[i] + (1 - alpha) * lastForecast;
        forecast.push(lastForecast);
    }

    return forecast;
};

const arimaForecast = async (req, res) => {
    try {
        const { attributeName } = req.body;

        // Step 1: Fetch historical data with intervals rounded to 10 minutes
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

        console.log('Fetched Historical Data:', historicalData);

        // Format the fetched data and include values after the decimal point
        const historicalValues = historicalData.map(item => parseFloat(item.dataValues[attributeName])).reverse();

        // Use the last 10 data points for forecasting
        const trainingData = historicalValues.slice(30, 40);

        // Forecast using exponential smoothing
        const forecastResults = forecastExponentialSmoothing(trainingData);

        // Prepare forecasted results
        const forecastedResultsWithTime = forecastResults.map((value, index) => ({
            time: formatTime(new Date(Date.now() + (index + 1) * 10 * 60 * 1000)), // Assume next intervals are 10 minutes apart
            [attributeName]: value
        }));

        // Calculate MAPE from the last 10 training data points
        const realValues = historicalValues.slice(30, 40);
        const errors = realValues.map((real, index) => Math.abs((real - forecastResults[index]) / real) * 100);
        const mape = errors.reduce((sum, err) => sum + err, 0) / errors.length;

        console.log('ARIMA Forecast:', forecastedResultsWithTime);
        console.log('Errors:', errors);
        console.log('MAPE:', mape);

        // Send the JSON response with the forecasted results and MAPE
        res.json({
            forecastedResultsWithTime: forecastedResultsWithTime,
            mape: mape,
            steps: {
                fetchedHistoricalData: historicalData,
                formattedHistoricalValues: historicalValues,
                trainingData: trainingData,
                forecastResults: forecastResults,
                errors: errors
            }
        });
    } catch (error) {
        console.error('Error in ARIMA Forecasting:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const index = async (req, res, attributeName) => {
    try {
        await arimaForecast(req, res, attributeName);
    } catch (error) {
        console.error('Error in index route:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const all = async (req, res) => {
    try {
        const labels = await LabelTab.findAll();
        res.json(labels);
    } catch (error) {
        console.error('Error fetching data from label_oci1:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    index,
    all
};
