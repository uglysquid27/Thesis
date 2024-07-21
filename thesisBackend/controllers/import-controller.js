const { log } = require('console');
const { LabelTab } = require('../models/label_plan');
const { Op, fn, col, literal, Sequelize } = require('sequelize');
const fs = require('fs');
const csvParser = require('csv-parser');

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

const importFromCSV = async (filePath) => {
    const results = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    const formattedData = results.map(row => ({
                        epochtime: parseInt(row.epochtime),
                        time: new Date(row.time),
                        plc_time: new Date(row.plc_time),
                        ms: row.ms ? parseInt(row.ms) : null,
                        modify: row.modify ? parseInt(row.modify) : null,
                        lotno1: row.lotno1,
                        prod_order1: row.prod_order1,
                        Label_Length_AVE: parseFloat(row.Label_Length_AVE),
                        Label_Length_PV: parseFloat(row.Label_Length_PV),
                        Label_Length_SV: parseFloat(row.Label_Length_SV),
                        Temp_G_Roller_Body_PV: parseFloat(row.Temp_G_Roller_Body_PV),
                        Temp_Glue_Bar_PV: parseFloat(row.Temp_Glue_Bar_PV),
                        Temp_Glue_PV: parseFloat(row.Temp_Glue_PV),
                        Temp_Glue_Scrapper_PV: parseFloat(row.Temp_Glue_Scrapper_PV),
                        Temp_Glue_Tank_PV: parseFloat(row.Temp_Glue_Tank_PV),
                        Temp_Glue_Roller_PV: parseFloat(row.Temp_Glue_Roller_PV),
                        Speed_Label: parseFloat(row.Speed_Label),
                        bpd_Lower_pressure_Min: parseFloat(row.bpd_Lower_pressure_Min),
                        bpd_Upper_pressure_Max: parseFloat(row.bpd_Upper_pressure_Max)
                    }));

                    await LabelTab.bulkCreate(formattedData);
                    resolve({ message: 'Data imported successfully' });
                } catch (error) {
                    console.error('Error in importFromCSV:', error);
                    reject(error);
                }
            })
            .on('error', (error) => {
                console.error('Error reading CSV:', error);
                reject(error);
            });
    });
};

module.exports = {
    importCSV: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            const result = await importFromCSV(req.file.path);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in importCSV route:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};
