const express = require("express")
const router = express.Router()
const {
    adminLogin,
    adminSignup,
    createSuperAdmin,
    customerLogin,
    customerRegister,
    partnerLogin, // Imported new function
    partnerRegister, // Imported new function
    refreshToken,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
} = require("../controllers/authController")
const { authenticateAdmin, authenticateCustomer, authenticatePartner, authenticateUser } = require("../middleware/auth") // Updated import for authenticateUser
const {
    validateLogin,
    validateRegister,
    validatePasswordReset,
    validateAdminSignup,
    validateSuperAdminCreation,
    validatePartnerCreation, // Imported new validation
} = require("../middleware/validation")

// Admin Authentication
router.post("/admin/login", validateLogin, adminLogin)
router.post("/admin/signup", validateAdminSignup, adminSignup)
router.post("/admin/super-admin", validateSuperAdminCreation, createSuperAdmin)

// Customer Authentication
router.post("/customer/login", validateLogin, customerLogin)
router.post("/customer/register", validateRegister, customerRegister)

// Partner Authentication
router.post("/partner/login", validateLogin, partnerLogin) // New route for partner login
router.post("/partner/register", validatePartnerCreation, partnerRegister) // New route for partner registration

// Common Authentication
router.post("/refresh-token", refreshToken)
// Logout routes for different user types
router.post("/admin/logout", authenticateUser, logout) // Use general authenticateUser
router.post("/customer/logout", authenticateUser, logout) // Use general authenticateUser
router.post("/partner/logout", authenticateUser, logout) // Use general authenticateUser

// Password Management
router.post("/forgot-password", forgotPassword) // This handles all user types based on userType in body
router.post("/reset-password", validatePasswordReset, resetPassword) // This handles all user types based on userType in token
router.post("/admin/change-password", authenticateUser, changePassword) // Use general authenticateUser
router.post("/customer/change-password", authenticateUser, changePassword) // Use general authenticateUser
router.post("/partner/change-password", authenticateUser, changePassword) // Use general authenticateUser

module.exports = router