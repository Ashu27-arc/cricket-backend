// models/Counter.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const CounterSchema = new Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 1000 } // Start from 1000 to ensure 4-digit IDs
});

module.exports = mongoose.model('Counter', CounterSchema);