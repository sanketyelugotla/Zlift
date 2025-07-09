const express = require("express")
const router = express.Router()
const dashboardController = require("../controllers/dashboardController")
const { authenticateToken, requireRole } = require("../middleware/auth")

// Super Admin Dashboard Routes
router.get(
    "/super-admin/stats",
    authenticateToken,
    requireRole(["super_admin"]),
    dashboardController.getSuperAdminStats,
)

router.get(
    "/super-admin/analytics",
    authenticateToken,
    requireRole(["super_admin"]),
    dashboardController.getSuperAdminAnalytics,
)

// Partner Manager Dashboard Routes
router.get(
    "/partner-manager/stats",
    authenticateToken,
    requireRole(["partner_manager", "super_admin"]),
    dashboardController.getPartnerManagerStats,
)

router.get(
    "/partner-manager/analytics",
    authenticateToken,
    requireRole(["partner_manager", "super_admin"]),
    dashboardController.getPartnerManagerAnalytics,
)

// Common Dashboard Routes
router.get("/recent-orders", authenticateToken, dashboardController.getRecentOrders)

router.get(
    "/inventory",
    authenticateToken,
    requireRole(["partner_manager", "super_admin"]),
    dashboardController.getInventoryItems,
)

router.post(
    "/inventory",
    authenticateToken,
    requireRole(["partner_manager", "super_admin"]),
    dashboardController.addInventoryItem,
)

router.put(
    "/inventory/:id",
    authenticateToken,
    requireRole(["partner_manager", "super_admin"]),
    dashboardController.updateInventoryItem,
)

router.delete(
    "/inventory/:id",
    authenticateToken,
    requireRole(["partner_manager", "super_admin"]),
    dashboardController.deleteInventoryItem,
)

router.get("/health", authenticateToken, dashboardController.getSystemHealth)

router.get("/activity", authenticateToken, dashboardController.getActivityFeed)

module.exports = router
