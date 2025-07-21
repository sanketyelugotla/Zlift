const mongoose = require("mongoose")

const adminUserSchema = new mongoose.Schema(
    {
        // Basic Information
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

        phone: String,

        // Authentication
        password: {
            type: String,
            required: true,
        },

        // Role and Permissions
        role: {
            type: String,
            enum: [
                "super_admin",
                "operations_manager",
                "customer_support",
                "partner_manager",
                "drone_operator_manager",
                "finance_manager",
            ],
            required: true,
        },

        permissions: [
            {
                module: String, // 'partners', 'orders', 'customers', etc.
                actions: [String], // ['read', 'write', 'delete']
            },
        ],

        // Status
        isActive: {
            type: Boolean,
            default: true,
        },

        // Security
        lastLogin: Date,
        loginAttempts: {
            type: Number,
            default: 0,
        },

        lockUntil: Date,
    },
    {
        timestamps: true,
    },
)

// Indexes
// adminUserSchema.index({ email: 1 })
adminUserSchema.index({ role: 1 })

module.exports = mongoose.model("AdminUser", adminUserSchema)
