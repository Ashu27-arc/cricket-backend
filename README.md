# 🏏 Cricket Backend API

Node.js Express server with MongoDB and Redis for cricket scoring system with real-time WebSocket updates, auto-incrementing match IDs, and comprehensive commentary system.

## ✨ New Features

### 🆔 Auto-Incrementing Match IDs
- **4-digit unique match IDs** starting from 1000
- **Easy sharing** and reference
- **Database-backed counter** system

### 📝 Ball-by-Ball Commentary
- **Structured commentary** with event types
- **Real-time updates** via WebSocket
- **Comprehensive event tracking** (runs, wickets, extras)

### ⚡ Redis Caching
- **Fast data retrieval** with Redis caching
- **Real-time commentary** storage
- **Graceful fallback** to MongoDB

### 🔴 Enhanced Real-time Updates
- **Match-specific rooms** for targeted updates
- **Commentary broadcasting** to all viewers
- **Status change notifications**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI and Redis URL

# Start development server
npm run dev

# Test the new endpoints
npm run test:endpoints

# Start production server
npm start
```

## 📡 Complete API Documentation

### Base URL
`http://localhost:5000/api`

### Enhanced Match Management Endpoints

#### 1. Start Match
**POST** `/matches/start`

Start a new cricket match with auto-generated 4-digit match ID.

**Request Body:**
```json
{
  "teamA": "Mumbai Indians",
  "teamB": "Chennai Super Kings", 
  "overs": 20,
  "tossWinner": "Mumbai Indians",
  "tossDecision": "bat"
}
```

**Response:**
```json
{
  "success": true,
  "matchId": "1001",
  "match": {
    "matchId": "1001",
    "teamA": "Mumbai Indians",
    "teamB": "Chennai Super Kings",
    "status": "live",
    "fullMatchJSON": {...}
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/matches/start \
  -H "Content-Type: application/json" \
  -d '{
    "teamA": "Mumbai Indians",
    "teamB": "Chennai Super Kings",
    "overs": 20,
    "tossWinner": "Mumbai Indians",
    "tossDecision": "bat"
  }'
```

#### 2. Add Commentary
**POST** `/matches/:id/commentary`

Add ball-by-ball commentary for a specific match.

**Request Body:**
```json
{
  "over": 1,
  "ball": 1,
  "eventType": "four",
  "runs": 4,
  "description": "Beautiful cover drive for four!",
  "batsman": "Rohit Sharma",
  "bowler": "Deepak Chahar",
  "extras": {
    "wide": 0,
    "noBall": 0,
    "bye": 0,
    "legBye": 0
  }
}
```

**Event Types:**
- `run` - Regular runs
- `wicket` - Wicket taken
- `wide` - Wide ball
- `no-ball` - No ball
- `bye` - Bye runs
- `leg-bye` - Leg bye runs
- `dot` - Dot ball
- `four` - Boundary (4 runs)
- `six` - Six runs
- `maiden` - Maiden over

**Response:**
```json
{
  "success": true,
  "commentary": {
    "matchId": "1001",
    "over": 1,
    "ball": 1,
    "eventType": "four",
    "runs": 4,
    "description": "Beautiful cover drive for four!",
    "timestamp": "2025-08-27T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/matches/1001/commentary \
  -H "Content-Type: application/json" \
  -d '{
    "over": 1,
    "ball": 1,
    "eventType": "four",
    "runs": 4,
    "description": "Beautiful cover drive for four!",
    "batsman": "Rohit Sharma",
    "bowler": "Deepak Chahar"
  }'
```

#### 3. Get Match Details
**GET** `/matches/:id`

Get complete match information including commentary.

**Response:**
```json
{
  "success": true,
  "match": {
    "matchId": "1001",
    "teamA": "Mumbai Indians",
    "teamB": "Chennai Super Kings",
    "status": "live",
    "runs": 45,
    "wickets": 2,
    "fullMatchJSON": {...}
  },
  "commentary": [
    {
      "over": 1,
      "ball": 1,
      "eventType": "four",
      "runs": 4,
      "description": "Beautiful cover drive for four!"
    }
  ],
  "totalCommentary": 15
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/matches/1001
```

