# WanderSmart Travel Booking Project

A full-stack travel booking application built with Node.js, Express, MongoDB, and EJS. This project provides a travel portal with hotel and destination browsing, tour booking, user authentication, contact support, and AI-powered trip planning.

## Project Overview

The backend is built in the `backend/` folder and serves dynamic EJS pages plus APIs for:
- Homepage with hotels and destinations
- Explore destinations and tours
- Hotels listing and hotel details
- User sign-up, login, and authentication
- Booking creation and management
- Contact support email
- AI-based trip planning route

There is also a static frontend section under `Frontend/` containing additional HTML and CSS pages.

## Backend Highlights

- `backend/routes/home.js` defines the homepage route `/`
- `backend/controllers/homeControllers.js` fetches hotel records from MongoDB and destination data from `destinations.json`
- Homepage content is randomized on each load
- Uses EJS to inject hotel and destination data into `backend/views/home.ejs`
- `backend/app.js` sets up middleware, static assets, CORS, and database connection

## Technologies Used

- Node.js
- Express 5
- MongoDB with Mongoose
- EJS templating engine
- dotenv for environment configuration
- bcrypt for password hashing
- jsonwebtoken for authentication
- cors for cross-origin support
- nodemailer for email
- Google generative AI SDKs for AI planning routes
- validator for input validation

## Project Structure

```text
COLLEGE_PROJECT_INT222/
├── Frontend/                           # Frontend HTML, CSS, and JS files
│   ├── articleDestination.html
│   ├── articleFeaturedHotel.html
│   ├── dialog.html
│   ├── explorePage.html
│   ├── explorePage.css
│   ├── home.html
│   ├── home.css
│   ├── home1.html
│   ├── home1.css
│   ├── hoteldetail.html
│   ├── hotelsPage.html
│   ├── hotels.css
│   ├── hotels.js
│   ├── howToReach.html
│   ├── nav-auth.css
│   └── tabItenerary.html
│
└── backend/                            # Express.js Backend Application
    ├── app.js                          # Main application entry point
    ├── package.json                    # Dependencies & scripts
    ├── .env                            # Environment variables
    │
    ├── controllers/                    # Route handlers and business logic
    │   ├── authController.js
    │   ├── bookingControllers.js
    │   ├── destinationControllers.js
    │   ├── exploreControllers.js
    │   ├── guideControllers.js
    │   ├── handlerFactory.js
    │   ├── homeControllers.js
    │   ├── hotelControllers.js
    │   ├── loginControllers.js
    │   ├── tourControllers.js
    │   └── userControllers.js
    │
    ├── models/                         # Mongoose database models
    │   ├── bookedTours.js
    │   ├── bookingModel.js
    │   ├── hotelModel.js
    │   ├── tourModel.js
    │   └── userModel.js
    │
    ├── routes/                         # API route definitions
    │   ├── aiPlanRoutes.js             # AI Trip Planner integration
    │   ├── bookingRoutes.js
    │   ├── destinationsRoutes.js
    │   ├── exploreRoutes.js
    │   ├── guides.js
    │   ├── home.js
    │   ├── hotelsRoutes.js
    │   ├── loginRoutes.js
    │   ├── tourRoutes.js
    │   └── userRoutes.js
    │
    ├── utils/                          # Utility functions and seed scripts
    │   ├── appError.js
    │   ├── catchAsync.js
    │   ├── seedBookings.js
    │   ├── seedHotels.js
    │   ├── sendMail.js                 # Email sending functionality
    │   └── sortHotels.js
    │
    ├── views/                          # EJS view templates
    │   ├── dashboard.ejs
    │   ├── explorePage.ejs
    │   ├── home.ejs
    │   ├── hotelDetails.ejs
    │   ├── hotelsPage.ejs
    │   ├── login.ejs
    │   ├── planTrip.ejs
    │   └── tours.ejs
    │
    └── public/                         # Static assets for EJS views
        ├── auth.js
        ├── dashboard.js
        ├── home.js
        ├── ... (CSS stylesheets)
        └── ... (Image assets)
```

## Setup Instructions

### Prerequisites
- **Node.js** installed on your machine.
- **MongoDB** instance (local or Atlas) for the database.

### Installation & Execution

1. **Navigate to the project folder:**
   ```bash
   cd COLLEGE_PROJECT_INT222
   ```

2. **Navigate to the Backend Directory:**
   ```bash
   cd backend
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Environment Variables Configuration:**
   Create an `.env` file in the `backend` directory and configure the following required environment variables:
   ```env
   MONGODB_URL=<your-mongodb-atlas-url>
   MONGODB_LOCAL=mongodb://localhost:27017
   MONGODB_PASSWORD=<your-mongodb-password>

   JWT_EXPIRES_IN=90d
   JWT_SECRET=<your-jwt-secret>

   EMAILUSER=<your-mailtrap-user>
   EMAILPORT=2525
   EMAILHOST=sandbox.smtp.mailtrap.io
   EMAILPASSWORD=<your-mailtrap-password>

   COOKIE_EXP_DATE=90
   UNSPLASH_ACCESS_KEY=<your-unsplash-access-key>

   GEMINI_API_KEY=<your-gemini-api-key>
   ```

5. **Start the Application:**
   ```bash
   npm start
   ```

6. **Access the Application:**
   Once the server is running, you can access the application through your web browser (check the terminal console for the exact `localhost` port, which is typically `http://localhost:3000`).
