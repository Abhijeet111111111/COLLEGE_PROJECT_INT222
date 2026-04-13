import express from 'express';
import bookingControllers from './../controllers/bookingControllers.js'
const router = express.Router();

router.get('/hotel/:email', bookingControllers.getBookedHotels)
router.get('/tours/:email',bookingControllers.getBookedTours)

export default router