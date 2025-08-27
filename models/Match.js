// models/Match.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const MatchSchema = new Schema({
    matchId: { type: String, unique: true, required: true, index: true }, // 4-digit unique match ID
    teamA: { type: String, required: true, trim: true },
    teamB: { type: String, required: true, trim: true },
    batting: { type: String, required: true, trim: true },
    overs: { type: Number, required: true },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    ballCount: { type: Number, default: 0 },
    isInningsOver: { type: Boolean, default: false },
    status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
    // store entire match state exported by the frontend
    fullMatchJSON: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

MatchSchema.index({ createdAt: -1 });

MatchSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Match', MatchSchema);
