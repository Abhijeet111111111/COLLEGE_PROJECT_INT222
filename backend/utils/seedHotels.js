import mongoose from "mongoose";
import fs from 'fs';
import dotenv from 'dotenv'
dotenv.config({ path: './config.env' })

const MONGODB_URL='mongodb+srv://our-first-user:<PASSWORD>@cluster0.tr4mfiz.mongodb.net/wanderSmart'
const MONGODB_PASSWORD = 'yYyhyKXrMSOAZrUy'

const url = MONGODB_URL.replace('<PASSWORD>',MONGODB_PASSWORD);
mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }).then(() => console.log("DB connection successful"))

const hotelSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true
        },

        location: {
            city: String,
            state: String,
            address: String,
            distanceFromCenter: String
        },

        stars: {
            type: Number,
            min: 1,
            max: 5
        },

        rating: {
            type: Number,
            default: 0
        },

        reviews: {
            type: Number,
            default: 0
        },

        pricePerNight: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            default: "INR"
        },

        category: String,

        tags: [
            {
                type: String
            }
        ],

        ecoScore: {
            type: Number,
            min: 0,
            max: 5
        },

        amenities: [
            {
                type: String
            }
        ],

        images: [
            {
                type: String
            }
        ],

        description: String,

        freeCancellation: {
            type: Boolean,
            default: false
        },

        available: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

const Hotel = mongoose.model("Hotel", hotelSchema);



async function populateHotels() {
    const read = fs.readFileSync('./../hotels.json', 'utf-8');
    const hotels = JSON.parse(read);
    await Hotel.insertMany(hotels);

}
 populateHotels();

export default Hotel;