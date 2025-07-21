const mongoose = require("mongoose")

const partnerSchema = new mongoose.Schema(
    {
        // Basic Information
        businessName: {
            type: String,
            required: true,
        },

        ownerName: {
            type: String,
            required: true,
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

        alternatePhone: String,

        // Business Details
        partnerType: {
            type: String,
            enum: ["restaurant", "grocery", "pharmacy", "retail"],
            required: true,
        },

        businessCategory: String,
        cuisine: [String], // For restaurants

        // Address
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
        },

        // Business Hours
        businessHours: {
            monday: { open: String, close: String, isClosed: Boolean },
            tuesday: { open: String, close: String, isClosed: Boolean },
            wednesday: { open: String, close: String, isClosed: Boolean },
            thursday: { open: String, close: String, isClosed: Boolean },
            friday: { open: String, close: String, isClosed: Boolean },
            saturday: { open: String, close: String, isClosed: Boolean },
            sunday: { open: String, close: String, isClosed: Boolean },
        },

        // Legal & Compliance
        businessLicense: {
            licenseNumber: String,
            issuedDate: Date,
            expiryDate: Date,
            documentUrl: String,
        },

        gstNumber: String,
        fssaiNumber: String, // For food businesses

        // Financial Details
        bankDetails: {
            accountHolderName: String,
            accountNumber: String,
            ifscCode: String,
            bankName: String,
            branchName: String,
        },

        commissionRate: {
            type: Number,
            default: 15, // percentage
        },

        // Operational Details
        preparationTime: {
            type: Number,
            default: 20, // minutes
        },

        minimumOrderAmount: {
            type: Number,
            default: 100,
        },

        deliveryRadius: {
            type: Number,
            default: 10, // km
        },

        // Status & Approval
        status: {
            type: String,
            enum: ["pending", "approved", "suspended", "rejected"],
            default: "pending",
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdminUser",
        },

        approvedAt: Date,
        rejectionReason: String,

        // Media
        logo: String,
        banner: String,
        images: [String],

        // Ratings & Reviews
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

        // Performance Metrics
        totalOrders: {
            type: Number,
            default: 0,
        },

        completedOrders: {
            type: Number,
            default: 0,
        },

        cancelledOrders: {
            type: Number,
            default: 0,
        },

        totalRevenue: {
            type: Number,
            default: 0,
        },

        // Settings
        isActive: {
            type: Boolean,
            default: true,
        },

        acceptingOrders: {
            type: Boolean,
            default: true,
        },

        // Additional Information
        description: String,
        specialties: [String],
        tags: [String],
    },
    {
        timestamps: true,
    },
)

// Indexes
// partnerSchema.index({ email: 1 })
partnerSchema.index({ partnerType: 1 })
partnerSchema.index({ status: 1 })
partnerSchema.index({ "address.coordinates": "2dsphere" })

module.exports = mongoose.model("Partner", partnerSchema)
