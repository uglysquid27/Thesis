const { test } = require('../config/connection');
const { DataTypes } = require('sequelize');

const HistoryTab = test.define(
    "mst_history",
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        area_name: {
            type: DataTypes.STRING,
        },
        section_name: {
            type: DataTypes.STRING,
        },
        device_name: {
            type: DataTypes.STRING,
        },
        test_name: {
            type: DataTypes.STRING,
        },
        point_test_name: {
            type: DataTypes.STRING,
        },
        satuan: {
            type: DataTypes.STRING,
        },
        kategori: {
            type: DataTypes.STRING,
        },
        do_date: {
            type: DataTypes.DATE,
        },
        value: {
            type: DataTypes.INTEGER,
        },
    },
    {
        tableName: "mst_history",
        timestamps: false
    }
);
// Synchronize model dengan database
(async () => {
    await test.sync();
    console.log('Model synchronized with database.');
})();
module.exports = { test, HistoryTab };
 