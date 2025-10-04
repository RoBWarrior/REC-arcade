# Team RECursion - Coding Club Portal

A comprehensive React.js + Vite website for a college coding club featuring online games, leaderboards, events management, and admin functionality.

## 🚀 Features

### Core Features
- **Login System**: Username and college registration number validation (format: 22U10999 or 22EE8999)
- **Two Online Games**:
  - Snake Game with score tracking
  - Reaction Time Tester with score tracking
- **Leaderboards**: Real-time leaderboards for online games and offline events
- **Events Dashboard**: Upcoming events with full CRUD functionality
- **Admin Panel**: Manage offline scores and events (password: admin123)
- **User Profiles**: Personal stats, achievements, and game history
- **Dark Theme UI**: Modern dark interface with custom fonts and animations

### Additional Features
- **Achievement System**: Unlock achievements based on performance
- **Responsive Design**: Works on desktop and mobile devices
- **Demo Mode**: Works without Firebase setup using local storage
- **User Session Management**: Persistent login with localStorage
- **Real-time Updates**: Dynamic leaderboard updates
- **Game Statistics**: Detailed user performance tracking

## 🛠️ Tech Stack

- **Frontend**: React.js 19 + Vite 7
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Database**: Firebase Firestore (with demo mode)
- **State Management**: React Hooks
- **Build Tool**: Vite

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rechase
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔥 Firebase Setup (Optional)

The application works in demo mode by default. To enable Firebase:

1. **Create a Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database

2. **Get Firebase configuration**
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click "Add app" and select Web
   - Copy the configuration object

3. **Update Firebase config**
   - Open `src/config/firebase.js`
   - Replace the demo config with your actual Firebase config
   - Set `DEMO_MODE = false`

4. **Configure Firestore rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true; // For demo purposes
       }
     }
   }
   ```

## 🎮 How to Use

### For Students
1. **Login**: Use any username and a valid registration number (e.g., 22U10999)
2. **Play Games**: Navigate to Games tab and choose Snake or Reaction Tester
3. **Submit Scores**: Enter your name when prompted after game over
4. **View Leaderboards**: Check your ranking on the Leaderboard tab
5. **Check Events**: See upcoming events and workshops
6. **View Profile**: Track your stats and achievements

### For Admins
1. **Login**: Use any username and registration number
2. **Admin Access**: Go to Admin tab and enter password: `admin123`
3. **Manage Offline Scores**: Add scores from offline competitions
4. **Manage Events**: Add, edit, or delete club events

## 🎯 Game Rules

### Snake Game
- Use arrow keys to control the snake
- Eat red food to grow and score points (10 points per food)
- Avoid hitting walls or your own body
- Game ends on collision

### Reaction Tester
- Wait for the red box to turn green
- Click as fast as possible when it turns green
- Don't click too early or you'll fail
- 5 rounds total, score based on reaction time
- Faster reactions = higher scores

## 🏆 Achievement System

- **First Steps**: Play your first game
- **Snake Master**: Score 100+ in Snake Game
- **Lightning Reflexes**: Score 3000+ in Reaction Tester
- **Regular Player**: Play 10 games
- **Consistent Performer**: Average score above 1000

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🎨 Customization

### Colors and Theme
- Primary: Green (#00ff88)
- Secondary: Emerald (#00cc66)
- Accent: Various colors for different sections
- Background: Dark gradient

### Fonts
- Primary: JetBrains Mono
- Headers: Orbitron
- Fallback: Courier New

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/
│   ├── auth/          # Login components
│   ├── games/         # Game components
│   ├── layout/        # Header, Footer
│   ├── modals/        # Modal components
│   └── tabs/          # Tab components
├── config/            # Firebase configuration
├── services/          # Firebase services
└── App.jsx           # Main application
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure redirects for SPA routing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Created for Team RECursion - Coding Club

## 🆘 Support

For support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Happy Coding! 🚀**