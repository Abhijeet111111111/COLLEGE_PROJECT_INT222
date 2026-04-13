
import bookingModel from '../models/bookingModel.js'
import bookedTours from '../models/bookedTours.js'

const getBookedHotels = async (req, res) => {
    const bookings = await bookingModel.find({
        "guest.email": req.params.email
    });

    res.json(bookings)

}


const getBookedTours = async (req, res) => {
    const bookings = await bookedTours.find({
        "traveller.email": req.params.email
    });

    res.json(bookings)
}

export default {
    getBookedHotels,
    getBookedTours
}