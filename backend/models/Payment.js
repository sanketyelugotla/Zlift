const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema(
    {
        // Order Reference
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

        // Gateway Information
        gatewayTransactionId: String,
        gatewayResponse: mongoose.Schema.Types.Mixed,

        // Processing Details
        processedAt: Date,
        transactionFees: {
            type: Number,
            default: 0,
        },

        // Refund Information
        refundAmount: {
            type: Number,
            default: 0,
        },

        refundReason: String,
        refundedAt: Date,

        // Settlement Information
        settlementStatus: {
            type: String,
            enum: ["pending", "processed", "failed"],
            default: "pending",
        },

        settlementDate: Date,
        settlementAmount: Number,

        // Additional Information
        currency: {
            type: String,
            default: "INR",
        },

        paymentDescription: String,
        failureReason: String,
    },
    {
        timestamps: true,
    },
)

// Indexes
paymentSchema.index({ orderId: 1 })
paymentSchema.index({ customerId: 1 })
paymentSchema.index({ paymentStatus: 1 })
paymentSchema.index({ gatewayTransactionId: 1 })
paymentSchema.index({ settlementStatus: 1 })

module.exports = mongoose.model("Payment", paymentSchema)
