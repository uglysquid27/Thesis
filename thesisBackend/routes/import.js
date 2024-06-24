const express = require('express');
const multer = require('multer');
const path = require('path');
const { importCSV, index } = require('./../controllers/import-controller'); 
const app = express();
const upload = multer({ dest: 'uploads/' });

// Routes
app.get('/data', index);
app.post('/import-csv', upload.single('file'), importCSV);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
