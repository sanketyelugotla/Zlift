const express = require("express")
const router = express.Router()
const dashboardController = require("../controllers/dashboardController")
const { authenticateUser, requireRole, checkPermission } = require("../middleware/auth") // Updated import

// Apply general authentication middleware to all dashboard routes
router.use(authenticateUser)

// Super Admin Dashboard Routes
router.get("/super-admin/stats", requireRole(["super_admin"]), dashboardController.getSuperAdminStats)

router.get("/super-admin/analytics", requireRole(["super_admin"]), dashboardController.getSuperAdminAnalytics)

// Partner Manager Dashboard Routes
router.get(
    "/partner-manager/stats",
    requireRole(["partner_manager", "super_admin"]),
    dashboardController.getPartnerManagerStats,
)

router.get(
    "/partner-manager/analytics",
    requireRole(["partner_manager", "super_admin"]),
    dashboardController.getPartnerManagerAnalytics,
)

// Partner Dashboard Routes (for the Partner user type)
router.get(
    "/partner/stats",
    requireRole(["partner"]), // Only partners can access this
    dashboardController.getPartnerDashboardStats,
)

// Common Dashboard Routes (permissions handled by checkPermission or internal logic)
router.get("/recent-orders", checkPermission("dashboard", "read"), dashboardController.getRecentOrders)

router.get(
    "/inventory",
    checkPermission("products", "read"), // Partners and Partner Managers can read products
    dashboardController.getInventoryItems,
)

router.post(
    "/inventory",
    checkPermission("products", "write"), // Partners and Partner Managers can write products
    dashboardController.addInventoryItem,
)

router.put(
    "/inventory/:id",
    checkPermission("products", "update"), // Partners and Partner Managers can update products
    dashboardController.updateInventoryItem,
)

router.delete(
    "/inventory/:id",
    checkPermission("products", "delete"), // Partners and Super Admins can delete products
    dashboardController.deleteInventoryItem,
)

router.get("/health", checkPermission("dashboard", "read"), dashboardController.getSystemHealth) // Assuming health is a dashboard read
router.get("/activity", checkPermission("dashboard", "read"), dashboardController.getActivityFeed) // Assuming activity is a dashboard read

module.exports = router
