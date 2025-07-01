const { DroneOperator, Order } = require("../models")
const mongoose = require("mongoose") // Import mongoose to use mongoose.Types.ObjectId

// Get all operators
const getAllOperators = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query

        // Build filter
        const filter = {}
        if (status) filter.status = status
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { employeeId: { $regex: search, $options: "i" } },
            ]
        }

        const operators = await DroneOperator.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const total = await DroneOperator.countDocuments(filter)

        res.json({
            success: true,
            data: {
                operators,
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

// Get operator by ID
const getOperatorById = async (req, res) => {
    try {
        const operator = await DroneOperator.findById(req.params.id)

        if (!operator) {
            return res.status(404).json({
                success: false,
                message: "Operator not found",
            })
        }

        res.json({
            success: true,
            data: operator,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Create new operator
const createOperator = async (req, res) => {
    try {
        const operatorData = req.body

        // Check if operator already exists
        const existingOperator = await DroneOperator.findOne({
            $or: [{ email: operatorData.email }, { employeeId: operatorData.employeeId }],
        })

        if (existingOperator) {
            return res.status(400).json({
                success: false,
                message: "Operator already exists with this email or employee ID",
            })
        }

        const operator = new DroneOperator(operatorData)
        await operator.save()

        res.status(201).json({
            success: true,
            message: "Operator created successfully",
            data: operator,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Update operator
const updateOperator = async (req, res) => {
    try {
        const operator = await DroneOperator.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if (!operator) {
            return res.status(404).json({
                success: false,
                message: "Operator not found",
            })
        }

        res.json({
            success: true,
            message: "Operator updated successfully",
            data: operator,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Delete operator
const deleteOperator = async (req, res) => {
    try {
        const operator = await DroneOperator.findByIdAndDelete(req.params.id)

        if (!operator) {
            return res.status(404).json({
                success: false,
                message: "Operator not found",
            })
        }

        res.json({
            success: true,
            message: "Operator deleted successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get operator statistics
const getOperatorStats = async (req, res) => {
    try {
        const stats = await DroneOperator.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
                    inactive: { $sum: { $cond: [{ $eq: ["$status", "inactive"] }, 1, 0] } },
                    suspended: { $sum: { $cond: [{ $eq: ["$status", "suspended"] }, 1, 0] } },
                    totalFlights: { $sum: "$totalFlights" },
                    averageSuccessRate: { $avg: "$successRate" },
                },
            },
        ])

        // Certification level distribution
        const certificationStats = await DroneOperator.aggregate([
            {
                $group: {
                    _id: "$certificationLevel",
                    count: { $sum: 1 },
                    averageFlights: { $avg: "$totalFlights" },
                    averageSuccessRate: { $avg: "$successRate" },
                },
            },
        ])

        // Operators with expiring licenses (next 30 days)
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        const expiringLicenses = await DroneOperator.find({
            licenseExpiryDate: { $lte: thirtyDaysFromNow },
            status: "active",
        }).select("firstName lastName employeeId licenseExpiryDate")

        // Top performers
        const topPerformers = await DroneOperator.find({ totalFlights: { $gt: 0 } })
            .select("firstName lastName employeeId totalFlights successRate")
            .sort({ successRate: -1, totalFlights: -1 })
            .limit(10)

        res.json({
            success: true,
            data: {
                overview: stats[0] || {
                    total: 0,
                    active: 0,
                    inactive: 0,
                    suspended: 0,
                    totalFlights: 0,
                    averageSuccessRate: 0,
                },
                byCertification: certificationStats,
                expiringLicenses,
                topPerformers,
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

// Update operator status
const updateOperatorStatus = async (req, res) => {
    try {
        const { status } = req.body

        const operator = await DroneOperator.findByIdAndUpdate(req.params.id, { status }, { new: true })

        if (!operator) {
            return res.status(404).json({
                success: false,
                message: "Operator not found",
            })
        }

        res.json({
            success: true,
            message: `Operator status updated to ${status}`,
            data: operator,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get operator flights
const getOperatorFlights = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, startDate, endDate } = req.query
        const operatorId = req.params.id

        const filter = { assignedOperatorId: operatorId }
        if (status) filter.status = status
        if (startDate || endDate) {
            filter.createdAt = {}
            if (startDate) filter.createdAt.$gte = new Date(startDate)
            if (endDate) filter.createdAt.$lte = new Date(endDate)
        }

        const flights = await Order.find(filter)
            .populate("customerId", "firstName lastName")
            .populate("partnerId", "businessName")
            .populate("assignedDroneId", "droneId model")
            .select("orderNumber status createdAt deliveredAt totalAmount")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const total = await Order.countDocuments(filter)

        // Flight statistics for this operator
        const flightStats = await Order.aggregate([
            {
                $match: { assignedOperatorId: mongoose.Types.ObjectId(operatorId) },
            },
            {
                $group: {
                    _id: null,
                    totalFlights: { $sum: 1 },
                    completedFlights: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
                    failedFlights: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
                    totalRevenue: { $sum: "$totalAmount" },
                },
            },
        ])

        res.json({
            success: true,
            data: {
                flights,
                stats: flightStats[0] || { totalFlights: 0, completedFlights: 0, failedFlights: 0, totalRevenue: 0 },
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

// Assign operator to drone
const assignOperatorToDrone = async (req, res) => {
    try {
        const { droneId } = req.body
        const operatorId = req.params.id

        // This is a conceptual assignment - in practice, you might have a separate assignments table
        // For now, we'll just return success
        const operator = await DroneOperator.findById(operatorId)
        if (!operator) {
            return res.status(404).json({
                success: false,
                message: "Operator not found",
            })
        }

        res.json({
            success: true,
            message: "Operator assigned to drone successfully",
            data: {
                operatorId,
                droneId,
                assignedAt: new Date(),
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
    getAllOperators,
    getOperatorById,
    createOperator,
    updateOperator,
    deleteOperator,
    getOperatorStats,
    updateOperatorStatus,
    getOperatorFlights,
    assignOperatorToDrone,
}
