const mongoose = require("mongoose");


mongoose.connect('mongodb://localhost:27017/BDLS-db', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
});


// /Users/abdul/mongodb-win32-x86_64-windows-4.4.3/bin/mongod.exe --dbpath=/Users/abdul/mongodb_data

module.exports = mongoose;

