import fs from 'fs';
import hotelModel from './../models/hotelModel.js'

export function getDestination(req, res) {
    const { id } = req.params;
    console.log(id);
    const readF = fs.readFileSync('./destinations.json', 'utf-8');
    const destinationArray = JSON.parse(readF);
    const destination = destinationArray.filter(el => el.id === id);
    res.status(200).json({
        status: 'success',
        destination: JSON.stringify(destination)
    })
}

export async function getHotelDetails(req, res) {
    const hotels = await hotelModel.find({ "location.city": req.query.city });
    res.json({ hotels: JSON.stringify(hotels) })
}

export async function renderHotelDetails(req, res) {
    res.render('hotelDetails')
}