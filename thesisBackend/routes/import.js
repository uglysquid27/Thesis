const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { importCSV } = require('./../controllers/import-controller');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const targetPath = path.join(__dirname, '..', 'uploads', file.originalname);

    fs.rename(file.path, targetPath, async (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save file' });
        }

        try {
            req.file.path = targetPath; 
            await importCSV(req, res); 
        } catch (error) {
            console.error('Error in router:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});

module.exports = router;
