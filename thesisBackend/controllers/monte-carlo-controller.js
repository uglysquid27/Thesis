const { log } = require('console');
const { LabelTab } = require('../models/label_plan');
const { Op, fn, col, literal, Sequelize } = require('sequelize');
const express = require('express');
const app = express();

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

const monteCarlo = async (req, res) => {
    try {
        // Fetch historical data with intervals rounded to 10 minutes
        const historicalData = await LabelTab.findAll({
            attributes: [
                [Sequelize.literal('DATE_FORMAT(FROM_UNIXTIME(UNIX_TIMESTAMP(time) - MOD(UNIX_TIMESTAMP(time), 600)), "%Y-%m-%d %H:%i:00")'), 'interval_time'],
                [Sequelize.fn('AVG', Sequelize.col('Label_Length_AVE')), 'Label_Length_AVE']
            ],
            where: {
                [Op.and]: [
                    { Label_Length_AVE: { [Op.ne]: 0 } },
                    { time: { [Op.not]: null } }
                ]
            },
            group: [Sequelize.literal('interval_time')],
            order: [[Sequelize.literal('interval_time'), 'DESC']],
            limit: 40 // Fetch 40 data points
        });

        // Format the fetched data
        const historicalValues = historicalData.map(item => ({
            time: formatTime(item.dataValues.interval_time),
            Label_Length_AVE: parseFloat(item.dataValues.Label_Length_AVE)
        })).reverse(); // Reverse to get the data in chronological order

        // Use the first 30 data points for simulation
        const simulationBaseData = historicalValues.slice(0, 30);

        const numberOfSimulations = 1000;

        // Generate simulations
        const simulations = Array.from({ length: numberOfSimulations }, () => {
            return simulationBaseData.map(dataPoint => {
                // Adjust deviation range for more realistic simulation (e.g., -0.1 to 0.1)
                const deviation = (Math.random() - 0.5) * 0.2;
                const newValue = dataPoint.Label_Length_AVE * (1 + deviation);
                return { time: dataPoint.time, Label_Length_AVE: newValue };
            });
        });

        // Aggregate results by time intervals
        const forecastResults = simulations.reduce((acc, curr) => {
            curr.forEach((dataPoint, index) => {
                acc[index] = acc[index] ? [...acc[index], dataPoint] : [dataPoint];
            });
            return acc;
        }, []);

        // Calculate the average forecasted value for each interval
        const forecastedAverages = forecastResults.map(simulation => {
            const sum = simulation.reduce((total, dataPoint) => total + dataPoint.Label_Length_AVE, 0);
            return sum / simulation.length;
        });

        // Get the last historical time and generate times for the forecast
        const lastHistoricalTime = new Date(simulationBaseData[simulationBaseData.length - 1].time);
        const forecastTimes = [];
        for (let i = 1; i <= 10; i++) {
            const forecastTime = new Date(lastHistoricalTime.getTime() + i * 10 * 60 * 1000);
            forecastTimes.push(formatTime(forecastTime));
        }

        // Combine forecasted values with their corresponding times
        const forecastedResultsWithTime = forecastedAverages.slice(0, 10).map((value, index) => ({
            time: forecastTimes[index],
            Label_Length_AVE: value
        }));

        // Calculate MAPE using the last 10 historical values for comparison
        const actualValuesForComparison = historicalValues.slice(30, 40);
        const mape = actualValuesForComparison.reduce((totalError, historicalValue, index) => {
            const forecastValue = forecastedResultsWithTime[index]?.Label_Length_AVE;
            if (forecastValue !== undefined) {
                const error = Math.abs((historicalValue.Label_Length_AVE - forecastValue) / historicalValue.Label_Length_AVE);
                return totalError + error;
            }
            return totalError;
        }, 0) / actualValuesForComparison.length * 100;

        console.log('Monte Carlo Forecast:', forecastedResultsWithTime);
        console.log('Historical values with formatted time:', actualValuesForComparison);
        console.log('MAPE:', mape);

        // Send the JSON response
        res.json({ forecastedResultsWithTime, mape });
    } catch (error) {
        console.error('Error in Monte Carlo Forecasting:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const index = async (req, res) => {
    try {
        await monteCarlo(req, res);
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
