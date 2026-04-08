import express from 'express';
import path from 'path'
import { fileURLToPath } from 'url';
import fs, { readFileSync, stat } from 'fs';
import cors from 'cors'
import home from './routes/home.js'
import exploreRoutes from './routes/exploreRoutes.js'
import destinationRoutes from './routes/destinationsRoutes.js'
import hotelRoutes from './routes/hotelsRoutes.js'
import tourRoutes from './routes/tourRoutes.js'
import guidesRoutes from './routes/guides.js'
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')
app.use(express.json());

app.use(express.static('public'))

app.use(cors({
    origin: "http://127.0.0.1:5500"
}));


app.use('/', home)
app.use('/explore', exploreRoutes);
app.use('/destinations', destinationRoutes)
app.use('/hotels', hotelRoutes)
app.use('/tours', tourRoutes);
app.use('/guides', guidesRoutes)

app.use((req, res) => {
    res.status(404).json({ error: true, message: `Route ${req.method} ${req.path} not found` });
});


app.listen(3000);