const mongoose = require("mongoose")

const droneSchema = new mongoose.Schema(
    {
        // Basic Information
        droneId: {
            type: String,
            required: true,
            unique: true,
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
            type: Number, // in kg
            required: true,
        },

        maxRange: {
            type: Number, // in km
            required: true,
        },

        maxFlightTime: {
            type: Number, // in minutes
            required: true,
        },

        batteryCapacity: {
            type: Number, // in mAh
            required: true,
        },

        // Current Status
        status: {
            type: String,
            enum: ["available", "in_flight", "maintenance", "charging", "offline"],
            default: "available",
        },

        currentBatteryLevel: {
            type: Number, // percentage
            default: 100,
        },

        currentLocation: {
            latitude: Number,
            longitude: Number,
            lastUpdated: Date,
        },

        // Operational Data
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

        // Registration & Compliance
        registrationNumber: String,
        insuranceDetails: {
            provider: String,
            policyNumber: String,
            expiryDate: Date,
        },

        // Operational Limits
        operationalAltitude: {
            type: Number, // in meters
            default: 120,
        },

        weatherLimitations: {
            maxWindSpeed: { type: Number, default: 15 }, // km/h
            minVisibility: { type: Number, default: 1000 }, // meters
            maxRainfall: { type: Number, default: 0 }, // mm/h
        },
    },
    {
        timestamps: true,
    },
)

// Indexes
droneSchema.index({ droneId: 1 })
droneSchema.index({ status: 1 })
droneSchema.index({ "currentLocation.latitude": 1, "currentLocation.longitude": 1 })

module.exports = mongoose.model("Drone", droneSchema)
