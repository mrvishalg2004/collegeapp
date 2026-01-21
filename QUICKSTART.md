# Quick Start Guide

## Get the Project Running in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Backend Server
Open a terminal and run:
```bash
npm run backend
```

You should see:
```
🚀 Server running on http://0.0.0.0:3000
```

### Step 3: Start the Frontend (in a new terminal)
```bash
npm start
```

You should see the Expo CLI interface with options to:
- Press `a` - Open on Android
- Press `i` - Open on iOS
- Press `w` - Open on Web
- Scan QR code with Expo Go app on your phone

---

## Alternative: Use the Startup Script

For convenience, you can use the provided startup script that runs both servers:

```bash
./start.sh
```

This script will:
1. Install dependencies if needed
2. Start the backend API server
3. Start the Expo frontend
4. Show status of both servers

Press `Ctrl+C` to stop both servers.

---

## Verify Everything is Working

### Check Backend
Open your browser to http://localhost:3000

You should see: "College Event Management API is Running"

### Check Frontend
The Expo CLI will show:
- Metro Bundler running on http://localhost:8081
- QR code to scan with Expo Go app
- Options to run on different platforms

---

## Testing the App

1. **On Physical Device:**
   - Install "Expo Go" app from App Store (iOS) or Play Store (Android)
   - Scan the QR code shown in the terminal
   - The app will load on your device

2. **On Web Browser:**
   - Press `w` in the Expo CLI
   - The app will open in your default browser

3. **On Emulator/Simulator:**
   - Make sure you have Android Studio (for Android) or Xcode (for iOS) installed
   - Press `a` for Android or `i` for iOS in the Expo CLI

---

## Default Login Credentials

**Admin Account:**
- Email: admin@gmail.com
- Password: admin@gmail.com

This account is automatically created when the backend starts for the first time.

---

## Common Issues

### Port Already in Use
If you see "Port 3000 is already in use":
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Error
If you see MongoDB connection errors, this is expected if you don't have access to the MongoDB Atlas database. The server will still run and you can use local testing.

### Expo Cache Issues
If the app won't load properly:
```bash
npx expo start -c
```
This clears the Metro cache.

---

## Need Help?

- Check the full [README.md](README.md) for detailed documentation
- Contact: vishal.road2tech@gmail.com
