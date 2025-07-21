const express = require("express")
const router = express.Router()
const dashboardController = require("../controllers/dashboardController")
const { authenticateAdmin, requireRole } = require("../middleware/auth")

// Super Admin Dashboard Routes
router.get(
    "/super-admin/stats",
    authenticateAdmin,
    requireRole(["super_admin"]),
    dashboardController.getSuperAdminStats,
)

router.get(
    "/super-admin/analytics",
    authenticateAdmin,
    requireRole(["super_admin"]),
    dashboardController.getSuperAdminAnalytics,
)

// Partner Manager Dashboard Routes
router.get(
    "/partner-manager/stats",
    authenticateAdmin,
    requireRole(["partner_manager", "super_admin"]),
    dashboardController.getPartnerManagerStats,
)

router.get(
    "/partner-manager/analytics",
    authenticateAdmin,
    requireRole(["partner_manager", "super_admin"]),
    dashboardController.getPartnerManagerAnalytics,
)

// Common Dashboard Routes
router.get("/recent-orders", authenticateAdmin, dashboardController.getRecentOrders)

router.get(
    "/inventory",
    authenticateAdmin,
    requireRole(["partner_manager", "super_admin"]),
    dashboardController.getInventoryItems,
)

router.post(
    "/inventory",
    authenticateAdmin,
    requireRole(["partner_manager", "super_admin"]),
    dashboardController.addInventoryItem,
)

router.put(
    "/inventory/:id",
    authenticateAdmin,
    requireRole(["partner_manager", "super_admin"]),
    dashboardController.updateInventoryItem,
)

router.delete(
    "/inventory/:id",
    authenticateAdmin,
    requireRole(["partner_manager", "super_admin"]),
    dashboardController.deleteInventoryItem,
)

router.get("/health", authenticateAdmin, dashboardController.getSystemHealth)

router.get("/activity", authenticateAdmin, dashboardController.getActivityFeed)

module.exports = router
