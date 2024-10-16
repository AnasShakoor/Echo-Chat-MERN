const mongoose = require('mongoose');

const filesSchema = new mongoose.Schema({
     messageFile:{
        require:true,
        type: String
     }
});

const File = mongoose.model('File', filesSchema);
module.exports = File;