const jwt = require("jsonwebtoken")
const { AdminUser, Customer } = require("../models")

const authenticateUser = async (req, res, next) => {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            let user
            if (decoded.userType === "admin") {
                user = await AdminUser.findById(decoded.id).select("-password")
            } else if (decoded.userType === "customer") {
                user = await Customer.findById(decoded.id).select("-password")
            } else if (decoded.userType === "partner") {
                user = await Partner.findById(decoded.id).select("-password")
            }

            if (!user || !user.isActive) {
                return res.status(401).json({ success: false, message: "Not authorized, user not found or inactive" })
            }

            req.user = {
                id: user._id,
                userType: decoded.userType,
                role: decoded.role, // This will be 'admin_role', 'customer', or 'partner'
                // Add other relevant user data based on type
                ...(decoded.userType === "admin" && {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    permissions: user.permissions,
                }),
                ...(decoded.userType === "customer" && {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                }),
                ...(decoded.userType === "partner" && {
                    ownerName: user.ownerName,
                    businessName: user.businessName,
                    partnerType: user.partnerType,
                    email: user.email,
                    phone: user.phone,
                    outlets: user.outlets, // Include outlets for partner
                }),
            }
            next()
        } catch (error) {
            console.error("Auth middleware error:", error)
            if (error.name === "JsonWebTokenError") {
                return res.status(401).json({ success: false, message: "Not authorized, token failed" })
            }
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ success: false, message: "Not authorized, token expired" })
            }
            res.status(500).json({ success: false, message: "Server error during authentication" })
        }
    }
    if (!token) {
        res.status(401).json({ success: false, message: "Not authorized, no token" })
    }
}

// Authenticate admin users
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (decoded.userType !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin access required.",
            })
        }

        const admin = await AdminUser.findById(decoded.id)
        if (!admin || !admin.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid token or user inactive.",
            })
        }

        req.user = {
            id: admin._id,
            role: admin.role,
            userType: "admin",
            permissions: admin.permissions,
        }

        next()
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid token.",
        })
    }
}

// Authenticate customers
const authenticateCustomer = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (decoded.userType !== "customer") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Customer access required.",
            })
        }

        const customer = await Customer.findById(decoded.id)
        if (!customer || !customer.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid token or user inactive.",
            })
        }

        req.user = {
            id: customer._id,
            userType: "customer",
        }

        next()
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid token.",
        })
    }
}

// Check specific permission
const checkPermission = (module, action) => {
    return (req, res, next) => {
        const userRole = req.user.role
        const userPermissions = req.user.permissions || []

        // Super admin has all permissions
        if (userRole === "super_admin") {
            return next()
        }

        // Check if user has specific permission
        const hasPermission = userPermissions.some(
            (permission) => permission.module === module && permission.actions.includes(action),
        )

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                message: `Access denied. ${action} permission required for ${module}.`,
            })
        }

        next()
    }
}

// Check super admin role
const checkSuperAdmin = (req, res, next) => {
    if (req.user.role !== "super_admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Super admin access required.",
        })
    }
    next()
}

const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            })
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Insufficient permissions",
            })
        }

        next()
    }
}

module.exports = {
    authenticateUser,
    authenticateAdmin,
    authenticateCustomer,
    checkPermission,
    checkSuperAdmin,
    requireRole,
}
