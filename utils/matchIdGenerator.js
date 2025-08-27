// utils/matchIdGenerator.js
const Match = require('../models/Match');

// Generate unique 4-digit match ID
function generateMatchId() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

async function getNextMatchId() {
    let matchId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!isUnique && attempts < maxAttempts) {
        matchId = generateMatchId();
        const existingMatch = await Match.findOne({ matchId });
        if (!existingMatch) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Unable to generate unique match ID after maximum attempts');
    }

    return matchId;
}

module.exports = { getNextMatchId, generateMatchId };