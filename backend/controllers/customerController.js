const { Customer, Order } = require("../models")
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose") // Import mongoose to fix undeclared variable error

// Get all customers (Admin)
const getAllCustomers = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive, search, startDate, endDate } = req.query

        // Build filter
        const filter = {}
        if (isActive !== undefined) filter.isActive = isActive === "true"
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ]
        }

        if (startDate || endDate) {
            filter.createdAt = {}
            if (startDate) filter.createdAt.$gte = new Date(startDate)
            if (endDate) filter.createdAt.$lte = new Date(endDate)
        }

        const customers = await Customer.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const total = await Customer.countDocuments(filter)

        res.json({
            success: true,
            data: {
                customers,
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

// Get customer by ID
const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id).select("-password")

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            })
        }

        res.json({
            success: true,
            data: customer,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Create new customer
const createCustomer = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, ...otherData } = req.body

        // Check if customer already exists
        const existingCustomer = await Customer.findOne({
            $or: [{ email }, { phone }],
        })

        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: "Customer already exists with this email or phone",
            })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        const customer = new Customer({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            ...otherData,
        })

        await customer.save()

        // Remove password from response
        const customerResponse = customer.toObject()
        delete customerResponse.password

        res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: customerResponse,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Update customer
const updateCustomer = async (req, res) => {
    try {
        const updateData = req.body

        // If password is being updated, hash it
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 12)
        }

        const customer = await Customer.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        }).select("-password")

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            })
        }

        res.json({
            success: true,
            message: "Customer updated successfully",
            data: customer,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Delete customer
const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id)

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            })
        }

        res.json({
            success: true,
            message: "Customer deleted successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get customer statistics
const getCustomerStats = async (req, res) => {
    try {
        const stats = await Customer.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: { $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] } },
                    emailVerified: { $sum: { $cond: [{ $eq: ["$isEmailVerified", true] }, 1, 0] } },
                    phoneVerified: { $sum: { $cond: [{ $eq: ["$isPhoneVerified", true] }, 1, 0] } },
                    totalSpent: { $sum: "$totalSpent" },
                    averageSpent: { $avg: "$totalSpent" },
                    totalOrders: { $sum: "$totalOrders" },
                },
            },
        ])

        // Customer registration trend (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const registrationTrend = await Customer.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
            },
        ])

        // Top customers by spending
        const topCustomers = await Customer.find({ totalSpent: { $gt: 0 } })
            .select("firstName lastName email totalSpent totalOrders")
            .sort({ totalSpent: -1 })
            .limit(10)

        res.json({
            success: true,
            data: {
                overview: stats[0] || {
                    total: 0,
                    active: 0,
                    emailVerified: 0,
                    phoneVerified: 0,
                    totalSpent: 0,
                    averageSpent: 0,
                    totalOrders: 0,
                },
                registrationTrend,
                topCustomers,
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

// Get customer orders
const getCustomerOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query
        const customerId = req.params.id

        const filter = { customerId }
        if (status) filter.status = status

        const orders = await Order.find(filter)
            .populate("partnerId", "businessName partnerType")
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

// Update customer status
const updateCustomerStatus = async (req, res) => {
    try {
        const { isActive } = req.body

        const customer = await Customer.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select("-password")

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            })
        }

        res.json({
            success: true,
            message: `Customer ${isActive ? "activated" : "deactivated"} successfully`,
            data: customer,
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
        const customerId = req.params.id

        // Customer order analytics
        const orderAnalytics = await Order.aggregate([
            {
                $match: { customerId: mongoose.Types.ObjectId(customerId) },
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: "$totalAmount" },
                    averageOrderValue: { $avg: "$totalAmount" },
                    completedOrders: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
                    cancelledOrders: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
                },
            },
        ])

        // Monthly spending trend
        const spendingTrend = await Order.aggregate([
            {
                $match: {
                    customerId: mongoose.Types.ObjectId(customerId),
                    status: "delivered",
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    totalSpent: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 },
            },
        ])

        // Favorite partners
        const favoritePartners = await Order.aggregate([
            {
                $match: {
                    customerId: mongoose.Types.ObjectId(customerId),
                    status: "delivered",
                },
            },
            {
                $group: {
                    _id: "$partnerId",
                    orderCount: { $sum: 1 },
                    totalSpent: { $sum: "$totalAmount" },
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
                    orderCount: 1,
                    totalSpent: 1,
                },
            },
            {
                $sort: { orderCount: -1 },
            },
            {
                $limit: 5,
            },
        ])

        res.json({
            success: true,
            data: {
                orderAnalytics: orderAnalytics[0] || {},
                spendingTrend,
                favoritePartners,
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
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerStats,
    getCustomerOrders,
    updateCustomerStatus,
    getCustomerAnalytics,
}
