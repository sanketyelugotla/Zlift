const mongoose = require("mongoose");

// Reusable schema for business hours
const timeSchema = {
    open: {
        type: String,
        default: "09:00",
    },
    close: {
        type: String,
        default: "17:00",
    },
    isClosed: {
        type: Boolean,
        default: false,
    },
};

const outletSchema = new mongoose.Schema(
    {
        partnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Partner",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            coordinates: {
                latitude: { type: Number },
                longitude: { type: Number },
            },
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            lowercase: true,
        },
        businessHours: {
            monday: timeSchema,
            tuesday: timeSchema,
            wednesday: timeSchema,
            thursday: timeSchema,
            friday: timeSchema,
            saturday: timeSchema,
            sunday: timeSchema,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // Optional: add images, menu, etc. here later
    },
    {
        timestamps: true,
    }
);

// Indexes
outletSchema.index({ partnerId: 1 });
outletSchema.index({ "address.coordinates": "2dsphere" });

module.exports = mongoose.model("Outlet", outletSchema);
