const { Partner, Product, Order } = require("../models")
const mongoose = require("mongoose")

// Get all partners (Admin)
const getAllPartners = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, partnerType, search } = req.query

        // Build filter
        const filter = {}
        if (status) filter.status = status
        if (partnerType) filter.partnerType = partnerType
        if (search) {
            filter.$or = [
                { businessName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { ownerName: { $regex: search, $options: "i" } },
            ]
        }

        const partners = await Partner.find(filter)
            .populate("approvedBy", "firstName lastName")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const total = await Partner.countDocuments(filter)

        res.json({
            success: true,
            data: {
                partners,
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

// Get partner by ID
const getPartnerById = async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id).populate("approvedBy", "firstName lastName")

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: "Partner not found",
            })
        }

        res.json({
            success: true,
            data: partner,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Create new partner
const createPartner = async (req, res) => {
    try {
        const partnerData = req.body

        // Check if partner already exists
        const existingPartner = await Partner.findOne({ email: partnerData.email })
        if (existingPartner) {
            return res.status(400).json({
                success: false,
                message: "Partner already exists with this email",
            })
        }

        const partner = new Partner(partnerData)
        await partner.save()

        res.status(201).json({
            success: true,
            message: "Partner created successfully",
            data: partner,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Update partner
const updatePartner = async (req, res) => {
    try {
        const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: "Partner not found",
            })
        }

        res.json({
            success: true,
            message: "Partner updated successfully",
            data: partner,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Approve/Reject partner
const updatePartnerStatus = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body
        const partnerId = req.params.id

        const updateData = {
            status,
            approvedBy: req.user.id,
            approvedAt: new Date(),
        }

        if (status === "rejected" && rejectionReason) {
            updateData.rejectionReason = rejectionReason
        }

        const partner = await Partner.findByIdAndUpdate(partnerId, updateData, { new: true })

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: "Partner not found",
            })
        }

        res.json({
            success: true,
            message: `Partner ${status} successfully`,
            data: partner,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Delete partner
const deletePartner = async (req, res) => {
    try {
        const partner = await Partner.findByIdAndDelete(req.params.id)

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: "Partner not found",
            })
        }

        // Also delete all products of this partner
        await Product.deleteMany({ partnerId: req.params.id })

        res.json({
            success: true,
            message: "Partner deleted successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get partner statistics
const getPartnerStats = async (req, res) => {
    try {
        const stats = await Partner.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                    approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
                    suspended: { $sum: { $cond: [{ $eq: ["$status", "suspended"] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
                },
            },
        ])

        const partnerTypeStats = await Partner.aggregate([
            {
                $group: {
                    _id: "$partnerType",
                    count: { $sum: 1 },
                },
            },
        ])

        res.json({
            success: true,
            data: {
                overview: stats[0] || {
                    total: 0,
                    pending: 0,
                    approved: 0,
                    suspended: 0,
                    rejected: 0,
                },
                byType: partnerTypeStats,
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

// Get partner orders
const getPartnerOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, startDate, endDate } = req.query
        const partnerId = req.params.id

        const filter = { partnerId }
        if (status) filter.status = status
        if (startDate || endDate) {
            filter.createdAt = {}
            if (startDate) filter.createdAt.$gte = new Date(startDate)
            if (endDate) filter.createdAt.$lte = new Date(endDate)
        }

        const orders = await Order.find(filter)
            .populate("customerId", "firstName lastName email")
            .populate("assignedDroneId", "droneId model")
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

// Get partner products
const getPartnerProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, isAvailable } = req.query
        const partnerId = req.params.id

        const filter = { partnerId }
        if (category) filter.category = category
        if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true"

        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const total = await Product.countDocuments(filter)

        res.json({
            success: true,
            data: {
                products,
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

// Upload partner documents
const uploadPartnerDocuments = async (req, res) => {
    try {
        const partnerId = req.params.id
        const files = req.files

        const updateData = {}
        if (files.logo) updateData.logo = files.logo[0].location || files.logo[0].path
        if (files.banner) updateData.banner = files.banner[0].location || files.banner[0].path
        if (files.license) updateData["businessLicense.documentUrl"] = files.license[0].location || files.license[0].path

        const partner = await Partner.findByIdAndUpdate(partnerId, updateData, { new: true })

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: "Partner not found",
            })
        }

        res.json({
            success: true,
            message: "Documents uploaded successfully",
            data: {
                logo: updateData.logo,
                banner: updateData.banner,
                licenseDocument: updateData["businessLicense.documentUrl"],
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
        const partnerId = req.params.id
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

        // Order analytics
        const orderAnalytics = await Order.aggregate([
            {
                $match: { partnerId: mongoose.Types.ObjectId(partnerId), ...dateFilter },
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                    averageOrderValue: { $avg: "$totalAmount" },
                    completedOrders: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
                    cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
                },
            },
        ])

        // Daily trend
        const dailyTrend = await Order.aggregate([
            {
                $match: { partnerId: mongoose.Types.ObjectId(partnerId), ...dateFilter },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    orders: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" },
                },
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ])

        // Top products
        const topProducts = await Order.aggregate([
            {
                $match: { partnerId: mongoose.Types.ObjectId(partnerId), ...dateFilter },
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    productName: { $first: "$items.name" },
                    totalOrders: { $sum: "$items.quantity" },
                    totalRevenue: { $sum: "$items.totalPrice" },
                },
            },
            { $sort: { totalOrders: -1 } },
            { $limit: 10 },
        ])

        res.json({
            success: true,
            data: {
                overview: orderAnalytics[0] || {},
                dailyTrend,
                topProducts,
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

module.exports = {
    getAllPartners,
    getPartnerById,
    createPartner,
    updatePartner,
    updatePartnerStatus,
    deletePartner,
    getPartnerStats,
    getPartnerOrders,
    getPartnerProducts,
    uploadPartnerDocuments,
    getPartnerAnalytics,
}
