// test-endpoints.js - Simple test script for the new endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoints() {
    try {
        console.log('🏏 Testing Cricket Scoring API Endpoints\n');

        // 1. Start a new match
        console.log('1. Starting a new match...');
        const startResponse = await axios.post(`${BASE_URL}/matches/start`, {
            teamA: 'Mumbai Indians',
            teamB: 'Chennai Super Kings',
            overs: 20,
            tossWinner: 'Mumbai Indians',
            tossDecision: 'bat'
        });
        
        const matchId = startResponse.data.matchId;
        console.log(`✅ Match started with ID: ${matchId}\n`);

        // 2. Add some commentary
        console.log('2. Adding commentary...');
        
        const commentaries = [
            {
                over: 1,
                ball: 1,
                eventType: 'run',
                runs: 4,
                description: 'Rohit Sharma drives beautifully through covers for four!',
                batsman: 'Rohit Sharma',
                bowler: 'Deepak Chahar'
            },
            {
                over: 1,
                ball: 2,
                eventType: 'dot',
                runs: 0,
                description: 'Good length ball, defended back to the bowler',
                batsman: 'Rohit Sharma',
                bowler: 'Deepak Chahar'
            },
            {
                over: 1,
                ball: 3,
                eventType: 'six',
                runs: 6,
                description: 'MASSIVE SIX! Rohit pulls it over deep mid-wicket!',
                batsman: 'Rohit Sharma',
                bowler: 'Deepak Chahar'
            }
        ];

        for (const commentary of commentaries) {
            await axios.post(`${BASE_URL}/matches/${matchId}/commentary`, commentary);
            console.log(`✅ Added: ${commentary.description}`);
        }
        console.log();

        // 3. Get match details
        console.log('3. Getting match details...');
        const matchResponse = await axios.get(`${BASE_URL}/matches/${matchId}`);
        console.log(`✅ Match: ${matchResponse.data.match.teamA} vs ${matchResponse.data.match.teamB}`);
        console.log(`✅ Commentary entries: ${matchResponse.data.totalCommentary}\n`);

        // 4. Get live matches
        console.log('4. Getting live matches...');
        const liveResponse = await axios.get(`${BASE_URL}/matches/live`);
        console.log(`✅ Live matches found: ${liveResponse.data.count}\n`);

        // 5. Update match status
        console.log('5. Updating match status to completed...');
        await axios.put(`${BASE_URL}/matches/${matchId}/status`, {
            status: 'completed',
            fullMatchJSON: {
                matchId,
                teamA: 'Mumbai Indians',
                teamB: 'Chennai Super Kings',
                runs: 185,
                wickets: 6,
                ballCount: 120,
                isInningsOver: true,
                result: 'Mumbai Indians won by 25 runs'
            }
        });
        console.log('✅ Match status updated to completed\n');

        console.log('🎉 All tests passed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Only run if this file is executed directly
if (require.main === module) {
    testEndpoints();
}

module.exports = { testEndpoints };