#### 4. Get Live Matches
**GET** `/matches/live`

Get all currently live matches.

**Response:**
```json
{
  "success": true,
  "matches": [
    {
      "matchId": "1001",
      "teamA": "Mumbai Indians",
      "teamB": "Chennai Super Kings",
      "status": "live",
      "runs": 45,
      "wickets": 2
    }
  ],
  "count": 1
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/matches/live
```

#### 5. Update Match Status
**PUT** `/matches/:id/status`

Update match status (upcoming, live, completed).

**Request Body:**
```json
{
  "status": "completed",
  "fullMatchJSON": {...}
}
```

**Response:**
```json
{
  "success": true,
  "match": {
    "matchId": "1001",
    "status": "completed",
    ...
  }
}
```

### Legacy Endpoints (Backward Compatibility)
- `POST /api/matches` - Create new match (legacy)
- `GET /api/matches/all` - List all matches (recent first)
- `PUT /api/matches/:id` - Update match (triggers live updates)
- `DELETE /api/matches/:id` - Delete match

### Error Responses

All endpoints return consistent error format:
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (missing required fields)
- `404` - Not Found (match doesn't exist)
- `500` - Internal Server Error

## 🔌 WebSocket Events

### Server Setup
```javascript
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});
```

### Client Events (Send to Server)
- `join-match` - Join match room for live updates
- `leave-match` - Leave match room
- `join-live-matches` - Join live matches room
- `leave-live-matches` - Leave live matches room

### Server Events (Receive from Server)
- `match-started` - New match started notification
- `commentary-update` - Real-time commentary updates
- `match-status-update` - Match status changes
- `joined-match` - Confirmation of joining match room

### Match ID System
- **Auto-incrementing 4-digit match IDs** starting from 1000
- **Unique across all matches**
- **Easy reference and sharing**

### Redis Caching Features
- **Match data cached** for 1 hour
- **Commentary cached** as lists for quick retrieval
- **Automatic cache invalidation** on updates
- **Graceful fallback** to MongoDB if Redis unavailable

### WebSocket Usage Example
```javascript
// Client joins match room
socket.emit('join-match', matchId);

// Server sends live updates
socket.on('match-update', (data) => {
  console.log(data.match);      // Updated match data
  console.log(data.commentary); // Generated commentary
  console.log(data.lastBall);   // Latest ball info
});
```

## 🗄️ Database Schema

### Match Model
```javascript
const MatchSchema = new Schema({
  matchId: { type: String, unique: true, required: true, index: true }, // 4-digit unique ID
  teamA: { type: String, required: true, trim: true },
  teamB: { type: String, required: true, trim: true },
  batting: { type: String, required: true, trim: true },
  overs: { type: Number, required: true },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  ballCount: { type: Number, default: 0 },
  isInningsOver: { type: Boolean, default: false },
  status: { type: String, enum: ['upcoming', 'live', 'completed'], default: 'upcoming' },
  fullMatchJSON: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

### Commentary Model
```javascript
const CommentarySchema = new Schema({
  matchId: { type: String, required: true, index: true },
  over: { type: Number, required: true },
  ball: { type: Number, required: true },
  eventType: { type: String, required: true, enum: ['run', 'wicket', 'wide', 'no-ball', 'bye', 'leg-bye', 'dot', 'four', 'six', 'maiden'] },
  runs: { type: Number, default: 0 },
  description: { type: String, required: true },
  batsman: { type: String },
  bowler: { type: String },
  extras: { wide: Number, noBall: Number, bye: Number, legBye: Number },
  wicketDetails: { type: String, fielder: String },
  timestamp: { type: Date, default: Date.now }
});
```

### Counter Model (Auto-incrementing IDs)
```javascript
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 1000 } // Start from 1000 for 4-digit IDs
});
```

### Database Indexes
```javascript
MatchSchema.index({ createdAt: -1 });
MatchSchema.index({ teamA: 1, teamB: 1 });
MatchSchema.index({ updatedAt: -1 });
```

## 🎯 Commentary System

### Automatic Commentary Generation

The backend generates intelligent commentary for:
- **Ball scoring**: Different templates for 0, 1, 2, 3, 4, 6 runs
- **Wickets**: Dramatic wicket announcements
- **Extras**: Specific commentary for wides, no-balls, byes, leg-byes
- **Milestones**: Team 50s, 100s, 150s, 200s
- **Over summaries**: End of over statistics
- **Innings endings**: Final score announcements

### Commentary Templates
```javascript
const commentaryTemplates = {
  runs: {
    0: ["Dot ball! {bowler} keeps it tight", "No run there"],
    4: ["FOUR! Beautiful shot by {batsman}!", "What a boundary!"],
    6: ["SIX! What a shot by {batsman}!", "MAXIMUM! Into the stands!"]
  },
  wicket: [
    "WICKET! {batsman} is out! What a breakthrough!",
    "OUT! {batsman} has to go back to the pavilion"
  ],
  milestones: {
    team50: "FIFTY up for {team}! Good start to the innings",
    team100: "HUNDRED up for {team}! Solid batting display"
  }
};
```

### Commentary Generation Function
```javascript
function generateCommentary(ballData, matchState) {
  const { runs, isWicket, extra, batsmanOnStrike } = ballData;
  
  let commentary = "";
  
  if (isWicket) {
    const template = commentaryTemplates.wicket[Math.floor(Math.random() * commentaryTemplates.wicket.length)];
    commentary = template.replace('{batsman}', batsmanOnStrike);
  } else if (extra) {
    // Handle extras commentary
  } else {
    const runTemplates = commentaryTemplates.runs[runs];
    const template = runTemplates[Math.floor(Math.random() * runTemplates.length)];
    commentary = template.replace('{batsman}', batsmanOnStrike);
  }
  
  return {
    text: commentary,
    timestamp: new Date().toISOString(),
    ballNumber: matchState.ballCount + 1,
    over: Math.floor(matchState.ballCount / 6) + 1
  };
}
```

## 🔧 Environment Variables

Create `.env` file in backend root:
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/cricket_scoring
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

For production:
```bash
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cricket_scoring?retryWrites=true&w=majority
REDIS_URL=redis://username:password@redis-host:6379
NODE_ENV=production
```

## 🔴 Redis Integration

### Features
- **Match Caching**: Fast retrieval of match data
- **Commentary Caching**: Real-time commentary storage
- **Auto-expiration**: Automatic cache cleanup
- **Fallback**: Graceful degradation if Redis unavailable

### Redis Usage
```javascript
// Cache match data
await redisClient.setEx(`match:${matchId}`, 3600, JSON.stringify(match));

