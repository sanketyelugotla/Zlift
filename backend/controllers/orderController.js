const { Order, Customer, Partner, Product, Payment } = require("../models")

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, partnerId, customerId, startDate, endDate, search } = req.query

        // Build filter
        const filter = {}
        if (status) filter.status = status
        if (partnerId) filter.partnerId = partnerId
        if (customerId) filter.customerId = customerId

        if (startDate || endDate) {
            filter.createdAt = {}
            if (startDate) filter.createdAt.$gte = new Date(startDate)
            if (endDate) filter.createdAt.$lte = new Date(endDate)
        }

        if (search) {
            filter.orderNumber = { $regex: search, $options: "i" }
        }

        const orders = await Order.find(filter)
            .populate("customerId", "firstName lastName email phone")
            .populate("partnerId", "businessName partnerType")
            .populate("assignedDroneId", "droneId model")
            .populate("assignedOperatorId", "firstName lastName employeeId")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const total = await Order.countDocuments(filter)

        res.json({
            success: true,
            data: {
                orders,
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

// Get recent orders for dashboard
const getRecentOrders = async (req, res) => {
    try {
        const { limit = 20 } = req.query

        const orders = await Order.find()
            .populate("customerId", "firstName lastName")
            .populate("partnerId", "businessName partnerType")
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit))

        res.json({
            success: true,
            data: orders,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("customerId", "firstName lastName email phone")
            .populate("partnerId", "businessName partnerType address")
            .populate("assignedDroneId", "droneId model status")
            .populate("assignedOperatorId", "firstName lastName employeeId")
            .populate("items.productId", "name images")

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            })
        }

        res.json({
            success: true,
            data: order,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Create new order
const createOrder = async (req, res) => {
    try {
        const { customerId, partnerId, items, deliveryAddress, deliveryInstructions, paymentMethod } = req.body

        // Validate customer and partner
        const customer = await Customer.findById(customerId)
        const partner = await Partner.findById(partnerId)

        if (!customer || !partner) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer or partner",
            })
        }

        // Calculate order totals
        let subtotal = 0
        const orderItems = []

        for (const item of items) {
            const product = await Product.findById(item.productId)
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product not found: ${item.productId}`,
                })
            }

            const itemTotal = product.price * item.quantity
            subtotal += itemTotal

            orderItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                totalPrice: itemTotal,
                specialInstructions: item.specialInstructions,
            })
        }

        // Calculate fees and total
        const deliveryFee = 25 // Base delivery fee
        const taxAmount = subtotal * 0.05 // 5% tax
        const totalAmount = subtotal + deliveryFee + taxAmount

        // Generate order number
        const orderCount = await Order.countDocuments()
        const orderNumber = `ORD${String(orderCount + 1).padStart(6, "0")}`

        // Create order
        const order = new Order({
            orderNumber,
            customerId,
            partnerId,
            items: orderItems,
            subtotal,
            deliveryFee,
            taxAmount,
            totalAmount,
            deliveryAddress,
            deliveryInstructions,
            pickupAddress: partner.address,
            estimatedPreparationTime: partner.preparationTime,
            estimatedDeliveryTime: 30,
            // Calculate profit fields
            commissionAmount: totalAmount * (partner.commissionRate / 100),
            deliveryCost: 15, // Estimated delivery cost
            transactionFees: totalAmount * 0.02, // 2% transaction fee
        })

        await order.save()

        // Create payment record
        const payment = new Payment({
            orderId: order._id,
            customerId,
            amount: totalAmount,
            paymentMethod,
            transactionFees: totalAmount * 0.02,
        })

        await payment.save()

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Update order status
const updateOrderStatus = async (req, res) => {
    try {
        const { status, notes } = req.body
        const orderId = req.params.id

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            })
        }

        // Update status
        order.status = status

        // Add to timeline
        order.orderTimeline.push({
            status,
            timestamp: new Date(),
            notes,
        })

        // Update specific timestamps
        const now = new Date()
        switch (status) {
            case "confirmed":
                order.confirmedAt = now
                break
            case "prepared":
                order.preparedAt = now
                break
            case "picked_up":
                order.pickedUpAt = now
                break
            case "delivered":
                order.deliveredAt = now
                break
            case "cancelled":
                order.cancelledAt = now
                break
        }

        await order.save()

        res.json({
            success: true,
            message: "Order status updated successfully",
            data: order,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Assign drone to order
const assignDrone = async (req, res) => {
    try {
        const { droneId, operatorId } = req.body
        const orderId = req.params.id

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                assignedDroneId: droneId,
                assignedOperatorId: operatorId,
            },
            { new: true },
        )

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            })
        }

        res.json({
            success: true,
            message: "Drone assigned successfully",
            data: order,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get order statistics
const getOrderStats = async (req, res) => {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const stats = await Order.aggregate([
            {
                $facet: {
                    overall: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                                confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
                                preparing: { $sum: { $cond: [{ $eq: ["$status", "preparing"] }, 1, 0] } },
                                in_transit: { $sum: { $cond: [{ $eq: ["$status", "in_transit"] }, 1, 0] } },
                                delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
                                cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
                                totalRevenue: { $sum: "$totalAmount" },
                                totalProfit: { $sum: "$netProfit" },
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
                                todayOrders: { $sum: 1 },
                                todayRevenue: { $sum: "$totalAmount" },
                                todayProfit: { $sum: "$netProfit" },
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
                today: stats[0].today[0] || { todayOrders: 0, todayRevenue: 0, todayProfit: 0 },
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

// Cancel order
const cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body
        const orderId = req.params.id

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            })
        }

        // Check if order can be cancelled
        if (["delivered", "cancelled"].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: "Order cannot be cancelled",
            })
        }

        // Update order status
        order.status = "cancelled"
        order.cancelledAt = new Date()
        order.orderTimeline.push({
            status: "cancelled",
            timestamp: new Date(),
            notes: reason || "Order cancelled",
        })

        await order.save()

        // Process refund if payment was completed
        const payment = await Payment.findOne({ orderId })
        if (payment && payment.paymentStatus === "completed") {
            payment.paymentStatus = "refunded"
            payment.refundAmount = payment.amount
            payment.refundReason = reason || "Order cancelled"
            payment.refundedAt = new Date()
            await payment.save()
        }

        res.json({
            success: true,
            message: "Order cancelled successfully",
            data: order,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get order timeline
const getOrderTimeline = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).select(
            "orderNumber status orderTimeline createdAt confirmedAt preparedAt pickedUpAt deliveredAt cancelledAt",
        )

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            })
        }

        res.json({
            success: true,
            data: {
                orderNumber: order.orderNumber,
                currentStatus: order.status,
                timeline: order.orderTimeline,
                timestamps: {
                    created: order.createdAt,
                    confirmed: order.confirmedAt,
                    prepared: order.preparedAt,
                    pickedUp: order.pickedUpAt,
                    delivered: order.deliveredAt,
                    cancelled: order.cancelledAt,
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

// Bulk update orders
const bulkUpdateOrders = async (req, res) => {
    try {
        const { orderIds, updateData } = req.body

        const result = await Order.updateMany({ _id: { $in: orderIds } }, updateData)

        res.json({
            success: true,
            message: `${result.modifiedCount} orders updated successfully`,
            data: {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount,
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

// Export orders
const exportOrders = async (req, res) => {
    try {
        const { format = "json", startDate, endDate, status } = req.query

        const filter = {}
        if (status) filter.status = status
        if (startDate || endDate) {
            filter.createdAt = {}
            if (startDate) filter.createdAt.$gte = new Date(startDate)
            if (endDate) filter.createdAt.$lte = new Date(endDate)
        }

        const orders = await Order.find(filter)
            .populate("customerId", "firstName lastName email")
            .populate("partnerId", "businessName")
            .select("orderNumber status totalAmount createdAt deliveredAt")
            .sort({ createdAt: -1 })

        if (format === "csv") {
            // Convert to CSV format
            const csvHeader = "Order Number,Customer,Partner,Status,Amount,Created Date,Delivered Date\n"
            const csvData = orders
                .map(
                    (order) =>
                        `${order.orderNumber},${order.customerId?.firstName} ${order.customerId?.lastName},${order.partnerId?.businessName},${order.status},${order.totalAmount},${order.createdAt},${order.deliveredAt || ""}`,
                )
                .join("\n")

            res.setHeader("Content-Type", "text/csv")
            res.setHeader("Content-Disposition", "attachment; filename=orders-export.csv")
            res.send(csvHeader + csvData)
        } else {
            res.json({
                success: true,
                data: orders,
                exportedAt: new Date(),
                totalRecords: orders.length,
            })
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

module.exports = {
    getAllOrders,
    getRecentOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    assignDrone,
    getOrderStats,
    cancelOrder,
    getOrderTimeline,
    bulkUpdateOrders,
    exportOrders,
}
