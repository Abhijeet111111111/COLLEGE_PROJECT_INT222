import express from 'express';
import { getDestination, renderHotelDetails, getHotelDetails } from './../controllers/destinationControllers.js'
const router = express.Router();

router.get('/hotels', renderHotelDetails)
router.get('/api/hotels', getHotelDetails)
router.get('/:id', getDestination)


export default router