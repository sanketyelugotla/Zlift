const { Order, Partner, Customer, Drone } = require("../models")

// Get sales report
const getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = "day" } = req.query

        const matchFilter = {}
        if (startDate || endDate) {
            matchFilter.createdAt = {}
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate)
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate)
        }

        let groupId
        switch (groupBy) {
            case "hour":
                groupId = {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" },
                    hour: { $hour: "$createdAt" },
                }
                break
            case "day":
                groupId = {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" },
                }
                break
            case "month":
                groupId = {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                }
                break
            default:
                groupId = {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" },
                }
        }

        const salesData = await Order.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: groupId,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    totalProfit: { $sum: "$netProfit" },
                    averageOrderValue: { $avg: "$totalAmount" },
                    deliveredOrders: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
                    cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } },
        ])

        res.json({
            success: true,
            data: {
                salesData,
                summary: {
                    totalOrders: salesData.reduce((sum, item) => sum + item.totalOrders, 0),
                    totalRevenue: salesData.reduce((sum, item) => sum + item.totalRevenue, 0),
                    totalProfit: salesData.reduce((sum, item) => sum + item.totalProfit, 0),
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

// Get partner report
const getPartnerReport = async (req, res) => {
    try {
        const { startDate, endDate, partnerType } = req.query

        const matchFilter = {}
        if (startDate || endDate) {
            matchFilter.createdAt = {}
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate)
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate)
        }

        const partnerData = await Order.aggregate([
            { $match: matchFilter },
            {
                $lookup: {
                    from: "partners",
                    localField: "partnerId",
                    foreignField: "_id",
                    as: "partner",
                },
            },
            { $unwind: "$partner" },
            {
                $match: partnerType ? { "partner.partnerType": partnerType } : {},
            },
            {
                $group: {
                    _id: "$partnerId",
                    partnerName: { $first: "$partner.businessName" },
                    partnerType: { $first: "$partner.partnerType" },
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    totalProfit: { $sum: "$netProfit" },
                    averageOrderValue: { $avg: "$totalAmount" },
                    deliveredOrders: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
                    cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
                },
            },
            { $sort: { totalRevenue: -1 } },
        ])

        res.json({
            success: true,
            data: partnerData,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get customer report
const getCustomerReport = async (req, res) => {
    try {
        const { startDate, endDate, minOrders = 1 } = req.query

        const matchFilter = {}
        if (startDate || endDate) {
            matchFilter.createdAt = {}
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate)
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate)
        }

        const customerData = await Order.aggregate([
            { $match: matchFilter },
            {
                $lookup: {
                    from: "customers",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customer",
                },
            },
            { $unwind: "$customer" },
            {
                $group: {
                    _id: "$customerId",
                    customerName: { $first: { $concat: ["$customer.firstName", " ", "$customer.lastName"] } },
                    customerEmail: { $first: "$customer.email" },
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: "$totalAmount" },
                    averageOrderValue: { $avg: "$totalAmount" },
                    lastOrderDate: { $max: "$createdAt" },
                },
            },
            { $match: { totalOrders: { $gte: Number.parseInt(minOrders) } } },
            { $sort: { totalSpent: -1 } },
        ])

        res.json({
            success: true,
            data: customerData,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get drone utilization report
const getDroneUtilizationReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query

        const matchFilter = {}
        if (startDate || endDate) {
            matchFilter.createdAt = {}
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate)
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate)
        }

        const droneData = await Order.aggregate([
            { $match: { ...matchFilter, assignedDroneId: { $exists: true } } },
            {
                $lookup: {
                    from: "drones",
                    localField: "assignedDroneId",
                    foreignField: "_id",
                    as: "drone",
                },
            },
            { $unwind: "$drone" },
            {
                $group: {
                    _id: "$assignedDroneId",
                    droneId: { $first: "$drone.droneId" },
                    model: { $first: "$drone.model" },
                    totalFlights: { $sum: 1 },
                    completedFlights: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
                    failedFlights: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
                    totalRevenue: { $sum: "$totalAmount" },
                    utilizationRate: {
                        $multiply: [
                            { $divide: [{ $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } }, { $sum: 1 }] },
                            100,
                        ],
                    },
                },
            },
            { $sort: { totalFlights: -1 } },
        ])

        res.json({
            success: true,
            data: droneData,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get financial report
const getFinancialReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query

        const matchFilter = {}
        if (startDate || endDate) {
            matchFilter.createdAt = {}
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate)
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate)
        }

        const financialData = await Order.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" },
                    totalProfit: { $sum: "$netProfit" },
                    totalCommission: { $sum: "$commissionAmount" },
                    totalDeliveryCost: { $sum: "$deliveryCost" },
                    totalTransactionFees: { $sum: "$transactionFees" },
                    totalOrders: { $sum: 1 },
                    averageOrderValue: { $avg: "$totalAmount" },
                    profitMargin: {
                        $multiply: [{ $divide: [{ $sum: "$netProfit" }, { $sum: "$totalAmount" }] }, 100],
                    },
                },
            },
        ])

        // Monthly breakdown
        const monthlyBreakdown = await Order.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    revenue: { $sum: "$totalAmount" },
                    profit: { $sum: "$netProfit" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
        ])

        res.json({
            success: true,
            data: {
                summary: financialData[0] || {},
                monthlyBreakdown,
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

// Get operational report
const getOperationalReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query

        const matchFilter = {}
        if (startDate || endDate) {
            matchFilter.createdAt = {}
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate)
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate)
        }

        // Order status distribution
        const statusDistribution = await Order.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                    percentage: { $sum: 1 },
                },
            },
        ])

        // Calculate percentages
        const totalOrders = statusDistribution.reduce((sum, item) => sum + item.count, 0)
        statusDistribution.forEach((item) => {
            item.percentage = ((item.count / totalOrders) * 100).toFixed(2)
        })

        // Average delivery times
        const deliveryTimes = await Order.aggregate([
            {
                $match: {
                    ...matchFilter,
                    status: "delivered",
                    deliveredAt: { $exists: true },
                },
            },
            {
                $project: {
                    deliveryTime: {
                        $divide: [{ $subtract: ["$deliveredAt", "$createdAt"] }, 1000 * 60], // minutes
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    averageDeliveryTime: { $avg: "$deliveryTime" },
                    minDeliveryTime: { $min: "$deliveryTime" },
                    maxDeliveryTime: { $max: "$deliveryTime" },
                },
            },
        ])

        res.json({
            success: true,
            data: {
                statusDistribution,
                deliveryTimes: deliveryTimes[0] || {},
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

// Export report
const exportReport = async (req, res) => {
    try {
        const { reportType, format = "json", ...filters } = req.body

        let reportData
        switch (reportType) {
            case "sales":
                // Call getSalesReport logic
                reportData = { message: "Sales report data would be here" }
                break
            case "partners":
                // Call getPartnerReport logic
                reportData = { message: "Partner report data would be here" }
                break
            case "customers":
                // Call getCustomerReport logic
                reportData = { message: "Customer report data would be here" }
                break
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid report type",
                })
        }

        if (format === "csv") {
            res.setHeader("Content-Type", "text/csv")
            res.setHeader("Content-Disposition", `attachment; filename=${reportType}-report.csv`)
            // Convert to CSV format
            res.send("CSV data would be here")
        } else {
            res.json({
                success: true,
                data: reportData,
                exportedAt: new Date(),
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
    getSalesReport,
    getPartnerReport,
    getCustomerReport,
    getDroneUtilizationReport,
    getFinancialReport,
    getOperationalReport,
    exportReport,
}
