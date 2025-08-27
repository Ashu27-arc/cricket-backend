# 🏏 Cricket Backend API

Node.js Express server with MongoDB for cricket scoring system with real-time WebSocket updates and AI commentary generation.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI

# Start development server
npm run dev

# Start production server
npm start
```

## 📡 API Endpoints

### Match Management
- `POST /api/matches` - Create new match
- `GET /api/matches` - List all matches (recent first)
- `GET /api/matches/:id` - Get specific match by ID
- `PUT /api/matches/:id` - Update match (triggers live updates)
- `DELETE /api/matches/:id` - Delete match

### Example API Usage

#### Create Match
```bash
curl -X POST http://localhost:5000/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "fullMatchJSON": {
      "teamA": "India",
      "teamB": "Australia",
      "batting": "India",
      "overs": 20,
      "runs": 0,
      "wickets": 0
    },
    "teamA": "India",
    "teamB": "Australia",
    "batting": "India",
    "overs": 20
  }'
```

#### Get All Matches
```bash
curl http://localhost:5000/api/matches
```

#### Update Match (with live updates)
```bash
curl -X PUT http://localhost:5000/api/matches/MATCH_ID \
  -H "Content-Type: application/json" \
  -d '{
    "fullMatchJSON": { /* updated match state */ },
    "lastBall": {
      "runs": 4,
      "isWicket": false,
      "batsmanOnStrike": "Batter 1"
    }
  }'
```

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

### Client Events (Received)
- `join-match` - Join match room for live updates
- `leave-match` - Leave match room

### Server Events (Emitted)
- `match-update` - Real-time score updates with commentary
- `over-completed` - Over completion notifications
- `innings-ended` - Innings end notifications

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
  teamA: { type: String, required: true, trim: true },
  teamB: { type: String, required: true, trim: true },
  batting: { type: String, required: true, trim: true },
  overs: { type: Number, required: true },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  ballCount: { type: Number, default: 0 },
  isInningsOver: { type: Boolean, default: false },
  fullMatchJSON: { type: Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
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
NODE_ENV=development
```

For production (MongoDB Atlas):
```bash
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/cricket_scoring?retryWrites=true&w=majority
NODE_ENV=production
```

## 🏗️ Project Structure

```
cricket-backend/
├── config/
│   └── db.js                    # MongoDB connection
├── controllers/
│   └── matchController.js       # Match CRUD operations
├── models/
│   └── Match.js                 # MongoDB match schema
├── routes/
│   └── matches.js               # API route definitions
├── utils/
│   ├── commentaryGenerator.js   # AI commentary system
│   └── validateObjectId.js      # Input validation
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── package.json                 # Dependencies and scripts
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
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "socket.io": "^4.7.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "morgan": "^1.10.0"
}
```

### Development Dependencies
```json
{
  "nodemon": "^3.0.1"
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