import express from 'express';
import fs from 'fs';
import sortHotels from '../utils/sortHotels.js';
import { renderHotelPage,getCityHotel,getHotelById,searchHotel } from '../controllers/hotelControllers.js';
const router = express.Router();


router.get('/', renderHotelPage)

router.get('/:city', getCityHotel)

// fetch a single hotel by id

// router.get('/:id', getHotelById)


router.post('/search',searchHotel )

export default router