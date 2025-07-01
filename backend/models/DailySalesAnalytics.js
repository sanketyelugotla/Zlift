const mongoose = require("mongoose")

const dailySalesAnalyticsSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
            unique: true,
        },

        // Sales Summary
        sales: {
            totalOrders: { type: Number, default: 0 },
            totalRevenue: { type: Number, default: 0 },
            totalProfit: { type: Number, default: 0 },
            averageOrderValue: { type: Number, default: 0 },
            profitMargin: { type: Number, default: 0 }, // percentage
        },

        // Partner Performance
        partnerWiseSales: [
            {
                partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },
                partnerName: String,
                partnerType: String,
                orders: Number,
                revenue: Number,
                profit: Number,
            },
        ],

        // Payment Breakdown
        paymentStatus: {
            completed: { type: Number, default: 0 },
            pending: { type: Number, default: 0 },
            failed: { type: Number, default: 0 },
            refunded: { type: Number, default: 0 },
        },

        paymentMethods: {
            card: { type: Number, default: 0 },
            upi: { type: Number, default: 0 },
            wallet: { type: Number, default: 0 },
            cod: { type: Number, default: 0 },
        },

        // Top Performers
        topPartners: [
            {
                partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },
                name: String,
                orders: Number,
                revenue: Number,
            },
        ],

        topProducts: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                name: String,
                orders: Number,
                revenue: Number,
            },
        ],

        // Operational Metrics
        averageDeliveryTime: Number, // minutes
        successfulDeliveries: Number,
        failedDeliveries: Number,
    },
    {
        timestamps: true,
    },
)

// Indexes
dailySalesAnalyticsSchema.index({ date: -1 })

module.exports = mongoose.model("DailySalesAnalytics", dailySalesAnalyticsSchema)
