const { LabelTab } = require('../models/label_plan');
const { Op, Sequelize } = require('sequelize');
const express = require('express');
const app = express();

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

const Forecast = (data, alpha = 0.3) => {
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
                [Sequelize.literal(`DATE_FORMAT(FROM_UNIXTIME(UNIX_TIMESTAMP(time) - MOD(UNIX_TIMESTAMP(time), 3600)), "%Y-%m-%d %H:%i:00")`), 'interval_time'],
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
            limit: 40 
        });
        
        // steps.historicalData = historicalData;
        

        const steps = {};
        steps.historicalData = historicalData;

        // Step 2: Format and reverse the historical data
        const historicalValues = historicalData.map(item => parseFloat(item.dataValues[attributeName])).reverse();
        steps.formattedHistoricalValues = historicalValues;

        // Step 3: Use the last 10 data points for forecasting
        const trainingData = historicalValues.slice(30, 40);
        steps.trainingData = trainingData;

        // Step 4: Forecast using exponential smoothing
        const forecastResults = Forecast(trainingData);
        steps.forecastResults = forecastResults;

        // Step 5: Prepare forecasted results with time
        const forecastedResultsWithTime = forecastResults.map((value, index) => ({
            time: formatTime(new Date(Date.now() + (index + 1) * 10 * 60 * 1000)), 
            [attributeName]: value
        }));
        steps.forecastedResultsWithTime = forecastedResultsWithTime;

        // Step 6: Calculate MAPE from the last 10 training data points
        const realValues = historicalValues.slice(30, 40);
        const errors = realValues.map((real, index) => Math.abs((real - forecastResults[index]) / real) * 100);
        const mape = errors.reduce((sum, err) => sum + err, 0) / errors.length;
        steps.errors = errors;
        steps.mape = mape;

        // Step 7: Aggregate forecasted results
        const aggregatedResults = forecastedResultsWithTime.map((item, index) => ({
            interval_index: index,
            time: item.time,
            value: item[attributeName]
        }));
        steps.aggregatedResults = aggregatedResults;

        // Send the JSON response with forecasted results, MAPE, and steps
        res.json({ forecastedResultsWithTime, mape, steps });
    } catch (error) {
        console.error('Error in ARIMA Forecasting:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const index = async (req, res) => {
    try {
        await arimaForecast(req, res);
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
