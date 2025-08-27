// routes/matches.js
const express = require('express');
const router = express.Router();
const matchCtrl = require('../controllers/matchController');
const enhancedMatchCtrl = require('../controllers/enhancedMatchController');

// Enhanced endpoints
// Start a new match - POST /matches/start
router.post('/start', enhancedMatchCtrl.startMatch);

// Add commentary - POST /matches/:id/commentary
router.post('/:id/commentary', enhancedMatchCtrl.addCommentary);

// Get live matches - GET /matches/live
router.get('/live', enhancedMatchCtrl.getLiveMatches);

// Get match details with commentary - GET /matches/:id
router.get('/:id', enhancedMatchCtrl.getMatchDetails);

// Update match status - PUT /matches/:id/status
router.put('/:id/status', enhancedMatchCtrl.updateMatchStatus);

// Legacy endpoints (keeping for backward compatibility)
// Create: save a match
router.post('/', matchCtrl.createMatch);

// List all (recent)
router.get('/all', matchCtrl.listMatches);

// Update match (replace)
router.put('/:id', matchCtrl.updateMatch);

// Delete match
router.delete('/:id', matchCtrl.deleteMatch);

module.exports = router;
