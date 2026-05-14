# Bae Watch

A beautiful relationship companion app that helps couples stay connected through daily check-ins, conversation coaching, and relationship insights.

## Features

- **Relationship Weather**: Track connection levels and emotional states
- **Daily Check-ins**: Monitor partner's emotional cup fullness
- **Conversation Coach**: Get prompts for meaningful conversations
- **Memory Bank**: Store and cherish relationship memories
- **Games**: Fun activities to strengthen your bond
- **Partner Sync**: Real-time updates when both partners use the app

## Tech Stack

- React 18 with Vite
- Firebase (Auth, Firestore)
- Framer Motion for animations
- Tailwind CSS for styling

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd baewatch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication and Firestore
   - Copy your Firebase config to `.env.local`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

4. **Development**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Deploy to Vercel**
   - Push to GitHub
   - Connect to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy

## Usage

1. Sign up and complete onboarding
2. Invite your partner with a generated code
3. Start tracking your relationship weather
4. Use daily check-ins and conversation prompts
5. Build memories and play relationship games

## Contributing

This app is designed to help couples strengthen their relationships through technology. Contributions are welcome!

## License

MIT License
