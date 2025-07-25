const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { AdminUser, Customer, Partner } = require("../models") // Added Partner model

// Generate JWT Token
const generateToken = (id, role, userType) => {
    return jwt.sign({ id, role, userType }, process.env.JWT_SECRET, { expiresIn: "30d" })
}

// Generate Refresh Token
const generateRefreshToken = (id, role, userType) => {
    return jwt.sign({ id, role, userType }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" })
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
        // console.log(admin)

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

        // Generate tokens
        const token = generateToken(admin._id, admin.role, "admin")
        const refreshToken = generateRefreshToken(admin._id, admin.role, "admin")

        res.json({
            success: true,
            message: "Login successful",
            data: {
                token,
                refreshToken,
                user: {
                    id: admin._id,
                    name: `${admin.firstName} ${admin.lastName}`,
                    email: admin.email,
                    role: admin.role,
                    permissions: admin.permissions,
                    userType: "admin", // Explicitly add userType
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

// Admin Signup - Creates partner_manager by default
const adminSignup = async (req, res) => {
    console.log("signup")
    try {
        const { firstName, lastName, email, password, phone, role = "partner_manager" } = req.body

        // Check if admin already exists
        const existingAdmin = await AdminUser.findOne({ email })
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Admin user already exists with this email",
            })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Define permissions based on role
        let permissions = []

        if (role === "partner_manager") {
            permissions = [
                { module: "dashboard", actions: ["read"] },
                { module: "partners", actions: ["read", "write", "update"] },
                { module: "products", actions: ["read", "write", "update"] },
                { module: "orders", actions: ["read", "update"] },
                { module: "analytics", actions: ["read"] },
                { module: "reports", actions: ["read"] },
            ]
        } else if (role === "operations_manager") {
            permissions = [
                { module: "dashboard", actions: ["read"] },
                { module: "orders", actions: ["read", "write", "update", "delete"] },
                { module: "drones", actions: ["read", "write", "update"] },
                { module: "operators", actions: ["read", "write"] },
                { module: "customers", actions: ["read"] },
                { module: "analytics", actions: ["read"] },
            ]
        } else if (role === "customer_support") {
            permissions = [
                { module: "dashboard", actions: ["read"] },
                { module: "customers", actions: ["read", "write", "update"] },
                { module: "orders", actions: ["read", "update"] },
                { module: "support", actions: ["read", "write"] },
            ]
        }

        // Create admin user
        const admin = new AdminUser({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            role,
            permissions,
        })

        await admin.save()

        res.status(201).json({
            success: true,
            message: "Admin account created successfully",
            data: {
                user: {
                    id: admin._id,
                    name: `${admin.firstName} ${admin.lastName}`,
                    email: admin.email,
                    role: admin.role,
                    permissions: admin.permissions,
                    userType: "admin", // Explicitly add userType
                },
            },
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Create Super Admin - Only for initial setup
const createSuperAdmin = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, secretKey } = req.body

        // Check secret key for super admin creation
        if (secretKey !== process.env.SUPER_ADMIN_SECRET) {
            return res.status(403).json({
                success: false,
                message: "Invalid secret key",
            })
        }

        // Check if super admin already exists
        const existingSuperAdmin = await AdminUser.findOne({ role: "super_admin" })
        if (existingSuperAdmin) {
            return res.status(400).json({
                success: false,
                message: "Super admin already exists",
            })
        }

        // Check if admin already exists with this email
        const existingAdmin = await AdminUser.findOne({ email })
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Admin user already exists with this email",
            })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Super admin has all permissions
        const permissions = [
            { module: "dashboard", actions: ["read"] },
            { module: "partners", actions: ["read", "write", "update", "delete"] },
            { module: "products", actions: ["read", "write", "update", "delete"] },
            { module: "customers", actions: ["read", "write", "update", "delete"] },
            { module: "orders", actions: ["read", "write", "update", "delete"] },
            { module: "payments", actions: ["read", "write", "update"] },
            { module: "drones", actions: ["read", "write", "update", "delete"] },
            { module: "operators", actions: ["read", "write", "update", "delete"] },
            { module: "admin", actions: ["read", "write", "update", "delete"] },
            { module: "analytics", actions: ["read"] },
            { module: "reports", actions: ["read"] },
            { module: "settings", actions: ["read", "write", "update"] },
        ]

        // Create super admin user
        const superAdmin = new AdminUser({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            role: "super_admin",
            permissions,
        })

        await superAdmin.save()

        res.status(201).json({
            success: true,
            message: "Super admin account created successfully",
            data: {
                user: {
                    id: superAdmin._id,
                    name: `${superAdmin.firstName} ${superAdmin.lastName}`,
                    email: superAdmin.email,
                    role: superAdmin.role,
                    userType: "admin", // Explicitly add userType
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
        // console.log(customer)

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

        // Generate tokens
        const token = generateToken(customer._id, "customer", "customer")
        const refreshToken = generateRefreshToken(customer._id, "customer", "customer")

        res.json({
            success: true,
            message: "Login successful",
            data: {
                token,
                refreshToken,
                user: {
                    id: customer._id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    phone: customer.phone,
                    userType: "customer", // Explicitly add userType
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

        // Generate tokens
        const token = generateToken(customer._id, "customer", "customer")
        const refreshToken = generateRefreshToken(customer._id, "customer", "customer")

        res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
                token,
                refreshToken,
                user: {
                    id: customer._id,
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    phone: customer.phone,
                    userType: "customer", // Explicitly add userType
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

// Partner Login
const partnerLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        // Find partner
        const partner = await Partner.findOne({ email, isActive: true })
        if (!partner) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            })
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, partner.password)
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            })
        }

        // Update last login
        partner.lastLogin = new Date()
        await partner.save()

        // Generate tokens
        const token = generateToken(partner._id, "partner", "partner")
        const refreshToken = generateRefreshToken(partner._id, "partner", "partner")

        res.json({
            success: true,
            message: "Login successful",
            data: {
                token,
                refreshToken,
                user: {
                    id: partner._id,
                    ownerName: partner.ownerName,
                    email: partner.email,
                    phone: partner.phone,
                    businessName: partner.businessName,
                    partnerType: partner.partnerType,
                    outlets: partner.outlets, // Include outlets
                    userType: "partner", // Explicitly add userType
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

// Partner Registration
const partnerRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, businessName, partnerType, street, city, state, pincode } =
            req.body

        // Check if partner already exists with this email or phone
        const existingPartner = await Partner.findOne({
            $or: [{ email }, { phone }],
        })

        if (existingPartner) {
            return res.status(400).json({
                success: false,
                message: "Partner already exists with this email or phone",
            })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create partner
        const partner = new Partner({
            ownerName: `${firstName} ${lastName}`,
            email,
            phone,
            password: hashedPassword,
            businessName,
            partnerType,
            address: {
                street,
                city,
                state,
                pincode,
                // coordinates will be added later if needed
            },
        })

        await partner.save()

        // Generate tokens
        const token = generateToken(partner._id, "partner", "partner")
        const refreshToken = generateRefreshToken(partner._id, "partner", "partner")

        res.status(201).json({
            success: true,
            message: "Partner account created successfully",
            data: {
                token,
                refreshToken,
                user: {
                    id: partner._id,
                    ownerName: partner.ownerName,
                    email: partner.email,
                    phone: partner.phone,
                    businessName: partner.businessName,
                    partnerType: partner.partnerType,
                    outlets: partner.outlets, // Should be empty array initially
                    userType: "partner", // Explicitly add userType
                },
            },
        })
    } catch (error) {
        console.log(error)
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
        } else if (decoded.userType === "customer") {
            user = await Customer.findById(decoded.id)
        } else if (decoded.userType === "partner") {
            user = await Partner.findById(decoded.id).populate("outlets") // Populate outlets for partner
        }

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token",
            })
        }

        // Generate new access token
        const newToken = generateToken(user._id, user.role || "customer", decoded.userType) // Use user.role for admin/partner, default to customer

        // Prepare user data for response based on userType
        let userData = {}
        if (decoded.userType === "admin") {
            userData = {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                userType: "admin",
            }
        } else if (decoded.userType === "customer") {
            userData = {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                userType: "customer",
            }
        } else if (decoded.userType === "partner") {
            userData = {
                id: user._id,
                ownerName: user.ownerName,
                email: user.email,
                phone: user.phone,
                businessName: user.businessName,
                partnerType: user.partnerType,
                outlets: user.outlets.map((outlet) => outlet._id), // Return only outlet IDs
                userType: "partner",
            }
        }

        res.json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                token: newToken,
                user: userData, // Include user data
            },
        })
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid refresh token",
        })
    }
}

// Logout - Enhanced with token blacklisting simulation
const logout = async (req, res) => {
    try {
        const userId = req.user.id
        const userType = req.user.userType

        // Update user's last logout time
        let user
        if (userType === "admin") {
            user = await AdminUser.findById(userId)
        } else if (userType === "customer") {
            user = await Customer.findById(userId)
        } else if (userType === "partner") {
            user = await Partner.findById(userId) // Find partner
        }

        if (user) {
            user.lastLogout = new Date()
            await user.save()
        }

        // In a real implementation, you would blacklist the token
        // For now, we'll just return success
        res.json({
            success: true,
            message: "Logged out successfully",
        })
    } catch (error) {
        console.log(error)
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
        } else if (userType === "customer") {
            user = await Customer.findOne({ email, isActive: true })
        } else if (userType === "partner") {
            user = await Partner.findOne({ email, isActive: true }) // Find partner
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

        // Store reset token in user document
        user.passwordResetToken = resetToken
        user.passwordResetExpires = new Date(Date.now() + 3600000) // 1 hour
        await user.save()

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
        } else if (decoded.userType === "customer") {
            user = await Customer.findById(decoded.id)
        } else if (decoded.userType === "partner") {
            user = await Partner.findById(decoded.id) // Find partner
        }

        if (!user || user.passwordResetToken !== token || user.passwordResetExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token",
            })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        user.password = hashedPassword
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
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
        } else if (userType === "customer") {
            user = await Customer.findById(userId)
        } else if (userType === "partner") {
            user = await Partner.findById(userId) // Find partner
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
    adminSignup,
    createSuperAdmin,
    customerLogin,
    customerRegister,
    partnerLogin, // Exported new function
    partnerRegister, // Exported new function
    refreshToken,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
}
