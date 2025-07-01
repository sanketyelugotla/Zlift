const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },

        // Payment Details
        amount: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            default: "INR",
        },

        paymentMethod: {
            type: String,
            enum: ["card", "upi", "wallet", "cash_on_delivery", "net_banking"],
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded", "cancelled"],
            default: "pending",
        },

        // Gateway Details
        gatewayTransactionId: String,
        gatewayName: String, // razorpay, stripe, etc.
        gatewayResponse: mongoose.Schema.Types.Mixed,

        // Settlement for Partners
        settlementStatus: {
            type: String,
            enum: ["pending", "processed", "completed"],
            default: "pending",
        },

        settlementAmount: Number, // amount to be paid to partner
        settlementDate: Date,

        // Transaction Fees
        transactionFees: {
            type: Number,
            default: 0,
        },

        // Refund Details
        refundAmount: Number,
        refundReason: String,
        refundedAt: Date,

        // Timestamps
        processedAt: Date,
    },
    {
        timestamps: true,
    },
)

// Indexes
paymentSchema.index({ orderId: 1 })
paymentSchema.index({ customerId: 1 })
paymentSchema.index({ paymentStatus: 1 })
paymentSchema.index({ settlementStatus: 1 })

module.exports = mongoose.model("Payment", paymentSchema)
