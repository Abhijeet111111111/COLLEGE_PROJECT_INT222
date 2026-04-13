import mongoose from "mongoose";
import bookingModel from './../models/bookingModel.js'
import tourModel from './../models/tourModel.js'
import bookedTours from './../models/bookedTours.js'
import fs from 'fs'
const MONGODB_URL = 'mongodb+srv://our-first-user:<PASSWORD>@cluster0.tr4mfiz.mongodb.net/wanderSmart'
const MONGODB_PASSWORD = 'yYyhyKXrMSOAZrUy'

const url = MONGODB_URL.replace('<PASSWORD>', MONGODB_PASSWORD);
mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }).then(() => console.log("DB connection successful"))


async function populateHotels() {
    const read = fs.readFileSync('./../ToursBooked.json', 'utf-8');
    const hotels = JSON.parse(read);
    await bookedTours.insertMany(hotels);

}
populateHotels();
