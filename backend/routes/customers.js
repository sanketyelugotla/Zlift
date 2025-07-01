const express = require("express")
const {
    adminLogin,
    customerLogin,
    customerRegister,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
} = require("../controllers/authController")
const { authenticateAdmin, authenticateCustomer } = require("../middleware/auth")
const { validateLogin, validateRegister, validatePasswordReset } = require("../middleware/validation")

const router = express.Router()

// Public routes
router.post("/admin/login", validateLogin, adminLogin)
router.post("/customer/login", validateLogin, customerLogin)
router.post("/customer/register", validateRegister, customerRegister)
router.post("/refresh-token", refreshToken)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", validatePasswordReset, resetPassword)

// Protected routes
router.post("/admin/logout", authenticateAdmin, logout)
router.post("/customer/logout", authenticateCustomer, logout)
router.post("/admin/change-password", authenticateAdmin, changePassword)
router.post("/customer/change-password", authenticateCustomer, changePassword)

module.exports = router
