const { log } = require('console');
const { LabelTab } = require('../models/label_plan');
const { Op, fn, col, literal } = require('sequelize');
const fs = require('fs');

const formatTime = (timeString) => {
    const date = new Date(timeString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const monteCarloForecast = async () => {
    try {
        const historicalData = await LabelTab.findAll({
            attributes: [
                [literal('DATE(time)'), 'date'],
                [fn('MIN', col('time')), 'time'], 
                'Label_Length_AVE'
            ],
            where: {
                [Op.and]: [
                    { Label_Length_AVE: { [Op.ne]: 0 } },
                    { time: { [Op.not]: null } } 
                ]
            },
            group: [literal('DATE(time)')],
            order: [[literal('DATE(time)'), 'ASC']],
            limit: 100
        });

        const historicalValues = historicalData.map(item => ({
            time: formatTime(item.time),
            Label_Length_AVE: item.Label_Length_AVE
        }));

        const numberOfSimulations = 1000; 
        const simulations = Array.from({ length: numberOfSimulations }, () => {
            return historicalValues.map(dataPoint => {
                const deviation = Math.random() * 0.1;
                const newValue = dataPoint.Label_Length_AVE * (1 + deviation);
                return { time: dataPoint.time, Label_Length_AVE: newValue };
            });
        });

        const forecastResults = simulations.reduce((acc, curr) => {
            curr.forEach((dataPoint, index) => {
                acc[index] = acc[index] ? [...acc[index], dataPoint] : [dataPoint];
            });
            return acc;
        }, []);

        const forecastedAverages = forecastResults.map(simulation => {
            const sum = simulation.reduce((total, dataPoint) => total + dataPoint.Label_Length_AVE, 0);
            return sum / simulation.length;
        });

        console.log('Monte Carlo Forecast:', forecastedAverages);
        console.log('Historical values with formatted time:', historicalValues);

        return { forecastedAverages, historicalValues };
    } catch (error) {
        console.error('Error in Monte Carlo Forecasting:', error);
        throw error;
    }
};

module.exports = {
    index: async (req, res) => {
        try {
            const { forecastedAverages, historicalValues } = await monteCarloForecast();
            res.status(200).json({ forecastedAverages, historicalValues });
        } catch (error) {
            console.error('Error in index route:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};
