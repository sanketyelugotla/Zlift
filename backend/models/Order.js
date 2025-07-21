const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema(
    {
        // Order Identification
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },

        // Parties Involved
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
                name: String,
                price: Number,
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                totalPrice: Number,
                specialInstructions: String,
            },
        ],

        // Pricing
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
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            coordinates: {
                latitude: Number,
                longitude: Number,
            },
        },

        deliveryInstructions: String,

        // Status and Timeline
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

        orderTimeline: [
            {
                status: String,
                timestamp: Date,
                notes: String,
            },
        ],

        // Timestamps
        confirmedAt: Date,
        preparedAt: Date,
        pickedUpAt: Date,
        deliveredAt: Date,
        cancelledAt: Date,

        // Delivery Details
        assignedDroneId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Drone",
        },

        assignedOperatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DroneOperator",
        },

        estimatedPreparationTime: Number, // minutes
        estimatedDeliveryTime: Number, // minutes
        actualDeliveryTime: Number, // minutes

        // Financial Calculations
        commissionAmount: {
            type: Number,
            default: 0,
        },

        deliveryCost: {
            type: Number,
            default: 0,
        },

        transactionFees: {
            type: Number,
            default: 0,
        },

        netProfit: {
            type: Number,
            default: 0,
        },

        // Additional Information
        specialRequirements: String,
        weatherConditions: String,
        deliveryNotes: String,
        customerRating: {
            type: Number,
            min: 1,
            max: 5,
        },
        customerFeedback: String,
    },
    {
        timestamps: true,
    },
)

// Calculate net profit before saving
orderSchema.pre("save", function (next) {
    if (
        this.isModified("totalAmount") ||
        this.isModified("commissionAmount") ||
        this.isModified("deliveryCost") ||
        this.isModified("transactionFees")
    ) {
        this.netProfit = this.totalAmount - (this.commissionAmount + this.deliveryCost + this.transactionFees)
    }
    next()
})

// Indexes
// orderSchema.index({ orderNumber: 1 })
orderSchema.index({ customerId: 1 })
orderSchema.index({ partnerId: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ createdAt: -1 })
orderSchema.index({ assignedDroneId: 1 })
orderSchema.index({ assignedOperatorId: 1 })

module.exports = mongoose.model("Order", orderSchema)
