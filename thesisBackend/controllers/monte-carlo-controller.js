const { log } = require('console');
const { HistoryTab } = require('../models/mst-history')
const { LabelTab } = require('../models/label_plan');
const { Op, fn, col, literal } = require('sequelize');
const fs = require('fs')

// Function to calculate Monte Carlo forecast
const monteCarloForecast = async () => {
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

        // Extract historical data values
        const historicalValues = historicalData.map(item => item.Label_Length_AVE);

        // Perform Monte Carlo simulation
        const numberOfSimulations = 1000; // Change this as needed
        const simulations = Array.from({ length: numberOfSimulations }, () => {
            // Generate a random scenario based on historical data
            return historicalValues.map(value => {
                // Generate a random deviation within a range
                const deviation = Math.random() * 0.1; // Change 0.1 to adjust randomness
                const newValue = value * (1 + deviation);
                return newValue;
            });
        });

        // Aggregate simulation results
        const forecastResults = simulations.reduce((acc, curr) => {
            curr.forEach((value, index) => {
                acc[index] = acc[index] ? [...acc[index], value] : [value];
            });
            return acc;
        }, []);

        // Calculate average for each forecasted point
        const forecastedAverages = forecastResults.map(simulation => {
            const sum = simulation.reduce((total, value) => total + value, 0);
            return sum / simulation.length;
        });

        console.log('Monte Carlo Forecast:', forecastedAverages);
        return forecastedAverages;
    } catch (error) {
        console.error('Error in Monte Carlo Forecasting:', error);
        throw error;
    }
};

module.exports = {
    index: async (req, res) => {
        try {
            const forecastData = await monteCarloForecast();
            res.status(200).json(forecastData);
        } catch (error) {
            console.error('Error in index route:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },



}