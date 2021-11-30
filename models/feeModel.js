const mongoose = require('mongoose');

// Creating the products schema
const feeSchema = mongoose.Schema(
    {
        wallet:{
            type: String,
            required: true
        },
        amount:{
            type: Number,
            required: true
        }
    });

const feeModel = new mongoose.model('fee', feeSchema);

module.exports = feeModel;