const mongoose = require("mongoose")

const customerSchema = new mongoose.Schema(
    {
        // Basic Information
        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
        },

        dateOfBirth: Date,

        // Authentication
        password: {
            type: String,
            required: true,
        },

        // Verification Status
        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        isPhoneVerified: {
            type: Boolean,
            default: false,
        },

        // Profile
        profileImage: String,

        // Addresses
        addresses: [
            {
                label: {
                    type: String,
                    enum: ["home", "work", "other"],
                    required: true,
                },
                street: { type: String, required: true },
                city: { type: String, required: true },
                state: { type: String, required: true },
                pincode: { type: String, required: true },
                coordinates: {
                    latitude: Number,
                    longitude: Number,
                },
                deliveryInstructions: String,
                isDefault: {
                    type: Boolean,
                    default: false,
                },
            },
        ],

        // Status
        isActive: {
            type: Boolean,
            default: true,
        },

        // Analytics
        totalOrders: {
            type: Number,
            default: 0,
        },

        totalSpent: {
            type: Number,
            default: 0,
        },

        loyaltyPoints: {
            type: Number,
            default: 0,
        },

        // Preferences
        preferences: {
            notifications: {
                email: { type: Boolean, default: true },
                sms: { type: Boolean, default: true },
                push: { type: Boolean, default: true },
            },
            dietaryRestrictions: [String],
            favoritePartners: [{ type: mongoose.Schema.Types.ObjectId, ref: "Partner" }],
        },

        // Security
        lastLogin: Date,
    },
    {
        timestamps: true,
    },
)

// Indexes
// customerSchema.index({ email: 1 })
// customerSchema.index({ phone: 1 })

module.exports = mongoose.model("Customer", customerSchema)
