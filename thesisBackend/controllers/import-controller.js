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

const dataFetch = async () => {
    try {
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

        const historicalValues = historicalData.map(item => ({
            time: formatTime(item.dataValues.interval_time),
            Label_Length_AVE: parseFloat(item.dataValues.Label_Length_AVE)
        })).reverse(); // Reverse to get the data in chronological order

        return { historicalValues };
    } catch (error) {
        console.error('Error in dataFetch:', error);
        throw error;
    }
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
    index: async (req, res) => {
        try {
            const { historicalValues } = await dataFetch();
            res.status(200).json(historicalValues);
        } catch (error) {
            console.error('Error in index route:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
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
