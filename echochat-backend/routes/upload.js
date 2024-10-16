const express = require("express");
const router = express.Router();
const getUser = require("../middleware/getUser")
const { check, validationResult } = require('express-validator');
const Message = require("../models/Message")
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const path = require('path');




router.post('/', upload.single('file'), function (req, res) {
    try {
        const file = req.file;

        // Extract the file extension from the original file name
        const extension = path.extname(file.originalname); // e.g., .jpeg, .png

        // Create a new file name with the original extension
        const newFilename = `${file.filename}${extension}`;

        // Move the file to the correct path with the new filename
        const fileUrl = `${req.protocol}://${req.get('host')}/api/files/${newFilename}`;

        // Here you would rename the file on the filesystem to match the new filename
        const fs = require('fs');
        const oldPath = file.path;
        const newPath = path.join('uploads', newFilename);

        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                return res.status(500).send('Error renaming the file: '+ err);
            }

            res.send({fileUrl,file,newPath}); // Send the URL of the renamed file
        });
    } catch (error) {
        res.status(500).send(error);
    }
});


module.exports = router;