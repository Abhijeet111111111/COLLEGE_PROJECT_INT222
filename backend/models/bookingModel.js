import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        bookingRef: {
            type: String,
            required: true,
            unique: true
        },

        hotelId: {
            type: String,
            required: true
        },

        hotelName: String,
        hotelCity: String,
        hotelState: String,

        pricePerNight: {
            type: Number,
            required: true
        },

        nights: {
            type: Number,
            required: true
        },

        totalAmount: {
            type: Number,
            required: true
        },

        paymentMethod: {
            type: String,
            enum: ["upi", "card", "cash", "netbanking"],
            default: "upi"
        },

        guest: {
            name: String,
            email: String,
            phone: String,
            guests: String,
            checkIn: Date,
            checkOut: Date,
            requests: String
        },

        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending"
        },

        bookedAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);



export default Booking;