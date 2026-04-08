import express from 'express';
import { getAllTours, renderTours, getTourById } from '../controllers/tourControllers.js';
const router = express.Router();


router.get('/', renderTours)

router.get('/alltours', getAllTours)

router.get('/:id', getTourById)




export default router