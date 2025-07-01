const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
    {
        partnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Partner",
            required: true,
        },

        // Basic Information
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: String,

        category: {
            type: String,
            required: true,
        },

        subcategory: String,

        // Pricing
        price: {
            type: Number,
            required: true,
            min: 0,
        },

        discountedPrice: {
            type: Number,
            min: 0,
        },

        // Product Details
        attributes: {
            weight: Number, // grams
            dimensions: {
                length: Number,
                width: Number,
                height: Number,
            },
            isVegetarian: Boolean,
            isVegan: Boolean,
            isGlutenFree: Boolean,
            spiceLevel: {
                type: Number,
                min: 0,
                max: 5,
            },
            calories: Number,
            expiryDate: Date, // for medicines/perishables
            batchNumber: String, // for medicines
            requiresPrescription: Boolean, // for medicines
            ageRestricted: Boolean, // for alcohol, etc.
            temperatureControlled: Boolean, // cold chain items
            fragile: Boolean,
        },

        // Availability
        isAvailable: {
            type: Boolean,
            default: true,
        },

        stock: {
            type: Number,
            default: 0,
        },

        preparationTime: {
            type: Number,
            default: 15, // minutes
        },

        // Media
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

        // SEO
        tags: [String],
    },
    {
        timestamps: true,
    },
)

// Indexes
productSchema.index({ partnerId: 1 })
productSchema.index({ category: 1 })
productSchema.index({ isAvailable: 1 })
productSchema.index({ name: "text", description: "text", tags: "text" })

module.exports = mongoose.model("Product", productSchema)
