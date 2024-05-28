const { log } = require('console');
const { HistoryTab } = require('../models/mst-history');
const { LabelTab } = require('../models/label_plan');
const { Op, fn, col, literal } = require('sequelize');
const fs = require('fs');
const ARIMA = require('arima');
const Timeseries = require('timeseries-analysis');

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
            const pr = await LabelTab.findAll({
                attributes: [
                    [literal('DISTINCT DATE(time)'), 'date'],
                    'Label_Length_AVE'
                ],
                where: {
                    Label_Length_AVE: { [Op.ne]: 0 }
                },
                order: [[literal('DATE(time)'), 'ASC']],
                limit: 100
            });

            const data = pr.map(entry => ({
                date: entry.dataValues.date,
                value: entry.dataValues.Label_Length_AVE
            }));

            const filteredEntries = data.filter(entry => entry.value !== null && entry.value !== undefined);

            const values = filteredEntries.map(entry => entry.value);


            let forecasts = [];
            if (values.length > 0) {
                const t = new Timeseries.main(Timeseries.adapter.fromArray(values));

                t.smoother({ period: 5 });

                const forecastValues = t.sliding_regression_forecast({ window: 12, degree: 1 });
                console.log('Forecast values:', forecastValues);

                if (Array.isArray(forecastValues)) {
                    // Step 8: Prepare the forecast result with original dates
                    forecasts = forecastValues.map((value, index) => {
                        const date = new Date(filteredEntries[filteredEntries.length - 1].date);
                        date.setDate(date.getDate() + index + 1); // Assuming daily intervals for simplicity
                        return { date: date.toISOString(), value };
                    });

                } else {
                    console.error('Expected an array for forecastValues but got:', forecastValues);
                }
            } else {
                console.warn('No valid data available for forecasting.');
            }

            console.log('Final forecast data:', { Label_Length_AVE: forecasts });
            console.log(forecasts)
            res.status(200).json({ Label_Length_AVE: forecasts });
        } catch (e) {
            console.error(e);
            res.status(500).json({
                error: 'An error occurred while processing your request.',
                details: e.message
            });
        }
    }
}