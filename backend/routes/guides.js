import express from 'express';
import { getAllGuides } from '../controllers/guideControllers.js';
const router = express.Router();


router.get('/', getAllGuides)

export default router