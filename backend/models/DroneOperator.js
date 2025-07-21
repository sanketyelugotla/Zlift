const mongoose = require("mongoose")

const droneOperatorSchema = new mongoose.Schema(
    {
        // Basic Information
        employeeId: {
            type: String,
            required: true,
            unique: true,
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
            lowercase: true,
        },

        phone: {
            type: String,
            required: true,
        },

        dateOfBirth: Date,

        // Address
        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
        },

        // Employment Details
        hireDate: {
            type: Date,
            default: Date.now,
        },

        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active",
        },

        // Licensing & Certification
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

        certifications: [
            {
                name: String,
                issuedBy: String,
                issuedDate: Date,
                expiryDate: Date,
                certificateNumber: String,
            },
        ],

        // Performance Metrics
        totalFlights: {
            type: Number,
            default: 0,
        },

        successfulFlights: {
            type: Number,
            default: 0,
        },

        failedFlights: {
            type: Number,
            default: 0,
        },

        successRate: {
            type: Number,
            default: 100,
        },

        averageFlightTime: {
            type: Number,
            default: 0,
        },

        // Current Assignment
        currentDroneId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Drone",
        },

        isOnDuty: {
            type: Boolean,
            default: false,
        },

        currentShift: {
            startTime: Date,
            endTime: Date,
        },

        // Training Records
        trainingRecords: [
            {
                trainingType: String,
                completedDate: Date,
                instructor: String,
                score: Number,
                notes: String,
            },
        ],

        // Emergency Contacts
        emergencyContacts: [
            {
                name: String,
                relationship: String,
                phone: String,
            },
        ],
    },
    {
        timestamps: true,
    },
)

// Indexes
// droneOperatorSchema.index({ employeeId: 1 })
// droneOperatorSchema.index({ email: 1 })
droneOperatorSchema.index({ status: 1 })
droneOperatorSchema.index({ licenseExpiryDate: 1 })

module.exports = mongoose.model("DroneOperator", droneOperatorSchema)
