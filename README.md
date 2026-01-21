# College Event Management App

A full-stack mobile application built with React Native (Expo) and Node.js/Express for managing college events, registrations, and payments.

## Project Structure

```
collegeapp/
├── api/                    # Backend API (Node.js/Express)
│   ├── routes/            # API routes
│   ├── models/            # MongoDB models
│   ├── middleware/        # Auth and other middleware
│   ├── utils/             # Utility functions
│   └── index.js           # API server entry point
├── screens/               # React Native screens
├── navigation/            # Navigation configuration
├── context/               # React Context providers
├── services/              # API service calls
├── types/                 # TypeScript type definitions
├── assets/                # Images and static assets
├── App.tsx                # Main App component
├── index.ts               # Expo entry point
└── .env                   # Environment variables
```

## Prerequisites

- Node.js (v20.x or higher)
- npm or yarn
- Expo CLI (installed globally or via npx)
- MongoDB Atlas account (for database)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/mrvishalg2004/collegeapp.git
cd collegeapp
```

2. Install dependencies:
```bash
npm install
```

## Running the Project

The project consists of two parts that need to be run simultaneously:

**Note for Windows users:** The `start.sh` script and `npm run dev` command are designed for Unix-like systems (Linux/macOS). Windows users should manually run the backend and frontend in separate terminals as described below.

### 1. Start the Backend API Server

```bash
cd api
node index.js
```

The API server will start on `http://localhost:3000`

**Note:** The backend requires a MongoDB connection. Update the `MONGODB_URI` in `.env` with your MongoDB connection string.

### 2. Start the Expo Frontend

In a new terminal window:

```bash
npm start
# or
npx expo start
```

The Expo Metro Bundler will start on `http://localhost:8081`

### Running on Different Platforms

- **Android:** `npm run android` or press `a` in the Expo CLI
- **iOS:** `npm run ios` or press `i` in the Expo CLI
- **Web:** `npm run web` or press `w` in the Expo CLI

## Environment Variables

The `.env` file contains the following configuration:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT authentication
- `PORT` - Backend API port (default: 3000)
- `RAZORPAY_KEY_ID` - Razorpay payment gateway key
- `RAZORPAY_KEY_SECRET` - Razorpay payment gateway secret
- `EMAIL_SERVICE` - Email service provider
- `EMAIL_USER` - Email username
- `EMAIL_PASS` - Email password
- `BASE_URL` - Backend API base URL

## Features

- **User Management:** Admin, College, Coordinator, and Student roles
- **Event Management:** Create and manage college events
- **Registration System:** Student event registration
- **Payment Integration:** Online (Razorpay) and offline payment options
- **Certificate Generation:** Automated certificate creation
- **Email Notifications:** Event confirmations and updates
- **Authentication:** JWT-based secure authentication

## Default Admin Account

After the first run, a default admin account is created:
- **Email:** admin@gmail.com
- **Password:** admin@gmail.com

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Colleges
- `GET /api/colleges` - List all colleges
- `POST /api/colleges` - Create new college (Admin)

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event (College)
- `GET /api/events/:id` - Get event details

### Payments
- `POST /api/payments/create-order` - Create Razorpay order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/offline` - Register with offline payment

### Certificates
- `GET /api/certificates/:registrationId` - Generate certificate PDF

## Technology Stack

### Frontend
- React Native (Expo)
- React Navigation
- TypeScript
- Expo Image Picker
- Expo Secure Store
- Lucide React Native (Icons)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Razorpay Payment Gateway
- Nodemailer (Email)
- PDFKit (Certificate generation)

## Development

To run in development mode with hot reloading:

```bash
# Backend (with nodemon if installed)
cd api
nodemon index.js

# Frontend (Expo automatically handles hot reloading)
npm start
```

## Troubleshooting

### Backend won't start
- Check if MongoDB connection string is correct in `.env`
- Ensure port 3000 is not already in use
- Verify all environment variables are set

### Expo won't start
- Clear Metro cache: `npx expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for port conflicts (8081, 19000, 19001, 19002)

### Dependencies issues
```bash
npm install
npx expo install --check
```

## License

This project is private.

## Contact

For questions or support, contact: vishal.road2tech@gmail.com
