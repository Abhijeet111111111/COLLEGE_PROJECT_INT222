import express from 'express';
import path from 'path'
import { fileURLToPath } from 'url';
import fs, { stat } from 'fs';
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs')

app.use(express.static('public'))


app.get('/', (req, res) => {
    const readF = fs.readFileSync('./hotels.json');
    const readf2 = fs.readFileSync('./destinations.json');
    const destinations = JSON.parse(readf2);
    const hotelData = JSON.parse(readF);
    hotelData.sort(() => Math.random() - 0.5);
    destinations.sort(() => Math.random() - 0.5);

    res.render('home', { hotel: hotelData, destination: destinations })
})

app.get('/explore', (req, res) => {
    res.render('explorePage');
})
app.get('/explore/filter/:id', (req, res) => {
    const { id } = req.params;
    const readf2 = fs.readFileSync('./destinations.json', 'utf-8');
    const destinations = JSON.parse(readf2);

    const filteredDestinations = destinations.filter(el => {
        const cat = el.categories.map(el => el.toLowerCase());
        return cat.includes(id);
    }) || []


    res.status(200).json({
        status: 'success',
        destinations: JSON.stringify(destinations),
        filteredDestinations: JSON.stringify(filteredDestinations)
    })
})


app.listen(3000);