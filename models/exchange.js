const mongoose = require("mongoose");

const exchangeSchema = new mongoose.Schema({
    lastUpdated:{
        type: Date,
        default: Date.now
    },
    rates:{
        type: [String],
        default: undefined,
        required: true
    }
});

module.exports = mongoose.model("Exchange", exchangeSchema);