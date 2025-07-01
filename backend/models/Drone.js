const mongoose = require("mongoose")

const droneSchema = new mongoose.Schema(
    {
        // Identification
        droneId: {
            type: String,
            unique: true,
            required: true,
        },

        model: {
            type: String,
            required: true,
        },

        manufacturer: {
            type: String,
            required: true,
        },

        // Specifications
        maxPayload: {
            type: Number,
            required: true, // kg
        },

        maxRange: {
            type: Number,
            required: true, // km
        },

        maxFlightTime: {
            type: Number,
            required: true, // minutes
        },

        batteryCapacity: {
            type: Number,
            required: true, // mAh
        },

        // Current Status
        status: {
            type: String,
            enum: ["available", "in_flight", "maintenance", "charging", "offline"],
            default: "available",
        },

        currentBatteryLevel: {
            type: Number,
            min: 0,
            max: 100,
            default: 100,
        },

        currentLocation: {
            latitude: Number,
            longitude: Number,
            lastUpdated: Date,
        },

        // Operational Stats
        totalFlights: {
            type: Number,
            default: 0,
        },

        totalDistanceKm: {
            type: Number,
            default: 0,
        },

        totalFlightHours: {
            type: Number,
            default: 0,
        },

        // Maintenance
        lastMaintenanceDate: Date,
        nextMaintenanceDate: Date,
        maintenanceNotes: String,
    },
    {
        timestamps: true,
    },
)

// Indexes
droneSchema.index({ droneId: 1 })
droneSchema.index({ status: 1 })

module.exports = mongoose.model("Drone", droneSchema)
