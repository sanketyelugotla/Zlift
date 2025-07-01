const { Drone, Order } = require("../models")

// Get all drones
const getAllDrones = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query

        // Build filter
        const filter = {}
        if (status) filter.status = status
        if (search) {
            filter.$or = [
                { droneId: { $regex: search, $options: "i" } },
                { model: { $regex: search, $options: "i" } },
                { manufacturer: { $regex: search, $options: "i" } },
            ]
        }

        const drones = await Drone.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const total = await Drone.countDocuments(filter)

        res.json({
            success: true,
            data: {
                drones,
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

// Get drone by ID
const getDroneById = async (req, res) => {
    try {
        const drone = await Drone.findById(req.params.id)

        if (!drone) {
            return res.status(404).json({
                success: false,
                message: "Drone not found",
            })
        }

        res.json({
            success: true,
            data: drone,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Create new drone
const createDrone = async (req, res) => {
    try {
        const droneData = req.body

        // Check if drone ID already exists
        const existingDrone = await Drone.findOne({ droneId: droneData.droneId })
        if (existingDrone) {
            return res.status(400).json({
                success: false,
                message: "Drone with this ID already exists",
            })
        }

        const drone = new Drone(droneData)
        await drone.save()

        res.status(201).json({
            success: true,
            message: "Drone created successfully",
            data: drone,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Update drone
const updateDrone = async (req, res) => {
    try {
        const drone = await Drone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

        if (!drone) {
            return res.status(404).json({
                success: false,
                message: "Drone not found",
            })
        }

        res.json({
            success: true,
            message: "Drone updated successfully",
            data: drone,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Delete drone
const deleteDrone = async (req, res) => {
    try {
        const drone = await Drone.findByIdAndDelete(req.params.id)

        if (!drone) {
            return res.status(404).json({
                success: false,
                message: "Drone not found",
            })
        }

        res.json({
            success: true,
            message: "Drone deleted successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get drone statistics
const getDroneStats = async (req, res) => {
    try {
        const stats = await Drone.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    available: { $sum: { $cond: [{ $eq: ["$status", "available"] }, 1, 0] } },
                    inFlight: { $sum: { $cond: [{ $eq: ["$status", "in_flight"] }, 1, 0] } },
                    maintenance: { $sum: { $cond: [{ $eq: ["$status", "maintenance"] }, 1, 0] } },
                    charging: { $sum: { $cond: [{ $eq: ["$status", "charging"] }, 1, 0] } },
                    offline: { $sum: { $cond: [{ $eq: ["$status", "offline"] }, 1, 0] } },
                    totalFlights: { $sum: "$totalFlights" },
                    totalDistance: { $sum: "$totalDistanceKm" },
                    totalFlightHours: { $sum: "$totalFlightHours" },
                    averageBattery: { $avg: "$currentBatteryLevel" },
                },
            },
        ])

        // Drone utilization by model
        const modelStats = await Drone.aggregate([
            {
                $group: {
                    _id: "$model",
                    count: { $sum: 1 },
                    totalFlights: { $sum: "$totalFlights" },
                    totalDistance: { $sum: "$totalDistanceKm" },
                    averageBattery: { $avg: "$currentBatteryLevel" },
                },
            },
        ])

        // Drones needing maintenance
        const maintenanceNeeded = await Drone.find({
            $or: [{ nextMaintenanceDate: { $lte: new Date() } }, { status: "maintenance" }],
        }).select("droneId model nextMaintenanceDate status")

        res.json({
            success: true,
            data: {
                overview: stats[0] || {
                    total: 0,
                    available: 0,
                    inFlight: 0,
                    maintenance: 0,
                    charging: 0,
                    offline: 0,
                    totalFlights: 0,
                    totalDistance: 0,
                    totalFlightHours: 0,
                    averageBattery: 0,
                },
                byModel: modelStats,
                maintenanceNeeded,
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

// Update drone status
const updateDroneStatus = async (req, res) => {
    try {
        const { status, batteryLevel, location } = req.body

        const updateData = { status }
        if (batteryLevel !== undefined) updateData.currentBatteryLevel = batteryLevel
        if (location) {
            updateData.currentLocation = {
                latitude: location.latitude,
                longitude: location.longitude,
                lastUpdated: new Date(),
            }
        }

        const drone = await Drone.findByIdAndUpdate(req.params.id, updateData, { new: true })

        if (!drone) {
            return res.status(404).json({
                success: false,
                message: "Drone not found",
            })
        }

        res.json({
            success: true,
            message: "Drone status updated successfully",
            data: drone,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get drone location
const getDroneLocation = async (req, res) => {
    try {
        const drone = await Drone.findById(req.params.id).select("droneId currentLocation status currentBatteryLevel")

        if (!drone) {
            return res.status(404).json({
                success: false,
                message: "Drone not found",
            })
        }

        res.json({
            success: true,
            data: {
                droneId: drone.droneId,
                location: drone.currentLocation,
                status: drone.status,
                batteryLevel: drone.currentBatteryLevel,
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

// Update drone location
const updateDroneLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body

        const drone = await Drone.findByIdAndUpdate(
            req.params.id,
            {
                currentLocation: {
                    latitude,
                    longitude,
                    lastUpdated: new Date(),
                },
            },
            { new: true },
        )

        if (!drone) {
            return res.status(404).json({
                success: false,
                message: "Drone not found",
            })
        }

        res.json({
            success: true,
            message: "Drone location updated successfully",
            data: drone.currentLocation,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get drone flight history
const getDroneFlightHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, startDate, endDate } = req.query
        const droneId = req.params.id

        const filter = { assignedDroneId: droneId }
        if (startDate || endDate) {
            filter.createdAt = {}
            if (startDate) filter.createdAt.$gte = new Date(startDate)
            if (endDate) filter.createdAt.$lte = new Date(endDate)
        }

        const flights = await Order.find(filter)
            .populate("customerId", "firstName lastName")
            .populate("partnerId", "businessName")
            .populate("assignedOperatorId", "firstName lastName employeeId")
            .select("orderNumber status createdAt deliveredAt pickupAddress deliveryAddress")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const total = await Order.countDocuments(filter)

        res.json({
            success: true,
            data: {
                flights,
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

// Schedule maintenance
const scheduleMaintenance = async (req, res) => {
    try {
        const { maintenanceDate, notes } = req.body

        const drone = await Drone.findByIdAndUpdate(
            req.params.id,
            {
                nextMaintenanceDate: new Date(maintenanceDate),
                maintenanceNotes: notes,
                status: "maintenance",
            },
            { new: true },
        )

        if (!drone) {
            return res.status(404).json({
                success: false,
                message: "Drone not found",
            })
        }

        res.json({
            success: true,
            message: "Maintenance scheduled successfully",
            data: drone,
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
    getAllDrones,
    getDroneById,
    createDrone,
    updateDrone,
    deleteDrone,
    getDroneStats,
    updateDroneStatus,
    getDroneLocation,
    updateDroneLocation,
    getDroneFlightHistory,
    scheduleMaintenance,
}
