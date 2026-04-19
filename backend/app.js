import dotenv from 'dotenv'
import express from 'express';
import path from 'path'
import { fileURLToPath } from 'url';
import cors from 'cors'
import home from './routes/home.js'
import exploreRoutes from './routes/exploreRoutes.js'
import destinationRoutes from './routes/destinationsRoutes.js'
import hotelRoutes from './routes/hotelsRoutes.js'
import tourRoutes from './routes/tourRoutes.js'
import guidesRoutes from './routes/guides.js'
import mongoose from 'mongoose';
import userRouter from './routes/userRoutes.js'
import loginRoutes from './routes/loginRoutes.js'
import userRoutes from './routes/userRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import aiPlanRoutes from './routes/aiPlanRoutes.js'
import contactRoutes from './routes/contactRoutes.js'
dotenv.config({ path: './config.env' })

const app = express();

const url = process.env.MONGODB_URL.replace('<PASSWORD>', process.env.MONGODB_PASSWORD);
mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }).then(() => console.log("DB connection successful"))



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
app.use(express.json());

app.use(express.static('public'))

app.use(cors({
    origin: "http://127.0.0.1:5500"
}));


app.use('/', home)
app.use('/plan-trip', aiPlanRoutes);
app.use('/explore', exploreRoutes);
app.use('/destinations', destinationRoutes)
app.use('/hotels', hotelRoutes)
app.use('/tours', tourRoutes);
app.use('/guides', guidesRoutes)
app.use('/users', userRouter)
app.use('/login', loginRoutes);
app.use('/user', userRoutes)
app.get('/dashboard', (req, res) => {
    res.render('dashboard')
})

app.use('/bookings', bookingRoutes)
app.use('/contact', contactRoutes)
app.get('/about', (req, res) => {
    res.render('about')
})

app.use((req, res) => {
    res.status(404).json({ error: true, message: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, next) => {
    let error = { ...err };
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error'
    res.status(err.statusCode || 500).json({
        message: err.message,
        status: err.status,
        error: err,
        errStack: err.stack
    })
})

const port = process.env.PORT || 3000;
app.listen(port);