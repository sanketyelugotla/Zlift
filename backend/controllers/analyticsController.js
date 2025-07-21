const { Order, Payment, Partner, Customer, DailySalesAnalytics, Drone } = require("../models")

// Helper to get partnerId from request if user is a partner
const getPartnerIdFilter = (req) => {
    if (req.user && req.user.userType === "partner") {
        return { partnerId: req.user.id }
    }
    return {}
}

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
    try {
        const partnerFilter = getPartnerIdFilter(req)

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

        // Today's stats
        const todayStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: today },
                    ...partnerFilter, // Apply partner filter
                },
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    totalProfit: { $sum: "$netProfit" },
                    averageOrderValue: { $avg: "$totalAmount" },
                },
            },
        ])

        // This month's stats
        const monthStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: thisMonth },
                    ...partnerFilter, // Apply partner filter
                },
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    totalProfit: { $sum: "$netProfit" },
                },
            },
        ])

        // Recent orders
        const recentOrders = await Order.find(partnerFilter) // Apply partner filter
            .populate("customerId", "firstName lastName")
            .populate("partnerId", "businessName partnerType")
            .sort({ createdAt: -1 })
            .limit(10)

        // Payment status breakdown
        const paymentStats = await Payment.aggregate([
            {
                $match: partnerFilter, // Apply partner filter
            },
            {
                $group: {
                    _id: "$paymentStatus",
                    count: { $sum: 1 },
                    amount: { $sum: "$amount" },
                },
            },
        ])

        // Top performing partners (only relevant for super admin, or if partner wants to see their own rank)
        let topPartners = []
        if (!partnerFilter.partnerId) {
            topPartners = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: thisMonth },
                        status: "delivered",
                    },
                },
                {
                    $group: {
                        _id: "$partnerId",
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: "$totalAmount" },
                        totalProfit: { $sum: "$netProfit" },
                    },
                },
                {
                    $lookup: {
                        from: "partners",
                        localField: "_id",
                        foreignField: "_id",
                        as: "partner",
                    },
                },
                {
                    $unwind: "$partner",
                },
                {
                    $project: {
                        partnerName: "$partner.businessName",
                        partnerType: "$partner.partnerType",
                        totalOrders: 1,
                        totalRevenue: 1,
                        totalProfit: 1,
                    },
                },
                {
                    $sort: { totalRevenue: -1 },
                },
                {
                    $limit: 5,
                },
            ])
        }

        // Order status distribution
        const orderStatusStats = await Order.aggregate([
            {
                $match: partnerFilter, // Apply partner filter
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ])

        res.json({
            success: true,
            data: {
                today: todayStats[0] || { totalOrders: 0, totalRevenue: 0, totalProfit: 0, averageOrderValue: 0 },
                thisMonth: monthStats[0] || { totalOrders: 0, totalRevenue: 0, totalProfit: 0 },
                recentOrders,
                paymentStats,
                topPartners,
                orderStatusStats,
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

// Get sales analytics
const getSalesAnalytics = async (req, res) => {
    try {
        const { period = "7d", startDate, endDate } = req.query
        const partnerFilter = getPartnerIdFilter(req)

        let dateFilter = {}
        const now = new Date()

        // Set date range based on period
        switch (period) {
            case "24h":
                dateFilter = {
                    createdAt: {
                        $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000),
                    },
                }
                break
            case "7d":
                dateFilter = {
                    createdAt: {
                        $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                    },
                }
                break
            case "30d":
                dateFilter = {
                    createdAt: {
                        $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
                    },
                }
                break
            case "custom":
                if (startDate && endDate) {
                    dateFilter = {
                        createdAt: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate),
                        },
                    }
                }
                break
        }

        // Daily sales trend
        const salesTrend = await Order.aggregate([
            {
                $match: { ...dateFilter, ...partnerFilter }, // Apply partner filter
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    totalProfit: { $sum: "$netProfit" },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
            },
        ])

        // Partner type performance (only relevant for super admin)
        let partnerTypeStats = []
        if (!partnerFilter.partnerId) {
            partnerTypeStats = await Order.aggregate([
                {
                    $match: dateFilter,
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
                        _id: "$partner.partnerType",
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: "$totalAmount" },
                        totalProfit: { $sum: "$netProfit" },
                    },
                },
            ])
        }

        // Hourly order distribution
        const hourlyStats = await Order.aggregate([
            {
                $match: { ...dateFilter, ...partnerFilter }, // Apply partner filter
            },
            {
                $group: {
                    _id: { $hour: "$createdAt" },
                    orderCount: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ])

        res.json({
            success: true,
            data: {
                salesTrend,
                partnerTypeStats,
                hourlyStats,
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

// Generate daily analytics (to be run as a cron job)
const generateDailyAnalytics = async (req, res) => {
    try {
        const date = req.query.date ? new Date(req.query.date) : new Date()
        date.setHours(0, 0, 0, 0)

        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)

        // Check if analytics already exist for this date
        const existingAnalytics = await DailySalesAnalytics.findOne({ date })
        if (existingAnalytics) {
            return res.status(400).json({
                success: false,
                message: "Analytics already exist for this date",
            })
        }

        // Get orders for the day
        const dayOrders = await Order.find({
            createdAt: {
                $gte: date,
                $lt: nextDay,
            },
        }).populate("partnerId", "businessName partnerType")

        // Calculate sales summary
        const sales = {
            totalOrders: dayOrders.length,
            totalRevenue: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
            totalProfit: dayOrders.reduce((sum, order) => sum + (order.netProfit || 0), 0),
            averageOrderValue:
                dayOrders.length > 0 ? dayOrders.reduce((sum, order) => sum + order.totalAmount, 0) / dayOrders.length : 0,
        }

        sales.profitMargin = sales.totalRevenue > 0 ? ((sales.totalProfit / sales.totalRevenue) * 100).toFixed(2) : 0

        // Partner-wise performance
        const partnerWiseSales = {}
        dayOrders.forEach((order) => {
            const partnerId = order.partnerId._id.toString()
            if (!partnerWiseSales[partnerId]) {
                partnerWiseSales[partnerId] = {
                    partnerId: order.partnerId._id,
                    partnerName: order.partnerId.businessName,
                    partnerType: order.partnerId.partnerType,
                    orders: 0,
                    revenue: 0,
                    profit: 0,
                }
            }
            partnerWiseSales[partnerId].orders += 1
            partnerWiseSales[partnerId].revenue += order.totalAmount
            partnerWiseSales[partnerId].profit += order.netProfit || 0
        })

        // Get payment stats for the day
        const dayPayments = await Payment.find({
            createdAt: {
                $gte: date,
                $lt: nextDay,
            },
        })

        const paymentStatus = {
            completed: dayPayments.filter((p) => p.paymentStatus === "completed").length,
            pending: dayPayments.filter((p) => p.paymentStatus === "pending").length,
            failed: dayPayments.filter((p) => p.paymentStatus === "failed").length,
            refunded: dayPayments.filter((p) => p.paymentStatus === "refunded").length,
        }

        const paymentMethods = {
            card: dayPayments.filter((p) => p.paymentMethod === "card").length,
            upi: dayPayments.filter((p) => p.paymentMethod === "upi").length,
            wallet: dayPayments.filter((p) => p.paymentMethod === "wallet").length,
            cod: dayPayments.filter((p) => p.paymentMethod === "cash_on_delivery").length,
        }

        // Create analytics record
        const analytics = new DailySalesAnalytics({
            date,
            sales,
            partnerWiseSales: Object.values(partnerWiseSales),
            paymentStatus,
            paymentMethods,
            topPartners: Object.values(partnerWiseSales)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5),
        })

        await analytics.save()

        res.json({
            success: true,
            message: "Daily analytics generated successfully",
            data: analytics,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get revenue analytics
const getRevenueAnalytics = async (req, res) => {
    try {
        const { period = "30d", groupBy = "day" } = req.query
        const partnerFilter = getPartnerIdFilter(req)

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
            case "1y":
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } }
                break
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
        }

        const revenueData = await Order.aggregate([
            { $match: { ...dateFilter, ...partnerFilter, status: "delivered" } }, // Apply partner filter
            {
                $group: {
                    _id: groupId,
                    grossRevenue: { $sum: "$totalAmount" },
                    netRevenue: { $sum: { $subtract: ["$totalAmount", "$deliveryCost"] } },
                    commission: { $sum: "$commissionAmount" },
                    deliveryCosts: { $sum: "$deliveryCost" },
                    transactionFees: { $sum: "$transactionFees" },
                    profit: { $sum: "$netProfit" },
                    orderCount: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } },
        ])

        // Calculate growth rates
        const growthRates = revenueData.map((current, index) => {
            if (index === 0) return { ...current, growthRate: 0 }
            const previous = revenueData[index - 1]
            const growthRate =
                previous.grossRevenue > 0
                    ? (((current.grossRevenue - previous.grossRevenue) / previous.grossRevenue) * 100).toFixed(2)
                    : 0
            return { ...current, growthRate: Number.parseFloat(growthRate) }
        })

        res.json({
            success: true,
            data: {
                revenueData: growthRates,
                summary: {
                    totalRevenue: revenueData.reduce((sum, item) => sum + item.grossRevenue, 0),
                    totalProfit: revenueData.reduce((sum, item) => sum + item.profit, 0),
                    totalOrders: revenueData.reduce((sum, item) => sum + item.orderCount, 0),
                    averageOrderValue:
                        revenueData.length > 0
                            ? revenueData.reduce((sum, item) => sum + item.grossRevenue, 0) /
                            revenueData.reduce((sum, item) => sum + item.orderCount, 0)
                            : 0,
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

// Get partner analytics
const getPartnerAnalytics = async (req, res) => {
    try {
        const { period = "30d", limit = 10 } = req.query
        const partnerFilter = getPartnerIdFilter(req) // This will filter for the specific partner if logged in as one

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

        const partnerPerformance = await Order.aggregate([
            { $match: { ...dateFilter, ...partnerFilter, status: "delivered" } }, // Apply partner filter
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
                $group: {
                    _id: "$partnerId",
                    partnerName: { $first: "$partner.businessName" },
                    partnerType: { $first: "$partner.partnerType" },
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    averageOrderValue: { $avg: "$totalAmount" },
                    totalProfit: { $sum: "$netProfit" },
                    averageRating: { $first: "$partner.averageRating" },
                    completionRate: {
                        $multiply: [
                            { $divide: [{ $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } }, { $sum: 1 }] },
                            100,
                        ],
                    },
                },
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: Number.parseInt(limit) },
        ])

        // Partner type distribution (only relevant for super admin)
        let partnerTypeStats = []
        if (!partnerFilter.partnerId) {
            partnerTypeStats = await Partner.aggregate([
                {
                    $group: {
                        _id: "$partnerType",
                        count: { $sum: 1 },
                        activeCount: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
                    },
                },
            ])
        }

        res.json({
            success: true,
            data: {
                topPerformers: partnerPerformance,
                partnerTypeDistribution: partnerTypeStats,
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

// Get customer analytics
const getCustomerAnalytics = async (req, res) => {
    try {
        const { period = "30d" } = req.query
        const partnerFilter = getPartnerIdFilter(req) // Apply partner filter

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

        // Customer acquisition
        const customerAcquisition = await Customer.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    newCustomers: { $sum: 1 },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ])

        // Customer lifetime value
        const customerLTV = await Order.aggregate([
            { $match: { ...partnerFilter, status: "delivered" } }, // Apply partner filter
            {
                $group: {
                    _id: "$customerId",
                    totalSpent: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 },
                    firstOrder: { $min: "$createdAt" },
                    lastOrder: { $max: "$createdAt" },
                },
            },
            {
                $group: {
                    _id: null,
                    averageLTV: { $avg: "$totalSpent" },
                    averageOrders: { $avg: "$orderCount" },
                    totalCustomers: { $sum: 1 },
                },
            },
        ])

        // Customer retention
        const retentionData = await Order.aggregate([
            { $match: { ...partnerFilter, status: "delivered" } }, // Apply partner filter
            {
                $group: {
                    _id: "$customerId",
                    orderCount: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: "$orderCount",
                    customerCount: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ])

        res.json({
            success: true,
            data: {
                customerAcquisition,
                customerLTV: customerLTV[0] || {},
                retentionData,
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

// Get drone analytics
const getDroneAnalytics = async (req, res) => {
    try {
        const { period = "30d" } = req.query
        const partnerFilter = getPartnerIdFilter(req) // Apply partner filter

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

        // Drone utilization
        const droneUtilization = await Order.aggregate([
            { $match: { ...dateFilter, ...partnerFilter, assignedDroneId: { $exists: true } } }, // Apply partner filter
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
                    successfulFlights: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
                    failedFlights: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
                    successRate: {
                        $multiply: [
                            { $divide: [{ $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } }, { $sum: 1 }] },
                            100,
                        ],
                    },
                },
            },
            { $sort: { totalFlights: -1 } },
        ])

        // Fleet status (not directly filtered by partner, but overall fleet)
        const fleetStatus = await Drone.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ])

        // Battery levels (not directly filtered by partner, but overall fleet)
        const batteryStats = await Drone.aggregate([
            {
                $group: {
                    _id: null,
                    averageBattery: { $avg: "$currentBatteryLevel" },
                    lowBatteryCount: { $sum: { $cond: [{ $lt: ["$currentBatteryLevel", 20] }, 1, 0] } },
                    totalDrones: { $sum: 1 },
                },
            },
        ])

        res.json({
            success: true,
            data: {
                droneUtilization,
                fleetStatus,
                batteryStats: batteryStats[0] || {},
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

// Get operational analytics
const getOperationalAnalytics = async (req, res) => {
    try {
        const { period = "30d" } = req.query
        const partnerFilter = getPartnerIdFilter(req) // Apply partner filter

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

        // Delivery performance
        const deliveryPerformance = await Order.aggregate([
            { $match: { ...dateFilter, ...partnerFilter, status: "delivered", deliveredAt: { $exists: true } } }, // Apply partner filter
            {
                $project: {
                    deliveryTime: {
                        $divide: [{ $subtract: ["$deliveredAt", "$createdAt"] }, 1000 * 60], // minutes
                    },
                    preparationTime: {
                        $divide: [{ $subtract: ["$preparedAt", "$confirmedAt"] }, 1000 * 60], // minutes
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    averageDeliveryTime: { $avg: "$deliveryTime" },
                    averagePreparationTime: { $avg: "$preparationTime" },
                    totalDeliveries: { $sum: 1 },
                },
            },
        ])

        // Order status distribution
        const statusDistribution = await Order.aggregate([
            { $match: { ...dateFilter, ...partnerFilter } }, // Apply partner filter
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ])

        // Peak hours analysis
        const peakHours = await Order.aggregate([
            { $match: { ...dateFilter, ...partnerFilter } }, // Apply partner filter
            {
                $group: {
                    _id: { $hour: "$createdAt" },
                    orderCount: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ])

        // Cancellation reasons (if you track them)
        const cancellationStats = await Order.aggregate([
            { $match: { ...dateFilter, ...partnerFilter, status: "cancelled" } }, // Apply partner filter
            {
                $group: {
                    _id: null,
                    totalCancellations: { $sum: 1 },
                    cancellationRate: { $sum: 1 }, // This would need total orders to calculate percentage
                },
            },
        ])

        res.json({
            success: true,
            data: {
                deliveryPerformance: deliveryPerformance[0] || {},
                statusDistribution,
                peakHours,
                cancellationStats: cancellationStats[0] || {},
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

// Export analytics
const exportAnalytics = async (req, res) => {
    try {
        const { reportType, format = "json", ...filters } = req.query

        let analyticsData
        // Simulate req and res objects for controller calls
        const mockReq = { query: filters, user: req.user }
        const mockRes = {
            json: (data) => {
                analyticsData = data
            },
            status: (code) => ({
                json: (data) => {
                    analyticsData = data
                },
            }),
        }

        switch (reportType) {
            case "dashboard":
                await getDashboardAnalytics(mockReq, mockRes)
                break
            case "sales":
                await getSalesAnalytics(mockReq, mockRes)
                break
            case "revenue":
                await getRevenueAnalytics(mockReq, mockRes)
                break
            case "partners":
                await getPartnerAnalytics(mockReq, mockRes)
                break
            case "customers":
                await getCustomerAnalytics(mockReq, mockRes)
                break
            case "drones":
                await getDroneAnalytics(mockReq, mockRes)
                break
            case "operations":
                await getOperationalAnalytics(mockReq, mockRes)
                break
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid report type",
                })
        }

        if (format === "csv") {
            res.setHeader("Content-Type", "text/csv")
            res.setHeader("Content-Disposition", `attachment; filename=${reportType}-analytics.csv`)
            res.send("CSV export functionality would be implemented here")
        } else {
            res.json({
                success: true,
                data: analyticsData,
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
    getDashboardAnalytics,
    getSalesAnalytics,
    generateDailyAnalytics,
    getRevenueAnalytics,
    getPartnerAnalytics,
    getCustomerAnalytics,
    getDroneAnalytics,
    getOperationalAnalytics,
    exportAnalytics,
}
