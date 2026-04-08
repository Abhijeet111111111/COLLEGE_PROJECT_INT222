import express from 'express';
import { getDestination,renderHotelDetails } from './../controllers/destinationControllers.js'
const router = express.Router();

router.get('/hotels', renderHotelDetails)
router.get('/:id', getDestination)


export default router