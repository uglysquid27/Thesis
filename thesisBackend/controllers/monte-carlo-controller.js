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

    montecarlotest: async (req, res) => {
        try {
            const historyData = await HistoryTab.findAll({
                where: {
                    area_name: 'OCI1',
                    device_name: 'CAP - FEEDER C/V 1',
                    test_name: '2H',
                },
                attributes: ['do_date', 'device_name', 'value'],
                order: [['do_date', 'ASC']]
            });
    
            const dates = historyData.map(item => item.do_date);
            const values = historyData.map(item => item.value);
    
            const monteCarloSimulations = 1000;
            const simulationResults = [];
    
            // Function to generate normally distributed random numbers
            const generateNormalNoise = (mean, stdDev, size) => {
                const noise = [];
                for (let i = 0; i < size; i++) {
                    let u1 = Math.random();
                    let u2 = Math.random();
                    let randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
                    noise.push(mean + stdDev * randStdNormal);
                }
                return noise;
            };
    
            for (let i = 0; i < monteCarloSimulations; i++) {
                const noise = generateNormalNoise(0, 1, values.length);
                const simulatedValues = values.map((value, index) => value + noise[index]);
                simulationResults.push(simulatedValues);
            }
    
            const mapeMonteCarlo = simulationResults.map(simValues => {
                const mapeValues = values.map((actual, index) => Math.abs((actual - simValues[index]) / actual));
                return (mapeValues.reduce((acc, curr) => acc + curr, 0) / mapeValues.length) * 100;
            });
    
            const minMapeIndex = mapeMonteCarlo.indexOf(Math.min(...mapeMonteCarlo));
            const minMapeSimulation = simulationResults[minMapeIndex];
    
            const responseData = {
                min_mape_simulation: minMapeSimulation,
                min_mape_value: mapeMonteCarlo[minMapeIndex],
                simulation_results: simulationResults,
                mape_monte_carlo: mapeMonteCarlo,
                data: historyData
            };
    
            res.status(200).json(responseData);
        } catch (error) {
            const errorMessage = `Failed to fetch data from the database or perform Monte Carlo simulation: ${error.toString()}`;
            console.error(errorMessage);
            res.status(500).json({ error: errorMessage });
        }
    }

}