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

const monteCarlo = async (req, res, attributeName) => {
    try {
        if (!attributeName) {
            return res.status(400).json({ error: 'Attribute name is required' });
        }

        const steps = {};

        // Step 1: Fetch historical data and group by 10-minute intervals
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
        
        steps.historicalData = historicalData;
        

        // Step 2: Format and reverse the historical data
        const historicalValues = historicalData.map(item => ({
            time: formatTime(item.dataValues.interval_time),
            value: Math.floor(parseFloat(item.dataValues[attributeName])) // Rounded down to the nearest whole number
        })).reverse();

        steps.formattedData = historicalValues; 

        // Step 3: Use the first 30 data points for the simulation base
        const simulationBaseData = historicalValues.slice(20, 30);
        steps.simulationBaseData = simulationBaseData; 

        // Step 4: Run Monte Carlo simulations
        const numberOfSimulations = 1000;
        const simulations = Array.from({ length: numberOfSimulations }, () => {
            return simulationBaseData.map(dataPoint => {
                const deviation = (Math.random() - 0.5) * 0.2;
                const newValue = dataPoint.value * (1 + deviation);
                return { time: dataPoint.time, value: newValue };
            });
        });

        steps.simulations = simulations;

        // Step 5: Aggregate the simulation results
        const forecastResults = simulations.reduce((acc, curr) => {
            curr.forEach((dataPoint, index) => {
                acc[index] = acc[index] ? [...acc[index], dataPoint] : [dataPoint];
            });
            return acc;
        }, []);

        steps.forecastResults = forecastResults; 

        // Step 6: Calculate the average forecast values
        const forecastedAverages = forecastResults.map(simulation => {
            const sum = simulation.reduce((total, dataPoint) => total + dataPoint.value, 0);
            return sum / simulation.length;
        });

        steps.forecastedAverages = forecastedAverages; 

        // Step 7: Generate forecast times
        const lastHistoricalTime = new Date(simulationBaseData[simulationBaseData.length - 1].time);
        const forecastTimes = [];
        for (let i = 1; i <= 10; i++) {
            const forecastTime = new Date(lastHistoricalTime.getTime() + i * 10 * 60 * 1000);
            forecastTimes.push(formatTime(forecastTime));
        }

        steps.forecastTimes = forecastTimes; 

        // Step 8: Combine forecasted values with their corresponding times
        const forecastedResultsWithTime = forecastedAverages.slice(0, 10).map((value, index) => ({
            time: forecastTimes[index],
            value: value
        }));

        steps.forecastedResultsWithTime = forecastedResultsWithTime;

        // Step 9: Calculate MAPE using the last 10 historical values for comparison
        const actualValuesForComparison = historicalValues.slice(20, 30);
        const mape = actualValuesForComparison.reduce((totalError, historicalValue, index) => {
            const forecastValue = forecastedResultsWithTime[index]?.value;
            if (forecastValue !== undefined) {
                const error = Math.abs((historicalValue.value - forecastValue) / historicalValue.value);
                return totalError + error;
            }
            return totalError;
        }, 0) / actualValuesForComparison.length * 100;

        steps.mape = mape; 

        // Step 10: Aggregate the forecasted results
        const aggregatedResults = forecastedResultsWithTime.map((item, index) => ({
            interval_index: index,
            time: item.time,
            value: item.value
        }));

        steps.aggregatedResults = aggregatedResults; 

        // Send the JSON response with forecasted results, MAPE, and steps
        res.json({ forecastedResultsWithTime, mape, steps });
    } catch (error) {
        console.error('Error in Monte Carlo Forecasting:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const index = async (req, res, attributeName) => {
    try {
        await monteCarlo(req, res, attributeName);
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
