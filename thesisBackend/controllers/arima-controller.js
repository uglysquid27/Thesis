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

    // findById: async (req, res) => {
    //     try {
    //         const pr = await ActivityTab.findOne({
    //             where: {
    //                 id: req.params.id,
    //             },
    //         });
    //         res.status(200).json(pr);
    //     } catch (e) {
    //         console.log(e)
    //         res.status(500).json(e)
    //     }
    // },

    // store : async (req, res) => {
    //     try {
    //         console.log(req.body)
    //         const activity = await ActivityTab.create({
    //             activity: req.body.activity,
    //             duration: req.body.duration, 
    //             color: req.body.color,
    //         });
    
    //         res.status(200).json(activity);
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json(error);
    //     }
    // },
  
 

}