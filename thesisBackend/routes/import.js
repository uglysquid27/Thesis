const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { importCSV, index } = require('./../controllers/import-controller'); 
const fetchingdataController = require("../controllers/fetchingdata-controller");

const app = express();
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const targetPath = path.join(__dirname, '..', 'uploads', file.originalname);

    fs.rename(file.path, targetPath, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save file' });
        }
        res.status(200).json({ message: 'File uploaded successfully' });
    });
});

module.exports = router;