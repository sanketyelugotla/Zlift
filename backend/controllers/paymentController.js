const { Payment, Order } = require("../models")
const mongoose = require("mongoose") // Declare mongoose variable

// Get all payments (Admin)
const getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10, paymentStatus, settlementStatus, paymentMethod, startDate, endDate } = req.query

        // Build filter
        const filter = {}
        if (paymentStatus) filter.paymentStatus = paymentStatus
        if (settlementStatus) filter.settlementStatus = settlementStatus
        if (paymentMethod) filter.paymentMethod = paymentMethod

        if (startDate || endDate) {
            filter.createdAt = {}
            if (startDate) filter.createdAt.$gte = new Date(startDate)
            if (endDate) filter.createdAt.$lte = new Date(endDate)
        }

        const payments = await Payment.find(filter)
            .populate("orderId", "orderNumber totalAmount")
            .populate("customerId", "firstName lastName email")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const total = await Payment.countDocuments(filter)

        res.json({
            success: true,
            data: {
                payments,
                pagination: {
                    current: page,
                    pages: Math.ceil(total / limit),
                    total,
                },
            },
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get payment by ID
const getPaymentById = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id)
            .populate("orderId")
            .populate("customerId", "firstName lastName email phone")

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            })
        }

        res.json({
            success: true,
            data: payment,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Update payment status
const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus, gatewayTransactionId, gatewayResponse } = req.body
        const paymentId = req.params.id

        const updateData = {
            paymentStatus,
            processedAt: new Date(),
        }

        if (gatewayTransactionId) updateData.gatewayTransactionId = gatewayTransactionId
        if (gatewayResponse) updateData.gatewayResponse = gatewayResponse

        const payment = await Payment.findByIdAndUpdate(paymentId, updateData, { new: true })

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            })
        }

        // If payment is completed, update order status
        if (paymentStatus === "completed") {
            await Order.findByIdAndUpdate(payment.orderId, {
                status: "confirmed",
                confirmedAt: new Date(),
            })
        }

        res.json({
            success: true,
            message: "Payment status updated successfully",
            data: payment,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Process settlement
const processSettlement = async (req, res) => {
    try {
        const { paymentIds } = req.body // Array of payment IDs

        const payments = await Payment.find({
            _id: { $in: paymentIds },
            paymentStatus: "completed",
            settlementStatus: "pending",
        }).populate("orderId")

        if (payments.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No eligible payments found for settlement",
            })
        }

        // Update settlement status
        const updatePromises = payments.map((payment) => {
            return Payment.findByIdAndUpdate(payment._id, {
                settlementStatus: "processed",
                settlementDate: new Date(),
                settlementAmount: payment.amount - payment.transactionFees - payment.orderId.commissionAmount,
            })
        })

        await Promise.all(updatePromises)

        res.json({
            success: true,
            message: `${payments.length} payments processed for settlement`,
            data: {
                processedCount: payments.length,
                totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
            },
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get payment statistics
const getPaymentStats = async (req, res) => {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const stats = await Payment.aggregate([
            {
                $facet: {
                    overall: [
                        {
                            $group: {
                                _id: null,
                                totalPayments: { $sum: 1 },
                                totalAmount: { $sum: "$amount" },
                                completed: { $sum: { $cond: [{ $eq: ["$paymentStatus", "completed"] }, 1, 0] } },
                                pending: { $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] } },
                                failed: { $sum: { $cond: [{ $eq: ["$paymentStatus", "failed"] }, 1, 0] } },
                                refunded: { $sum: { $cond: [{ $eq: ["$paymentStatus", "refunded"] }, 1, 0] } },
                                totalTransactionFees: { $sum: "$transactionFees" },
                            },
                        },
                    ],
                    byMethod: [
                        {
                            $group: {
                                _id: "$paymentMethod",
                                count: { $sum: 1 },
                                amount: { $sum: "$amount" },
                            },
                        },
                    ],
                    settlement: [
                        {
                            $group: {
                                _id: "$settlementStatus",
                                count: { $sum: 1 },
                                amount: { $sum: "$amount" },
                            },
                        },
                    ],
                    today: [
                        {
                            $match: {
                                createdAt: { $gte: today },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                todayPayments: { $sum: 1 },
                                todayAmount: { $sum: "$amount" },
                            },
                        },
                    ],
                },
            },
        ])

        res.json({
            success: true,
            data: {
                overall: stats[0].overall[0] || {},
                byMethod: stats[0].byMethod,
                settlement: stats[0].settlement,
                today: stats[0].today[0] || { todayPayments: 0, todayAmount: 0 },
            },
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Refund payment
const refundPayment = async (req, res) => {
    try {
        const { amount, reason } = req.body
        const paymentId = req.params.id

        const payment = await Payment.findById(paymentId)
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            })
        }

        if (payment.paymentStatus !== "completed") {
            return res.status(400).json({
                success: false,
                message: "Only completed payments can be refunded",
            })
        }

        const refundAmount = amount || payment.amount

        if (refundAmount > payment.amount) {
            return res.status(400).json({
                success: false,
                message: "Refund amount cannot exceed payment amount",
            })
        }

        // Update payment record
        payment.paymentStatus = "refunded"
        payment.refundAmount = refundAmount
        payment.refundReason = reason
        payment.refundedAt = new Date()
        await payment.save()

        // Update order status
        await Order.findByIdAndUpdate(payment.orderId, {
            status: "cancelled",
            cancelledAt: new Date(),
        })

        res.json({
            success: true,
            message: "Payment refunded successfully",
            data: {
                paymentId: payment._id,
                refundAmount,
                refundedAt: payment.refundedAt,
            },
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get settlement report
const getSettlementReport = async (req, res) => {
    try {
        const { startDate, endDate, partnerId } = req.query

        const matchFilter = {
            paymentStatus: "completed",
        }

        if (startDate || endDate) {
            matchFilter.createdAt = {}
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate)
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate)
        }

        const pipeline = [
            { $match: matchFilter },
            {
                $lookup: {
                    from: "orders",
                    localField: "orderId",
                    foreignField: "_id",
                    as: "order",
                },
            },
            { $unwind: "$order" },
        ]

        if (partnerId) {
            pipeline.push({
                $match: { "order.partnerId": mongoose.Types.ObjectId(partnerId) },
            })
        }

        pipeline.push(
            {
                $lookup: {
                    from: "partners",
                    localField: "order.partnerId",
                    foreignField: "_id",
                    as: "partner",
                },
            },
            { $unwind: "$partner" },
            {
                $group: {
                    _id: "$order.partnerId",
                    partnerName: { $first: "$partner.businessName" },
                    totalPayments: { $sum: 1 },
                    totalAmount: { $sum: "$amount" },
                    totalCommission: { $sum: "$order.commissionAmount" },
                    totalTransactionFees: { $sum: "$transactionFees" },
                    settlementAmount: {
                        $sum: {
                            $subtract: ["$amount", { $add: ["$order.commissionAmount", "$transactionFees"] }],
                        },
                    },
                    pendingSettlement: {
                        $sum: {
                            $cond: [
                                { $eq: ["$settlementStatus", "pending"] },
                                {
                                    $subtract: ["$amount", { $add: ["$order.commissionAmount", "$transactionFees"] }],
                                },
                                0,
                            ],
                        },
                    },
                },
            },
            { $sort: { totalAmount: -1 } },
        )

        const settlementData = await Payment.aggregate(pipeline)

        const summary = settlementData.reduce(
            (acc, item) => ({
                totalPartners: acc.totalPartners + 1,
                totalPayments: acc.totalPayments + item.totalPayments,
                totalAmount: acc.totalAmount + item.totalAmount,
                totalCommission: acc.totalCommission + item.totalCommission,
                totalSettlement: acc.totalSettlement + item.settlementAmount,
                pendingSettlement: acc.pendingSettlement + item.pendingSettlement,
            }),
            {
                totalPartners: 0,
                totalPayments: 0,
                totalAmount: 0,
                totalCommission: 0,
                totalSettlement: 0,
                pendingSettlement: 0,
            },
        )

        res.json({
            success: true,
            data: {
                summary,
                partnerSettlements: settlementData,
            },
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Process webhook
const processWebhook = async (req, res) => {
    try {
        const { event, data } = req.body

        switch (event) {
            case "payment.completed":
                await Payment.findOneAndUpdate(
                    { gatewayTransactionId: data.transactionId },
                    {
                        paymentStatus: "completed",
                        processedAt: new Date(),
                        gatewayResponse: data,
                    },
                )
                break

            case "payment.failed":
                await Payment.findOneAndUpdate(
                    { gatewayTransactionId: data.transactionId },
                    {
                        paymentStatus: "failed",
                        processedAt: new Date(),
                        gatewayResponse: data,
                    },
                )
                break

            default:
                console.log("Unhandled webhook event:", event)
        }

        res.json({
            success: true,
            message: "Webhook processed successfully",
        })
    } catch (error) {
        console.error("Webhook processing error:", error)
        res.status(500).json({
            success: false,
            message: "Webhook processing failed",
        })
    }
}

module.exports = {
    getAllPayments,
    getPaymentById,
    updatePaymentStatus,
    processSettlement,
    getPaymentStats,
    refundPayment,
    getSettlementReport,
    processWebhook,
}
