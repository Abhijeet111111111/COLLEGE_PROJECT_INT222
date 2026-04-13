import mongoose from "mongoose";

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

export default Hotel;