import express from 'express';
import { getAllTours, renderTours, getTourById,handleTourBooking } from '../controllers/tourControllers.js';
const router = express.Router();


router.get('/', renderTours)

router.get('/alltours', getAllTours)

router.get('/:id', getTourById)

router.post('/:id/book',handleTourBooking)




export default router