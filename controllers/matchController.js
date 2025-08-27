// controllers/matchController.js
const Match = require('../models/Match');
const isValidObjectId = require('../utils/validateObjectId');
const { generateCommentary, generateOverSummary, generateInningsEndCommentary } = require('../utils/commentaryGenerator');

async function createMatch(req, res) {
    try {
        const payload = req.body;
        // expect client to send a fullMatchJSON (the full state from frontend)
        if (!payload || !payload.fullMatchJSON) {
            return res.status(400).json({ message: "fullMatchJSON is required in request body" });
        }

        const top = payload.fullMatchJSON;
        const doc = new Match({
            teamA: top.teamA || payload.teamA || 'Team A',
            teamB: top.teamB || payload.teamB || 'Team B',
            batting: top.batting || payload.batting || 'Team A',
            overs: top.overs || payload.overs || 0,
            runs: top.runs || 0,
            wickets: top.wickets || 0,
            ballCount: top.ballCount || 0,
            isInningsOver: !!top.isInningsOver,
            fullMatchJSON: payload.fullMatchJSON
        });

        const saved = await doc.save();
        return res.status(201).json(saved);
    } catch (err) {
        console.error('createMatch error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

async function listMatches(req, res) {
    try {
        const matches = await Match.find().sort({ createdAt: -1 }).limit(200);
        return res.json(matches);
    } catch (err) {
        console.error('listMatches error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

async function getMatch(req, res) {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });
        const match = await Match.findById(id);
        if (!match) return res.status(404).json({ message: 'Match not found' });
        return res.json(match);
    } catch (err) {
        console.error('getMatch error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

async function updateMatch(req, res) {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });
        const payload = req.body;
        if (!payload || !payload.fullMatchJSON) {
            return res.status(400).json({ message: 'fullMatchJSON required' });
        }

        const top = payload.fullMatchJSON;
        const updated = await Match.findByIdAndUpdate(
            id,
            {
                teamA: top.teamA || payload.teamA,
                teamB: top.teamB || payload.teamB,
                batting: top.batting || payload.batting,
                overs: top.overs || payload.overs,
                runs: top.runs || 0,
                wickets: top.wickets || 0,
                ballCount: top.ballCount || 0,
                isInningsOver: !!top.isInningsOver,
                fullMatchJSON: payload.fullMatchJSON,
                updatedAt: new Date()
            },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Match not found' });

        // Generate commentary for the latest ball if there's new ball data
        if (payload.lastBall && req.io) {
            const commentary = generateCommentary(payload.lastBall, top);

            // Emit live update to all users watching this match
            req.io.to(`match-${id}`).emit('match-update', {
                match: updated,
                commentary: commentary,
                lastBall: payload.lastBall
            });

            // Check if over is completed
            if (payload.overCompleted) {
                const overSummary = generateOverSummary(
                    payload.completedOver,
                    payload.overNumber,
                    top,
                    payload.lastBall?.newStriker,
                    payload.lastBall?.newNonStriker
                );
                req.io.to(`match-${id}`).emit('over-completed', overSummary);
            }

            // Check if innings is over
            if (top.isInningsOver && payload.inningsJustEnded) {
                const inningsEndCommentary = generateInningsEndCommentary(top);
                req.io.to(`match-${id}`).emit('innings-ended', inningsEndCommentary);
            }
        }

        return res.json(updated);
    } catch (err) {
        console.error('updateMatch error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

async function deleteMatch(req, res) {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });
        const removed = await Match.findByIdAndDelete(id);
        if (!removed) return res.status(404).json({ message: 'Match not found' });
        return res.json({ message: 'Deleted' });
    } catch (err) {
        console.error('deleteMatch error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    createMatch,
    listMatches,
    getMatch,
    updateMatch,
    deleteMatch
};
