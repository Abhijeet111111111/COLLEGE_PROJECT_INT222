import fs from 'fs';

export function renderHomePage(req, res) {
    const readF = fs.readFileSync('./hotels.json');
    const readf2 = fs.readFileSync('./destinations.json');
    const destinations = JSON.parse(readf2);
    const hotelData = JSON.parse(readF);
    hotelData.sort(() => Math.random() - 0.5);
    destinations.sort(() => Math.random() - 0.5);

    res.render('home', { hotel: hotelData, destination: destinations })
}