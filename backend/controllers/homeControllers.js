import fs from 'fs';
import hotelModel from '../models/hotelModel.js'
export async function renderHomePage(req, res) {
    const hotelData = await hotelModel.find({});
    const readf2 = fs.readFileSync('destinations.json','utf-8')
    const destinations = JSON.parse(readf2);
    hotelData.sort(() => Math.random() - 0.5);
    destinations.sort(() => Math.random() - 0.5);

    res.render('home', { hotel: hotelData, destination: destinations })
}