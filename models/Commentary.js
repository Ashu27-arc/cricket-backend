// models/Commentary.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentarySchema = new Schema({
    matchId: { type: String, required: true, index: true },
    over: { type: Number, required: true },
    ball: { type: Number, required: true },
    eventType: { 
        type: String, 
        required: true,
        enum: ['run', 'wicket', 'wide', 'no-ball', 'bye', 'leg-bye', 'dot', 'boundary', 'six']
    },
    runs: { type: Number, default: 0 },
    description: { type: String, required: true, trim: true },
    batsman: { type: String, trim: true },
    bowler: { type: String, trim: true },
    extras: {
        type: { type: String, enum: ['wide', 'no-ball', 'bye', 'leg-bye'] },
        value: { type: Number, default: 0 }
    },
    wicketDetails: {
        type: { type: String, enum: ['bowled', 'caught', 'lbw', 'run-out', 'stumped', 'hit-wicket'] },
        fielder: { type: String, trim: true }
    },
    timestamp: { type: Date, default: Date.now }
});

// Compound index for efficient querying
CommentarySchema.index({ matchId: 1, over: 1, ball: 1 });
CommentarySchema.index({ matchId: 1, timestamp: -1 });

module.exports = mongoose.model('Commentary', CommentarySchema);