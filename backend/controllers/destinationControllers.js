import fs from 'fs';

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

export function renderHotelDetails(req, res) {
    console.log('got your request')
    res.render('hotelDetails')
}