import express from 'express';
import { renderHomePage } from '../controllers/homeControllers.js';

const router = express.Router();

router.get('/', renderHomePage)

export default router