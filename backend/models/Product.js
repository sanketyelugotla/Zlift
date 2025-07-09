const mongoose = require("mongoose")

const productSchema = new mongoose.Schema(
    {
        // Basic Information
        name: {
            type: String,
            required: true,
        },

        description: String,

        category: {
            type: String,
            required: true,
        },

        subcategory: String,

        // Partner Reference
        partnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Partner",
            required: true,
        },

        // Pricing
        price: {
            type: Number,
            required: true,
            min: 0,
        },

        originalPrice: Number,
        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        // Inventory
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },

        // Media
        images: [String],
        thumbnail: String,

        // Product Details
        weight: Number, // in grams
        dimensions: {
            length: Number,
            width: Number,
            height: Number,
        },

        // Nutritional Information (for food items)
        nutritionalInfo: {
            calories: Number,
            protein: Number,
            carbs: Number,
            fat: Number,
            fiber: Number,
            sugar: Number,
        },

        // Additional Information
        ingredients: [String],
        allergens: [String],
        tags: [String],

        // Variants (size, color, etc.)
        variants: [
            {
                name: String,
                value: String,
                priceModifier: Number,
                stockModifier: Number,
            },
        ],

        // Customization Options
        customizations: [
            {
                name: String,
                type: {
                    type: String,
                    enum: ["single", "multiple"],
                },
                required: Boolean,
                options: [
                    {
                        name: String,
                        price: Number,
                    },
                ],
            },
        ],

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

        totalRevenue: {
            type: Number,
            default: 0,
        },

        // SEO & Search
        searchKeywords: [String],
        isPopular: {
            type: Boolean,
            default: false,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        // Status
        isActive: {
            type: Boolean,
            default: true,
        },

        // Preparation Time
        preparationTime: {
            type: Number,
            default: 15, // minutes
        },

        // Special Attributes
        isVegetarian: Boolean,
        isVegan: Boolean,
        isGlutenFree: Boolean,
        isSpicy: Boolean,
    },
    {
        timestamps: true,
    },
)

// Indexes
productSchema.index({ partnerId: 1 })
productSchema.index({ category: 1 })
productSchema.index({ name: "text", description: "text", tags: "text" })
productSchema.index({ isAvailable: 1 })
productSchema.index({ price: 1 })

module.exports = mongoose.model("Product", productSchema)
