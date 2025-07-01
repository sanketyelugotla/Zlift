const mongoose = require("mongoose")

const droneOperatorSchema = new mongoose.Schema(
    {
        // Personal Information
        employeeId: {
            type: String,
            unique: true,
            required: true,
        },

        firstName: {
            type: String,
            required: true,
        },

        lastName: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        phone: {
            type: String,
            required: true,
        },

        // Certification
        licenseNumber: {
            type: String,
            required: true,
        },

        licenseExpiryDate: {
            type: Date,
            required: true,
        },

        certificationLevel: {
            type: String,
            enum: ["basic", "intermediate", "advanced"],
            required: true,
        },

        // Work Schedule
        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active",
        },

        shiftStart: String, // "09:00"
        shiftEnd: String, // "18:00"

        // Performance Stats
        totalFlights: {
            type: Number,
            default: 0,
        },

        successRate: {
            type: Number,
            default: 100.0,
        },
    },
    {
        timestamps: true,
    },
)

// Indexes
droneOperatorSchema.index({ employeeId: 1 })
droneOperatorSchema.index({ status: 1 })

module.exports = mongoose.model("DroneOperator", droneOperatorSchema)
