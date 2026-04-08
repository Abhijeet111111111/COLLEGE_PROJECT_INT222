import express from 'express';
import fs from 'fs';
import sortHotels from '../utils/sortHotels.js';
import { renderHotelPage, getCityHotel, getHotelById, searchHotel, hotelBook } from '../controllers/hotelControllers.js';
const router = express.Router();


router.get('/', renderHotelPage)

router.get('/:city', getCityHotel)
router.get('/hotel/:id', getHotelById)
router.post('/:id/book', hotelBook)

// fetch a single hotel by id

// router.get('/:id', getHotelById)


router.post('/search', searchHotel)

export default router