const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    currencyCode:{
        type: String,
        required: true
    },
    languages:{
        type: [String],
        default: undefined,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    lat:{
        type: Number,
        required: true
    },
    lon:{
        type: Number,
        required: true
    },
    weather:{
        type: String,
        required: true
    },
    temp:{
        type:Number,
        required: true
    },
    lastUpdated:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("City", citySchema);