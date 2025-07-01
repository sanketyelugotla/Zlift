const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { AdminUser, Customer } = require("../models")

// Generate JWT Token
const generateToken = (id, role, userType) => {
    return jwt.sign({ id, role, userType }, process.env.JWT_SECRET, { expiresIn: "30d" })
}

// Admin Login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        // Find admin user
        const admin = await AdminUser.findOne({ email, isActive: true })
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            })
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, admin.password)
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            })
        }

        // Update last login
        admin.lastLogin = new Date()
        await admin.save()

        // Generate token
        const token = generateToken(admin._id, admin.role, "admin")

        res.json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: admin._id,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    email: admin.email,
                    role: admin.role,
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

// Customer Login
const customerLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        // Find customer
        const customer = await Customer.findOne({ email, isActive: true })
        if (!customer) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            })
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, customer.password)
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            })
        }

        // Update last login
        customer.lastLogin = new Date()
        await customer.save()

        // Generate token
        const token = generateToken(customer._id, "customer", "customer")

        res.json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: customer._id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    phone: customer.phone,
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

// Customer Registration
const customerRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password } = req.body

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

        // Create customer
        const customer = new Customer({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
        })

        await customer.save()

        // Generate token
        const token = generateToken(customer._id, "customer", "customer")

        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
                token,
                user: {
                    id: customer._id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    phone: customer.phone,
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

// Refresh Token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required",
            })
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)

        let user
        if (decoded.userType === "admin") {
            user = await AdminUser.findById(decoded.id)
        } else {
            user = await Customer.findById(decoded.id)
        }

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            })
        }

        // Generate new access token
        const newToken = generateToken(user._id, user.role || "customer", decoded.userType)

        res.json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                token: newToken,
            },
        })
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid refresh token",
        })
    }
}

// Logout
const logout = async (req, res) => {
    try {
        // In a real implementation, you might want to blacklist the token
        // For now, we'll just return success
        res.json({
            success: true,
            message: "Logged out successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const { email, userType = "customer" } = req.body

        let user
        if (userType === "admin") {
            user = await AdminUser.findOne({ email, isActive: true })
        } else {
            user = await Customer.findOne({ email, isActive: true })
        }

        if (!user) {
            // Don't reveal if user exists or not
            return res.json({
                success: true,
                message: "If the email exists, a reset link has been sent",
            })
        }

        // Generate reset token
        const resetToken = jwt.sign({ id: user._id, userType }, process.env.JWT_SECRET, { expiresIn: "1h" })

        // In a real implementation, send email with reset link
        // For now, we'll just return the token (remove this in production)
        res.json({
            success: true,
            message: "Password reset link sent to your email",
            // Remove this in production:
            resetToken: resetToken,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body

        // Verify reset token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        let user
        if (decoded.userType === "admin") {
            user = await AdminUser.findById(decoded.id)
        } else {
            user = await Customer.findById(decoded.id)
        }

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        user.password = hashedPassword
        await user.save()

        res.json({
            success: true,
            message: "Password reset successfully",
        })
    } catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            })
        }

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Change Password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body
        const userId = req.user.id
        const userType = req.user.userType

        let user
        if (userType === "admin") {
            user = await AdminUser.findById(userId)
        } else {
            user = await Customer.findById(userId)
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect",
            })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        user.password = hashedPassword
        await user.save()

        res.json({
            success: true,
            message: "Password changed successfully",
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
    adminLogin,
    customerLogin,
    customerRegister,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
}