// Cache commentary
await redisClient.lPush(`commentary:${matchId}`, JSON.stringify(commentary));

// Retrieve cached data
const cachedMatch = await redisClient.get(`match:${matchId}`);
```

## 🏗️ Project Structure

```
cricket-backend/
├── config/
│   ├── db.js                    # MongoDB connection
│   └── redis.js                 # Redis connection
├── controllers/
│   ├── matchController.js       # Legacy match operations
│   └── enhancedMatchController.js # Enhanced match & commentary
├── models/
│   ├── Match.js                 # MongoDB match schema
│   ├── Commentary.js            # Commentary schema
│   └── Counter.js               # Auto-increment counter
├── routes/
│   └── matches.js               # API route definitions
├── utils/
│   ├── commentaryGenerator.js   # AI commentary system
│   ├── matchIdGenerator.js      # Auto-increment match IDs
│   └── validateObjectId.js      # Input validation
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── test-endpoints.js            # API testing script
├── package.json                 # Dependencies and scripts
├── README.md                    # Complete documentation with API reference
└── server.js                    # Main server file
```

## 🔒 Security Features

- **Input Validation**: All API endpoints validate input data
- **MongoDB Injection Protection**: Using Mongoose ODM
- **CORS Configuration**: Controlled cross-origin requests
- **Error Handling**: Secure error responses without sensitive data
- **ObjectId Validation**: Proper MongoDB ObjectId validation

## 📦 Dependencies

### Core Dependencies
```json
{
  "express": "^5.1.0",
  "mongoose": "^8.18.0",
  "socket.io": "^4.8.1",
  "redis": "^4.6.13",
  "cors": "^2.8.5",
  "dotenv": "^17.2.1",
  "morgan": "^1.10.1"
}
```

### Development Dependencies
```json
{
  "nodemon": "^3.1.10",
  "axios": "^1.6.0"
}
```

## 🚀 Deployment

### Local Development
```bash
# Start MongoDB (if local)
mongod

