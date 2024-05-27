const { log } = require('console');
const { HistoryTab } = require('../models/mst-history')
const { LabelTab } = require('../models/label_plan')
const { Op, fn, col, literal } = require('sequelize');
const fs = require('fs')
const ARIMA = require('arima');

module.exports = {
    index: async (req, res) => {
       try {
            const pr = await LabelTab.findAll({
                attributes: [
                    [literal('DISTINCT DATE(time)'), 'date'],
                    'epochtime',
                    'time',
                    'plc_time',
                    'Label_Length_AVE',
                    'Label_Length_PV',
                    'Label_Length_SV',
                    'Temp_G_Roller_Body_PV',
                    'Temp_Glue_Bar_PV',
                    'Temp_Glue_PV',
                    'Temp_Glue_Scrapper_PV',
                    'Temp_Glue_Tank_PV',
                    'Temp_Glue_Roller_PV',
                    'Speed_Label',
                    'bpd_Lower_pressure_Min',
                    'bpd_Upper_pressure_Max'
                ],
                where: {
                    [Op.or]: [
                        { Label_Length_AVE: { [Op.ne]: 0 } },
                        { Label_Length_PV: { [Op.ne]: 0 } },
                        { Label_Length_SV: { [Op.ne]: 0 } },
                        { Temp_G_Roller_Body_PV: { [Op.ne]: 0 } },
                        { Temp_Glue_Bar_PV: { [Op.ne]: 0 } },
                        { Temp_Glue_PV: { [Op.ne]: 0 } },
                        { Temp_Glue_Scrapper_PV: { [Op.ne]: 0 } },
                        { Temp_Glue_Tank_PV: { [Op.ne]: 0 } },
                        { Temp_Glue_Roller_PV: { [Op.ne]: 0 } },
                        { Speed_Label: { [Op.ne]: 0 } },
                    ]
                },
                group: [literal('DATE(time)')],
                order: [[literal('DATE(time)'), 'ASC']],
                limit: 100,
                order: [[literal('date'), 'ASC']]
            });
            console.log(pr);
            res.status(200).json(pr);
        } catch (e) {
            res.status(500).json(e);
        }
    },

    arimatest: async (req, res) => {
        try {
            const forecastLength = parseInt(req.query.forecastLength) || 5; 

            // Generate dummy historical data
            const generateDummyData = (length) => {
                const data = [];
                for (let i = 0; i < length; i++) {
                    data.push(Math.sin(i / 10) + (Math.random() * 0.5 - 0.25)); 
                }
                return data;
            };

            const values = generateDummyData(200);

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
                original_values: values.slice(-forecastLength),
                mape: bestMAPE,
            };

            res.status(200).json(responseData);
        } catch (error) {
            const errorMessage = `Failed to perform ARIMA prediction: ${error.toString()}`;
            console.log(errorMessage);
            res.status(500).json({ error: errorMessage });
        }


        // Function to calculate MAPE
        function calculateMAPE(forecastValues, actualValues) {
            const mapeValues = forecastValues.map((forecast, i) => {
                if (actualValues[i] === 0 || forecast === null) {
                    return 0;
                } else {
                    return Math.abs((actualValues[i] - forecast) / actualValues[i]);
                }
            });
            return (mapeValues.reduce((acc, curr) => acc + curr, 0) / mapeValues.length) * 100;
        }
    }
}