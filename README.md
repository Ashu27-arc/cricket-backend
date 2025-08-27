# 🏏 Cricket Backend API

Node.js Express server with MongoDB for cricket scoring system with real-time WebSocket updates.

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

### Matches
- `POST /api/matches` - Create match
- `GET /api/matches` - List matches
- `GET /api/matches/:id` - Get match
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match

### WebSocket Events
- `join-match` - Join match room
- `leave-match` - Leave match room
- `match-update` - Live score updates
- `over-completed` - Over summaries
- `innings-ended` - Innings end

## 🗄️ Database Schema

```javascript
{
  teamA: String,
  teamB: String,
  batting: String,
  overs: Number,
  runs: Number,
  wickets: Number,
  ballCount: Number,
  isInningsOver: Boolean,
  fullMatchJSON: Object, // Complete match state
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Commentary System

Automatic commentary generation for:
- Ball scoring (0-6 runs)
- Wickets and dismissals
- Extras (wide, no-ball, bye, leg-bye)
- Team milestones (50, 100, 150, 200)
- Over completions
- Innings endings

## 🔧 Environment Variables

```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/cricket_scoring
```

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **socket.io** - WebSocket support
- **cors** - Cross-origin requests
- **dotenv** - Environment variables
- **morgan** - HTTP logging# cricket-backend
