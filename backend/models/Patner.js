const mongoose = require("mongoose")

const partnerSchema = new mongoose.Schema(
    {
        // Basic Information
        businessName: {
            type: String,
            required: true,
            trim: true,
        },
        partnerType: {
            type: String,
            required: true,
            enum: ["restaurant", "pharmacy", "grocery", "electronics", "fashion", "books", "general"],
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
        },

        // Business Details
        businessLicense: {
            number: String,
            expiryDate: Date,
            documentUrl: String,
        },
        taxId: String,

        // Owner Information
        ownerName: {
            type: String,
            required: true,
        },
        ownerPhone: String,
        ownerEmail: String,

        // Address
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            coordinates: {
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true },
            },
        },

        // Operational Details
        operatingHours: {
            monday: { open: String, close: String, isOpen: Boolean },
            tuesday: { open: String, close: String, isOpen: Boolean },
            wednesday: { open: String, close: String, isOpen: Boolean },
            thursday: { open: String, close: String, isOpen: Boolean },
            friday: { open: String, close: String, isOpen: Boolean },
            saturday: { open: String, close: String, isOpen: Boolean },
            sunday: { open: String, close: String, isOpen: Boolean },
        },

        preparationTime: {
            type: Number,
            default: 30, // minutes
        },

        deliveryRadius: {
            type: Number,
            default: 5, // km
        },

        minimumOrderAmount: {
            type: Number,
            default: 0,
        },

        // Status and Approval
        status: {
            type: String,
            enum: ["pending", "approved", "suspended", "rejected"],
            default: "pending",
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        // Financial
        commissionRate: {
            type: Number,
            default: 15.0, // percentage
        },

        // Media
        logo: String,
        banner: String,
        images: [String],

        // Analytics
        totalOrders: {
            type: Number,
            default: 0,
        },

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        totalReviews: {
            type: Number,
            default: 0,
        },

        // Metadata
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdminUser",
        },

        approvedAt: Date,
    },
    {
        timestamps: true,
    },
)

// Indexes
partnerSchema.index({ email: 1 })
partnerSchema.index({ partnerType: 1 })
partnerSchema.index({ status: 1 })
partnerSchema.index({ "address.coordinates": "2dsphere" })

module.exports = mongoose.model("Partner", partnerSchema)
