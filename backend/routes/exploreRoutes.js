import express from 'express';
import { explorePage, filterDestination, searchDestination } from '../controllers/exploreControllers.js';
import fs from 'fs'
const router = express.Router();

router.get('/', explorePage)

router.get('/filter/:id', filterDestination)

router.get('/search', searchDestination)

export default router;