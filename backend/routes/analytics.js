const express = require("express")
const router = express.Router()
const {
    getDashboardAnalytics,
    getSalesAnalytics,
    generateDailyAnalytics,
    getRevenueAnalytics,
    getPartnerAnalytics,
    getCustomerAnalytics,
    getDroneAnalytics,
    getOperationalAnalytics,
    exportAnalytics,
} = require("../controllers/analyticsController")
const { authenticateAdmin, checkPermission } = require("../middleware/auth")

// All analytics routes require admin authentication and analytics read permission
router.use(authenticateAdmin)
router.use(checkPermission("analytics", "read"))

// Dashboard analytics
router.get("/dashboard", getDashboardAnalytics)

// Sales analytics
router.get("/sales", getSalesAnalytics)

// Revenue analytics
router.get("/revenue", getRevenueAnalytics)

// Partner analytics
router.get("/partners", getPartnerAnalytics)

// Customer analytics
router.get("/customers", getCustomerAnalytics)

// Drone analytics
router.get("/drones", getDroneAnalytics)

// Operational analytics
router.get("/operations", getOperationalAnalytics)

// Generate daily analytics (can be called manually or via cron)
router.post("/daily", generateDailyAnalytics)

// Export analytics
router.get("/export", exportAnalytics)

module.exports = router