# Start backend server
npm run dev
```

### Production Deployment (Heroku)
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create cricket-backend-app

# Set environment variables
heroku config:set MONGO_URI=mongodb+srv://...
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Environment Setup
1. **MongoDB Atlas**: Create cluster and get connection string
2. **Environment Variables**: Set MONGO_URI and PORT
3. **CORS Origins**: Update allowed origins for production
4. **Error Monitoring**: Add Sentry or similar service

## 🐛 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```bash
# Check MongoDB status (local)
sudo systemctl status mongod

# Test connection
mongo "mongodb://localhost:27017/cricket_scoring"
```

#### Port Already in Use
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID> /F
```

#### WebSocket Connection Issues
- Verify CORS origins include frontend URL
- Check firewall settings allow WebSocket connections
- Ensure Socket.IO versions match between client/server

### Debug Mode
```bash
# Enable debug logging
DEBUG=cricket:* npm run dev

# MongoDB debugging
DEBUG=mongoose:* npm run dev

# Socket.IO debugging
DEBUG=socket.io:* npm run dev
```

## 📊 API Response Examples

### Success Response
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "teamA": "India",
  "teamB": "Australia",
  "batting": "India",
  "runs": 45,
  "wickets": 2,
  "overs": 20,
  "ballCount": 30,
  "isInningsOver": false,
  "fullMatchJSON": { /* complete match state */ },
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:30:00Z"
}
```

### Error Response
```json
{
  "message": "Invalid match ID format",
  "status": 400
}
```

### Live Update Event
```json
{
  "match": { /* updated match object */ },
  "commentary": {
    "text": "FOUR! Beautiful shot by Batter 1!",
    "timestamp": "2024-01-01T10:30:00Z",
    "ballNumber": 31,
    "over": 6,
    "ballInOver": 1
  },
  "lastBall": {
    "runs": 4,
    "isLegal": true,
    "isWicket": false,
    "batsmanOnStrike": "Batter 1"
  }
}
```

## 🔄 API Workflow

### Typical Match Flow
1. **Create Match**: `POST /api/matches` with initial setup
2. **Join Live Room**: WebSocket `join-match` event
3. **Update Match**: `PUT /api/matches/:id` for each ball
4. **Receive Updates**: WebSocket `match-update` events
5. **Complete Match**: Final update with match completion

### Live Commentary Flow
1. Ball data received via PUT request
2. Commentary generated based on ball type
3. WebSocket event emitted to all room members
4. Frontend receives and displays commentary

## 📈 Performance Considerations

- **Database Indexing**: Indexes on frequently queried fields
- **Connection Pooling**: MongoDB connection pooling enabled
- **Memory Management**: Proper cleanup of WebSocket connections
- **Rate Limiting**: Consider adding rate limiting for production
- **Caching**: Redis caching for frequently accessed data

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/backend-feature`
3. Make changes with proper error handling
4. Test API endpoints thoroughly
5. Update documentation if needed
6. Submit pull request

---

**Backend API ready for cricket scoring with real-time updates!** ⚾🚀