import express from 'express';
import { renderLoginPage } from '../controllers/loginControllers.js';
const router = express.Router();


router.get('/', renderLoginPage)





export default router