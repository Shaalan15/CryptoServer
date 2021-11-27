const { TripleDES } = require('crypto-js');
const mongoose = require('mongoose');

// Creating the products schema
const blockSchema = mongoose.Schema(
    {
        // Name is required
        from: {
            type: String,
            required: true,
        },
        to: {
            type: String,
            required: true
        },
        index: {
            type: Number,
            required: true,
        },
        timestamp:{
            type: Date,
            required: true
        },
        amount:{
            type: Number,
            required: true
        },
        //dateCreated is set automatically
        previoushash: {
            type: String,
            required: true
        }
    });

// Creating a model of the schema. Takes the collection name and the schema
const blockModel = new mongoose.model('block', blockSchema);

module.exports = blockModel;