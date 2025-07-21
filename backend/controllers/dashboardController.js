const { Order, Partner, Product, Customer, Drone, Payment, AdminUser } = require("../models")
const mongoose = require("mongoose")

// Get Super Admin Dashboard Stats
const getSuperAdminStats = async (req, res) => {
    try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Get total partners
        const totalPartners = await Partner.countDocuments({ status: "approved" })

        // Get active drones
        const activeDrones = await Drone.countDocuments({ status: "active" })

        // Get today's revenue
        const todayRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: today },
                    status: "delivered",
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                },
            },
        ])

        // Get total orders
        const totalOrders = await Order.countDocuments()

        res.json({
            success: true,
            message: "Super admin stats retrieved successfully",
            data: {
                totalPartners,
                activeDrones,
                todayRevenue: todayRevenue[0]?.totalRevenue || 0,
                totalOrders,
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

// Get Partner Manager Dashboard Stats
const getPartnerManagerStats = async (req, res) => {
    try {
        const partnerId = req.user.partnerId // Assuming partner manager is linked to a partner

        // Get total orders for this partner
        const totalOrders = await Order.countDocuments({ partnerId })

        // Get successful orders
        const successfulOrders = await Order.countDocuments({
            partnerId,
            status: "delivered",
        })

        // Get cancelled orders
        const cancelledOrders = await Order.countDocuments({
            partnerId,
            status: "cancelled",
        })

        // Get total items in inventory
        const totalItems = await Product.countDocuments({ partnerId })

        res.json({
            success: true,
            message: "Partner manager stats retrieved successfully",
            data: {
                totalOrders,
                successfulOrders,
                cancelledOrders,
                totalItems,
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

// Get Super Admin Analytics
const getSuperAdminAnalytics = async (req, res) => {
    try {
        const { period = "30d" } = req.query

        let dateFilter = {}
        const now = new Date()

        switch (period) {
            case "7d":
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }
                break
            case "30d":
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } }
                break
            case "90d":
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } }
                break
        }

        // Per partner revenue
        const perPartnerRevenue = await Order.aggregate([
            {
                $match: { ...dateFilter, status: "delivered" },
            },
            {
                $lookup: {
                    from: "partners",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partner",
                },
            },
            {
                $unwind: "$partner",
            },
            {
                $group: {
                    _id: "$partnerId",
                    name: { $first: "$partner.businessName" },
                    revenue: { $sum: "$totalAmount" },
                },
            },
            {
                $sort: { revenue: -1 },
            },
            {
                $limit: 5,
            },
        ])

        // Average order cost
        const avgOrderCostResult = await Order.aggregate([
            {
                $match: { ...dateFilter, status: "delivered" },
            },
            {
                $group: {
                    _id: null,
                    avgOrderCost: { $avg: "$totalAmount" },
                },
            },
        ])

        // Average orders per day
        const totalDays = period === "7d" ? 7 : period === "30d" ? 30 : 90
        const totalOrdersInPeriod = await Order.countDocuments({ ...dateFilter, status: "delivered" })
        const avgOrdersPerDay = totalOrdersInPeriod / totalDays

        // Average profit per day
        const avgProfitResult = await Order.aggregate([
            {
                $match: { ...dateFilter, status: "delivered" },
            },
            {
                $group: {
                    _id: null,
                    totalProfit: { $sum: "$netProfit" },
                },
            },
        ])

        const avgProfitPerDay = (avgProfitResult[0]?.totalProfit || 0) / totalDays

        res.json({
            success: true,
            message: "Super admin analytics retrieved successfully",
            data: {
                perPartnerRevenue: perPartnerRevenue.map((p) => ({
                    name: p.name,
                    revenue: p.revenue,
                })),
                avgOrderCost: avgOrderCostResult[0]?.avgOrderCost || 0,
                avgOrdersPerDay,
                avgProfitPerDay,
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

// Get Partner Manager Analytics
const getPartnerManagerAnalytics = async (req, res) => {
    try {
        const partnerId = req.user.partnerId // Assuming partner manager is linked to a partner
        const { period = "30d" } = req.query

        const dateFilter = { partnerId }
        const now = new Date()

        switch (period) {
            case "7d":
                dateFilter.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
                break
            case "30d":
                dateFilter.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
                break
            case "90d":
                dateFilter.createdAt = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) }
                break
        }

        // Total profit
        const totalProfitResult = await Order.aggregate([
            {
                $match: { ...dateFilter, status: "delivered" },
            },
            {
                $group: {
                    _id: null,
                    totalProfit: { $sum: "$partnerPayout" },
                },
            },
        ])

        // Per day profit
        const totalDays = period === "7d" ? 7 : period === "30d" ? 30 : 90
        const totalProfit = totalProfitResult[0]?.totalProfit || 0
        const perDayProfit = totalProfit / totalDays

        // Today's orders and revenue
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const todayStats = await Order.aggregate([
            {
                $match: {
                    partnerId: mongoose.Types.ObjectId(partnerId),
                    createdAt: { $gte: today },
                },
            },
            {
                $group: {
                    _id: null,
                    todayOrders: { $sum: 1 },
                    todayRevenue: { $sum: "$totalAmount" },
                },
            },
        ])

        res.json({
            success: true,
            message: "Partner manager analytics retrieved successfully",
            data: {
                totalProfit,
                perDayProfit,
                todayOrders: todayStats[0]?.todayOrders || 0,
                todayRevenue: todayStats[0]?.todayRevenue || 0,
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

// Get Recent Orders
const getRecentOrders = async (req, res) => {
    console.log("first")
    try {
        const { limit = 10, status } = req.query
        const filter = {}

        if (status) filter.status = status

        // If user is partner manager, filter by their partner
        if (req.user.role === "partner_manager" && req.user.partnerId) {
            filter.partnerId = req.user.partnerId
        }

        const orders = await Order.find(filter)
            .populate("customerId", "firstName lastName")
            .populate("partnerId", "businessName")
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit))

        const formattedOrders = orders.map((order) => ({
            id: order._id,
            customerName: `${order.customerId?.firstName || ""} ${order.customerId?.lastName || ""}`.trim(),
            status: order.status,
            amount: order.totalAmount,
            createdAt: order.createdAt,
            partnerName: order.partnerId?.businessName,
            items: order.items?.length || 0,
        }))

        res.json({
            success: true,
            message: "Recent orders retrieved successfully",
            data: formattedOrders,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get Inventory Items
const getInventoryItems = async (req, res) => {
    try {
        const { category, status, search } = req.query
        const filter = {}

        // If user is partner manager, filter by their partner
        if (req.user.role === "partner_manager" && req.user.partnerId) {
            filter.partnerId = req.user.partnerId
        }

        if (category) filter.category = category
        if (search) {
            filter.$or = [{ name: { $regex: search, $options: "i" } }, { category: { $regex: search, $options: "i" } }]
        }

        const products = await Product.find(filter).sort({ createdAt: -1 })

        const formattedProducts = products.map((product) => {
            let itemStatus = "available"
            if (product.stock === 0) {
                itemStatus = "out_of_stock"
            } else if (product.stock <= 5) {
                itemStatus = "low_stock"
            }

            return {
                id: product._id,
                name: product.name,
                category: product.category,
                price: product.price,
                stock: product.stock,
                status: itemStatus,
            }
        })

        // Filter by status if provided
        const filteredProducts =
            status && status !== "all" ? formattedProducts.filter((p) => p.status === status) : formattedProducts

        res.json({
            success: true,
            message: "Inventory items retrieved successfully",
            data: filteredProducts,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Add Inventory Item
const addInventoryItem = async (req, res) => {
    try {
        const { name, category, price, stock, description } = req.body

        const partnerId = req.user.partnerId || req.body.partnerId

        if (!partnerId) {
            return res.status(400).json({
                success: false,
                message: "Partner ID is required",
            })
        }

        const product = new Product({
            partnerId,
            name,
            category,
            price,
            stock,
            description,
            isAvailable: stock > 0,
        })

        await product.save()

        res.status(201).json({
            success: true,
            message: "Inventory item added successfully",
            data: {
                id: product._id,
                name: product.name,
                category: product.category,
                price: product.price,
                stock: product.stock,
                status: stock > 0 ? (stock <= 5 ? "low_stock" : "available") : "out_of_stock",
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

// Update Inventory Item
const updateInventoryItem = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = req.body

        // If stock is being updated, update availability
        if (updateData.stock !== undefined) {
            updateData.isAvailable = updateData.stock > 0
        }

        const product = await Product.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        })

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            })
        }

        let itemStatus = "available"
        if (product.stock === 0) {
            itemStatus = "out_of_stock"
        } else if (product.stock <= 5) {
            itemStatus = "low_stock"
        }

        res.json({
            success: true,
            message: "Inventory item updated successfully",
            data: {
                id: product._id,
                name: product.name,
                category: product.category,
                price: product.price,
                stock: product.stock,
                status: itemStatus,
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

// Delete Inventory Item
const deleteInventoryItem = async (req, res) => {
    try {
        const { id } = req.params

        const product = await Product.findByIdAndDelete(id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            })
        }

        res.json({
            success: true,
            message: "Inventory item deleted successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get System Health
const getSystemHealth = async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected"

        const stats = {
            database: dbStatus,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString(),
        }

        res.json({
            success: true,
            message: "System health retrieved successfully",
            data: stats,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get Activity Feed
const getActivityFeed = async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query

        // This would typically fetch from an activity log collection
        // For now, return recent orders as activity
        const recentOrders = await Order.find()
            .populate("customerId", "firstName lastName")
            .populate("partnerId", "businessName")
            .sort({ createdAt: -1 })
            .limit(Number.parseInt(limit))
            .skip(Number.parseInt(offset))

        const activities = recentOrders.map((order) => ({
            id: order._id,
            type: "order",
            message: `New order from ${order.customerId?.firstName} ${order.customerId?.lastName}`,
            timestamp: order.createdAt,
            metadata: {
                orderId: order._id,
                amount: order.totalAmount,
                status: order.status,
            },
        }))

        res.json({
            success: true,
            message: "Activity feed retrieved successfully",
            data: activities,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

module.exports = {
    getSuperAdminStats,
    getPartnerManagerStats,
    getSuperAdminAnalytics,
    getPartnerManagerAnalytics,
    getRecentOrders,
    getInventoryItems,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getSystemHealth,
    getActivityFeed,
}
