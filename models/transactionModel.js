const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
    {
        from: {
            type: String,
            required: true,
        },
        to: {
            type: String,
            required: true
        },
        amount:{
            type: Number,
            required: true
        },
    });

const transactionModel = new mongoose.model('transaction', transactionSchema);

module.exports = transactionModel;