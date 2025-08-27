// routes/matches.js
const express = require('express');
const router = express.Router();
const matchCtrl = require('../controllers/matchController');

// Create: save a match
router.post('/', matchCtrl.createMatch);

// List all (recent)
router.get('/', matchCtrl.listMatches);

// Get single match
router.get('/:id', matchCtrl.getMatch);

// Update match (replace)
router.put('/:id', matchCtrl.updateMatch);

// Delete match
router.delete('/:id', matchCtrl.deleteMatch);

module.exports = router;
