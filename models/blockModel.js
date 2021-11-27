const mongoose = require('mongoose');

// Creating the products schema
const blockSchema = mongoose.Schema(
    {
        index: {
            type: Number,
            required: true
        },
        from: {
            type: String,
            required: true,
        },
        to: {
            type: String,
            required: true
        },
        timestamp:{
            type: Date,
            required: true
        },
        amount:{
            type: Number,
            required: true
        },
        previoushash: {
            type: String,
            required: true
        },
        hash:{
            type: String,
            required: true
        },
        nonce:{
            type: Number,
            required: true
        }
    });

const blockModel = new mongoose.model('block', blockSchema);

module.exports = blockModel;