// controllers/enhancedMatchController.js
const Match = require('../models/Match');
const Commentary = require('../models/Commentary');
const { getNextMatchId } = require('../utils/matchIdGenerator');
const { getRedisClient } = require('../config/redis');
const isValidObjectId = require('../utils/validateObjectId');

// Start a new match
async function startMatch(req, res) {
    try {
        const { teamA, teamB, overs, tossWinner, tossDecision } = req.body;

        if (!teamA || !teamB || !overs) {
            return res.status(400).json({
                message: 'teamA, teamB, and overs are required'
            });
        }

        // Generate unique 4-digit match ID
        const matchId = await getNextMatchId();

        // Determine batting team based on toss
        let batting = teamA;
        if (tossWinner && tossDecision) {
            if (tossDecision === 'bat') {
                batting = tossWinner;
            } else if (tossDecision === 'bowl') {
                batting = tossWinner === teamA ? teamB : teamA;
            }
        }

        // Create initial match state
        const initialMatchState = {
            matchId,
            teamA,
            teamB,
            batting,
            overs,
            runs: 0,
            wickets: 0,
            ballCount: 0,
            currentOver: 1,
            isInningsOver: false,
            tossWinner,
            tossDecision,
            innings: 1
        };

        const match = new Match({
            matchId,
            teamA,
            teamB,
            batting,
            overs,
            status: 'live',
            fullMatchJSON: initialMatchState
        });

        const savedMatch = await match.save();

        // Cache in Redis for quick access
        const redisClient = getRedisClient();
        if (redisClient) {
            await redisClient.setEx(`match:${matchId}`, 3600, JSON.stringify(savedMatch));
        }

        // Emit to all connected clients
        if (req.io) {
            req.io.emit('match-started', {
                matchId,
                match: savedMatch
            });
        }

        return res.status(201).json({
            success: true,
            matchId,
            match: savedMatch
        });
    } catch (error) {
        console.error('Start match error:', error);
        return res.status(500).json({
            message: 'Failed to start match',
            error: error.message
        });
    }
}

// Add commentary for a specific ball
async function addCommentary(req, res) {
    try {
        const { id: matchId } = req.params;
        const { over, ball, eventType, runs = 0, description, batsman, bowler, extras, wicketDetails } = req.body;

        if (!over || ball === undefined || !eventType || !description) {
            return res.status(400).json({
                message: 'over, ball, eventType, and description are required'
            });
        }

        // Verify match exists
        const match = await Match.findOne({ matchId });
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        // Create commentary entry
        const commentary = new Commentary({
            matchId,
            over,
            ball,
            eventType,
            runs,
            description,
            batsman,
            bowler,
            extras: extras || {},
            wicketDetails: wicketDetails || {}
        });

        const savedCommentary = await commentary.save();

        // Update Redis cache
        const redisClient = getRedisClient();
        if (redisClient) {
            const cacheKey = `commentary:${matchId}`;
            await redisClient.lPush(cacheKey, JSON.stringify(savedCommentary));
            await redisClient.expire(cacheKey, 3600); // Expire in 1 hour
        }

        // Emit real-time update
        if (req.io) {
            req.io.to(`match-${matchId}`).emit('commentary-update', {
                matchId,
                commentary: savedCommentary
            });
        }

        return res.status(201).json({
            success: true,
            commentary: savedCommentary
        });
    } catch (error) {
        console.error('Add commentary error:', error);
        return res.status(500).json({
            message: 'Failed to add commentary',
            error: error.message
        });
    }
}

// Get match details with commentary
async function getMatchDetails(req, res) {
    try {
        const { id: matchId } = req.params;

        // Try Redis cache first
        const redisClient = getRedisClient();
        let match = null;

        if (redisClient) {
            const cachedMatch = await redisClient.get(`match:${matchId}`);
            if (cachedMatch) {
                match = JSON.parse(cachedMatch);
            }
        }

        // If not in cache, get from database
        if (!match) {
            match = await Match.findOne({ matchId });
            if (!match) {
                return res.status(404).json({ message: 'Match not found' });
            }

            // Cache for future requests
            if (redisClient) {
                await redisClient.setEx(`match:${matchId}`, 3600, JSON.stringify(match));
            }
        }

        // Get commentary
        let commentary = [];

        if (redisClient) {
            const cachedCommentary = await redisClient.lRange(`commentary:${matchId}`, 0, -1);
            if (cachedCommentary.length > 0) {
                commentary = cachedCommentary.map(item => JSON.parse(item)).reverse();
            }
        }

        // If no cached commentary, get from database
        if (commentary.length === 0) {
            commentary = await Commentary.find({ matchId })
                .sort({ over: 1, ball: 1 })
                .lean();
        }

        return res.json({
            success: true,
            match,
            commentary,
            totalCommentary: commentary.length
        });
    } catch (error) {
        console.error('Get match details error:', error);
        return res.status(500).json({
            message: 'Failed to get match details',
            error: error.message
        });
    }
}

// Get live matches
async function getLiveMatches(req, res) {
    try {
        const liveMatches = await Match.find({ status: 'live' })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return res.json({
            success: true,
            matches: liveMatches,
            count: liveMatches.length
        });
    } catch (error) {
        console.error('Get live matches error:', error);
        return res.status(500).json({
            message: 'Failed to get live matches',
            error: error.message
        });
    }
}

// Update match status
async function updateMatchStatus(req, res) {
    try {
        const { id: matchId } = req.params;
        const { status, fullMatchJSON } = req.body;

        if (!status || !['upcoming', 'live', 'completed'].includes(status)) {
            return res.status(400).json({
                message: 'Valid status (upcoming, live, completed) is required'
            });
        }

        const updateData = { status, updatedAt: new Date() };
        if (fullMatchJSON) {
            updateData.fullMatchJSON = fullMatchJSON;
            // Update other fields from fullMatchJSON
            updateData.runs = fullMatchJSON.runs || 0;
            updateData.wickets = fullMatchJSON.wickets || 0;
            updateData.ballCount = fullMatchJSON.ballCount || 0;
            updateData.isInningsOver = !!fullMatchJSON.isInningsOver;
        }

        const match = await Match.findOneAndUpdate(
            { matchId },
            updateData,
            { new: true }
        );

        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        // Update Redis cache
        const redisClient = getRedisClient();
        if (redisClient) {
            await redisClient.setEx(`match:${matchId}`, 3600, JSON.stringify(match));
        }

        // Emit real-time update
        if (req.io) {
            req.io.emit('match-status-update', {
                matchId,
                status,
                match
            });
        }

        return res.json({
            success: true,
            match
        });
    } catch (error) {
        console.error('Update match status error:', error);
        return res.status(500).json({
            message: 'Failed to update match status',
            error: error.message
        });
    }
}

module.exports = {
    startMatch,
    addCommentary,
    getMatchDetails,
    getLiveMatches,
    updateMatchStatus
};