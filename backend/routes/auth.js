const express = require("express")
const router = express.Router()
const {
    adminLogin,
    adminSignup,
    createSuperAdmin,
    customerLogin,
    customerRegister,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
} = require("../controllers/authController")
const { authenticateAdmin, authenticateCustomer } = require("../middleware/auth")
const {
    validateLogin,
    validateRegister,
    validatePasswordReset,
    validateAdminSignup,
    validateSuperAdminCreation,
} = require("../middleware/validation")

// Admin Authentication
router.post("/admin/login", validateLogin, adminLogin)
router.post("/admin/signup", validateAdminSignup, adminSignup)
router.post("/admin/super-admin", validateSuperAdminCreation, createSuperAdmin)

// Customer Authentication
router.post("/customer/login", validateLogin, customerLogin)
router.post("/customer/register", validateRegister, customerRegister)

// Common Authentication
router.post("/refresh-token", refreshToken)
router.post("/logout", authenticateAdmin, logout)
router.post("/customer/logout", authenticateCustomer, logout)

// Password Management
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", validatePasswordReset, resetPassword)
router.post("/change-password", authenticateAdmin, changePassword)
router.post("/customer/change-password", authenticateCustomer, changePassword)

module.exports = router
