const { AdminUser } = require("../models")
const bcrypt = require("bcryptjs")

// Get all admins
const getAllAdmins = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, isActive, search } = req.query

        // Build filter
        const filter = {}
        if (role) filter.role = role
        if (isActive !== undefined) filter.isActive = isActive === "true"
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ]
        }

        const admins = await AdminUser.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)

        const total = await AdminUser.countDocuments(filter)

        res.json({
            success: true,
            data: {
                admins,
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

// Get admin by ID
const getAdminById = async (req, res) => {
    try {
        const admin = await AdminUser.findById(req.params.id).select("-password")

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            })
        }

        res.json({
            success: true,
            data: admin,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Create new admin
const createAdmin = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, permissions, phone } = req.body

        // Check if admin already exists
        const existingAdmin = await AdminUser.findOne({ email })
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists with this email",
            })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        const admin = new AdminUser({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role,
            permissions,
            phone,
        })

        await admin.save()

        // Remove password from response
        const adminResponse = admin.toObject()
        delete adminResponse.password

        res.status(201).json({
            success: true,
            message: "Admin created successfully",
            data: adminResponse,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Update admin
const updateAdmin = async (req, res) => {
    try {
        const updateData = req.body

        // If password is being updated, hash it
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 12)
        }

        const admin = await AdminUser.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        }).select("-password")

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            })
        }

        res.json({
            success: true,
            message: "Admin updated successfully",
            data: admin,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Delete admin
const deleteAdmin = async (req, res) => {
    try {
        // Prevent deleting self
        if (req.params.id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete your own account",
            })
        }

        const admin = await AdminUser.findByIdAndDelete(req.params.id)

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            })
        }

        res.json({
            success: true,
            message: "Admin deleted successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Update admin status
const updateAdminStatus = async (req, res) => {
    try {
        const { isActive } = req.body

        // Prevent deactivating self
        if (req.params.id === req.user.id && !isActive) {
            return res.status(400).json({
                success: false,
                message: "Cannot deactivate your own account",
            })
        }

        const admin = await AdminUser.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select("-password")

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            })
        }

        res.json({
            success: true,
            message: `Admin ${isActive ? "activated" : "deactivated"} successfully`,
            data: admin,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Update admin permissions
const updateAdminPermissions = async (req, res) => {
    try {
        const { permissions } = req.body

        const admin = await AdminUser.findByIdAndUpdate(req.params.id, { permissions }, { new: true }).select("-password")

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            })
        }

        res.json({
            success: true,
            message: "Admin permissions updated successfully",
            data: admin,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get admin profile
const getAdminProfile = async (req, res) => {
    try {
        const admin = await AdminUser.findById(req.user.id).select("-password")

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            })
        }

        res.json({
            success: true,
            data: admin,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Update admin profile
const updateAdminProfile = async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body

        const admin = await AdminUser.findByIdAndUpdate(
            req.user.id,
            { firstName, lastName, phone },
            { new: true, runValidators: true },
        ).select("-password")

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
            })
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: admin,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get system settings (placeholder)
const getSystemSettings = async (req, res) => {
    try {
        // This would typically fetch from a settings collection
        const settings = {
            deliveryFee: 25,
            maxDeliveryDistance: 20,
            orderPreparationBuffer: 10,
            droneBatteryThreshold: 20,
            customerSupportPhone: "+91-1800-123-4567",
            maintenanceMode: false,
            allowNewRegistrations: true,
        }

        res.json({
            success: true,
            data: settings,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Update system settings (placeholder)
const updateSystemSettings = async (req, res) => {
    try {
        const settings = req.body

        // This would typically update a settings collection
        // For now, just return the updated settings
        res.json({
            success: true,
            message: "System settings updated successfully",
            data: settings,
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
    getAllAdmins,
    getAdminById,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    updateAdminStatus,
    updateAdminPermissions,
    getAdminProfile,
    updateAdminProfile,
    getSystemSettings,
    updateSystemSettings,
}
