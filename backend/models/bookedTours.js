import mongoose from "mongoose";

const travellerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    requests: String
  },
  { _id: false }
);

const tourBookingSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      required: true,
      unique: true
    },

    tourId: {
      type: String,
      required: true
    },

    tourTitle: String,
    tourCategory: String,

    days: Number,
    nights: Number,

    pricePerPerson: {
      type: Number,
      required: true
    },

    totalAmount: {
      type: Number,
      required: true
    },

    travellers: {
      type: Number,
      required: true
    },

    travelDate: {
      type: Date,
      required: true
    },

    paymentMethod: {
      type: String,
      enum: ["upi", "card", "cash", "netbanking"],
      default: "upi"
    },

    traveller: travellerSchema,

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

const TourBooking = mongoose.model("TourBooking", tourBookingSchema);

export default TourBooking;