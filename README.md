# EventCraft - College App

## Prerequisites
- **Node.js**: Ensure Node.js is installed on your laptop (v18 or higher recommended).
- **Expo Go App**: Install the **Expo Go** app on your physical mobile phone (available on Apple App Store or Google Play Store).

## Setup Instructions

### 1. Install Dependencies
Open your terminal, navigate to the project directory, and run:
```bash
npm install
```

### 2. Environment Variables
Make sure you have a `.env` file in the root directory. If it's missing, copy the contents of `.env.example` into a new file named `.env`:
```bash
cp .env.example .env
```

### 3. Start the Backend API Server
The app needs the backend server running to handle requests (like login, fetching data).
In your terminal, run:
```bash
node api/index.js
```
*Leave this terminal window open. You should see a message saying "Server running on http://0.0.0.0:3000".*

### 4. Start the Expo Frontend App
Open a **new** terminal window in the same project directory, and start the app:
```bash
npx expo start
```
This will start the Metro Bundler and display a large QR Code in your terminal.

### 5. Run the App on your Phone
- **Crucial Step**: Make sure your phone and your laptop are connected to the **same Wi-Fi network**.
- Open the **Expo Go** app on your phone.
- Scan the QR code displayed in the terminal:
    - **On Android**: Click the "Scan QR Code" button inside the Expo Go app.
    - **On iOS**: Open your iPhone's default Camera app and point it at the QR code, then tap the Expo link that appears.

### 6. Automatic IP Address configuration
The application's connection string (`LOCAL_URL` in `services/api.ts`) is designed to **automatically fetch your laptop's current Wi-Fi IP address** via Expo. 
You do **not** need to manually update IP addresses when changing Wi-Fi networks! The app will seamlesslessly connect to your localhost backend as long as `node api/index.js` is running on your machine.
