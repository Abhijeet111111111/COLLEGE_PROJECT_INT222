import mongoose from "mongoose";

const itinerarySchema = new mongoose.Schema(
    {
        day: String,
        place: String
    },
    { _id: false }
);

const tourSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            unique: true
        },

        title: {
            type: String,
            required: true
        },

        category: String,

        badge_color: String,
        thumb_color: String,

        days: Number,
        nights: Number,

        rating: {
            type: Number,
            default: 0
        },

        reviews: {
            type: Number,
            default: 0
        },

        price: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            default: "INR"
        },

        description: String,

        itinerary: [itinerarySchema],

        includes: [
            {
                type: String
            }
        ],

        difficulty: {
            type: String,
            enum: ["Easy", "Moderate", "Hard","Moderate–Hard"]
        },

        available: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

const Tour = mongoose.model("Tour", tourSchema);

export default Tour;