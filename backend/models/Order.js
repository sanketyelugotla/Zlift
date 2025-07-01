const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
    {
        // Order Identification
        orderNumber: {
            type: String,
            unique: true,
            required: true,
        },

        // References
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },

        partnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Partner",
            required: true,
        },

        // Order Items
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                name: String, // snapshot at time of order
                price: Number, // snapshot at time of order
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                totalPrice: Number,
                specialInstructions: String,
            },
        ],

        // Pricing Breakdown
        subtotal: {
            type: Number,
            required: true,
        },

        deliveryFee: {
            type: Number,
            default: 0,
        },

        taxAmount: {
            type: Number,
            default: 0,
        },

        discountAmount: {
            type: Number,
            default: 0,
        },

        totalAmount: {
            type: Number,
            required: true,
        },

        // Analytics Fields
        grossRevenue: Number, // same as totalAmount
        commissionAmount: Number, // platform commission
        partnerPayout: Number, // amount paid to partner
        deliveryCost: Number, // actual delivery cost
        transactionFees: Number, // payment gateway fees
        netProfit: Number, // final profit
        profitPercentage: Number, // profit margin %

        // Addresses
        pickupAddress: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
        },

        deliveryAddress: {
            street: String,
            city: String,
            state: String,
            pincode: String,
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
            deliveryInstructions: String,
        },

        // Order Status
        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "preparing",
                "ready_for_pickup",
                "picked_up",
                "in_transit",
                "delivered",
                "cancelled",
                "failed",
            ],
            default: "pending",
        },

        // Timeline Tracking
        orderTimeline: [
            {
                status: String,
                timestamp: Date,
                notes: String,
            },
        ],

        // Timing
        estimatedPreparationTime: Number, // minutes
        estimatedDeliveryTime: Number, // minutes
        scheduledDeliveryTime: Date,

        // Timestamps
        confirmedAt: Date,
        preparedAt: Date,
        pickedUpAt: Date,
        deliveredAt: Date,
        cancelledAt: Date,

        // Drone Assignment
        assignedDroneId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Drone",
        },

        assignedOperatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DroneOperator",
        },

        // Special Instructions
        cookingInstructions: String,
        deliveryInstructions: String,

        // Customer Feedback
        customerRating: {
            type: Number,
            min: 1,
            max: 5,
        },

        customerReview: String,

        // Order Source
        orderSource: {
            type: String,
            enum: ["web", "mobile_app", "phone"],
            default: "mobile_app",
        },
    },
    {
        timestamps: true,
    },
)

// Indexes
orderSchema.index({ customerId: 1 })
orderSchema.index({ partnerId: 1 })
orderSchema.index({ orderNumber: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ createdAt: -1 })

// Pre-save middleware to calculate profit
orderSchema.pre("save", function (next) {
    if (
        this.isModified("totalAmount") ||
        this.isModified("commissionAmount") ||
        this.isModified("deliveryCost") ||
        this.isModified("transactionFees")
    ) {
        this.grossRevenue = this.totalAmount
        this.partnerPayout = this.totalAmount - (this.commissionAmount || 0)
        this.netProfit =
            this.totalAmount - (this.partnerPayout || 0) - (this.deliveryCost || 0) - (this.transactionFees || 0)
        this.profitPercentage = this.totalAmount > 0 ? ((this.netProfit / this.totalAmount) * 100).toFixed(2) : 0
    }
    next()
})

module.exports = mongoose.model("Order", orderSchema)
