const { test } = require('../config/connection');
const { DataTypes } = require('sequelize');

const LabelTab = test.define(
    "label_oci1",
    {
        epochtime: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        time: {
            type: DataTypes.STRING,
        },
        plc_time: {
            type: DataTypes.STRING,
        },
        Label_Length_AVE: {
            type: DataTypes.FLOAT,
        },
        Label_Length_PV: {
            type: DataTypes.FLOAT,
        },
        Label_Length_SV: {
            type: DataTypes.FLOAT,
        },
        Temp_G_Roller_Body_PV: {
            type: DataTypes.FLOAT,
        },
        Temp_Glue_Bar_PV: {
            type: DataTypes.FLOAT,
        },
        Temp_Glue_PV: {
            type: DataTypes.FLOAT,
        },
        Temp_Glue_Scrapper_PV: {
            type: DataTypes.FLOAT,
        },
        Temp_Glue_Tank_PV: {
            type: DataTypes.FLOAT,
        },
        Temp_Glue_Roller_PV: {
            type: DataTypes.FLOAT,
        },
        Speed_Label: {
            type: DataTypes.FLOAT,
        },
        bpd_Lower_pressure_Min: {
            type: DataTypes.FLOAT,
        },
        bpd_Upper_pressure_Max: {
            type: DataTypes.FLOAT,
        },
    },
    {
        tableName: "label_oci1",
        timestamps: false
    }
);
// Synchronize model dengan database
(async () => {
    await test.sync();
    console.log('Model synchronized with database.');
})();
module.exports = { test, LabelTab };
 