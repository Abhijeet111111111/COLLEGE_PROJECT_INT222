WanderSmart Travel Booking Project

A full-stack travel booking application built with Node.js, Express, MongoDB, and EJS. This project provides a travel portal with hotel and destination browsing, tour booking, user authentication, contact support, and AI-powered trip planning.

 Project Overview

The backend is built in the `backend/` folder and serves dynamic EJS pages plus APIs for:
- Homepage with hotels and destinations
- Explore destinations and tours
- Hotels listing and hotel details
- User sign-up, login, and authentication
- Booking creation and management
- Contact support email
- AI-based trip planning route

There is also a static frontend section under `backend/Frontend/` containing additional HTML and CSS pages.

Key Folder Structure

- `backend/app.js` - Express server entry point
- `backend/routes/` - route definitions for homepage, explore, destinations, hotels, tours, guides, login, users, bookings, and contact
- `backend/controllers/` - controller logic for rendering pages and handling requests
- `backend/models/` - Mongoose schemas for hotels, tours, bookings, users, etc.
- `backend/views/` - EJS templates for server-rendered pages
- `backend/public/` - static assets (CSS, JS, images)
- `backend/Frontend/` - extra static HTML/CSS pages for the frontend
- JSON data files like `destinations.json`, `hotels.json`, and `tours.json`

 Backend Highlights

- `backend/routes/home.js` defines the homepage route `/`
- `backend/controllers/homeControllers.js` fetches hotel records from MongoDB and destination data from `destinations.json`
- Homepage content is randomized on each load
- Uses EJS to inject hotel and destination data into `backend/views/home.ejs`
- `backend/app.js` sets up middleware, static assets, CORS, and database connection

 Technologies Used

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

 Setup Instructions

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `config.env` file in `backend/` with the required environment variables.
4. Start the server:
   ```bash
   npm start
   ```
5. Open the app in your browser at the configured host and port (default is `http://localhost:3000`).

Environment Variables

The backend relies on environment values in `backend/config.env`. Important variables include:

- `MONGODB_URL`
- `MONGODB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `EMAILUSER`
- `EMAILPASSWORD`
- `EMAILHOST`
- `EMAILPORT`
- `UNSPLASH_ACCESS_KEY`
- `GEMINI_API_KEY`
- `GMAIL`
- `GMAIL_PASSWORD`

 PROJECT STRUCTURE 
 COLLEGE_PROJECT_INT222/
COLLEGE_PROJECT_INT222/

├── a.txt
├── backend/                    # Node.js/Express Backend
│   ├── app.js                  # Main Express app
│   ├── config.env              # Environment config
│   ├── package.json            # Dependencies
│   ├── destinations.json       # Destination data
│   ├── destinations1.json
│   ├── hotelGuests.json        # Hotel booking records
│   ├── hotels.json             # Hotels data
│   ├── ToursBooked.json        # Tour bookings
│   ├── tours.json              # Tours data
│   ├── test_models.js
│   │
│   ├── controllers/            # Route handlers
│   │   ├── authController.js
│   │   ├── bookingControllers.js
│   │   ├── destinationControllers.js
│   │   ├── exploreControllers.js
│   │   ├── guideControllers.js
│   │   ├── handlerFactory.js
│   │   ├── homeControllers.js
│   │   ├── hotelControllers.js
│   │   ├── loginControllers.js
│   │   ├── tourControllers.js
│   │   └── userControllers.js
│   │
│   ├── models/                 # Mongoose schemas
│   │   ├── bookedTours.js
│   │   ├── bookingModel.js
│   │   ├── hotelModel.js
│   │   ├── tourModel.js
│   │   └── userModel.js
│   │
│   ├── routes/                # API routes
│   │   ├── aiPlanRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── destinationsRoutes.js
│   │   ├── exploreRoutes.js
│   │   ├── guides.js
│   │   ├── home.js
│   │   ├── hotelsRoutes.js
│   │   ├── loginRoutes.js
│   │   ├── tourRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── public/                 # Static assets & frontend
│   │   ├── *.css               # Stylesheets
│   │   ├── *.js                # Client-side JS
│   │   ├── destinations/       # Destination images
│   │   ├── hotels/            # Hotel images
│   │   └── topAttractions/     # Attraction images
│   │
│   ├── views/                  # EJS templates
│   │   ├── about.ejs
│   │   ├── contact.ejs
│   │   ├── dashboard.ejs
│   │   ├── explorePage.ejs
│   │   ├── forgotPassword.ejs
│   │   ├── home.ejs
│   │   ├── hotelDetails.ejs
│   │   ├── hotelsPage.ejs
│   │   ├── login.ejs
│   │   ├── planTrip.ejs
│   │   ├── resetPassword.ejs
│   │   └── tours.ejs
│   │
│   └── utils/                  # Helper modules
│       ├── appError.js
│       ├── catchAsync.js
│       ├── seedBookings.js
│       ├── seedHotels.js
│       ├── sendMail.js
│       └── sortHotels.js
│
└── Frontend/                   # Static HTML frontend
    ├── *.html                  # Page templates
    ├── *.css                   # Styles
    ├── *.js                    # Scripts
    └── a.json 

- The homepage uses the `home` route and the `renderHomePage` controller to combine database hotel data with destination JSON data.
- Static frontend pages are available in `backend/Frontend/` but the main application uses server-rendered EJS views from `backend/views/`.
- CORS is configured to allow requests from `http://127.0.0.1:5500` by default.
