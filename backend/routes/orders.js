const express = require("express")
const router = express.Router()
const {
    getAllOrders,
    getRecentOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    assignDrone,
    getOrderStats,
    cancelOrder,
    getOrderTimeline,
    bulkUpdateOrders,
    exportOrders,
} = require("../controllers/orderController")
const { authenticateAdmin, checkPermission } = require("../middleware/auth")
const { validateOrder, validateOrderStatus } = require("../middleware/validation")

// All routes require admin authentication
router.use(authenticateAdmin)

// Order management
router.get("/", checkPermission("orders", "read"), getAllOrders)
router.get("/recent", checkPermission("orders", "read"), getRecentOrders)
router.get("/stats", checkPermission("orders", "read"), getOrderStats)
router.get("/export", checkPermission("orders", "read"), exportOrders)
router.get("/:id", checkPermission("orders", "read"), getOrderById)
router.post("/", checkPermission("orders", "write"), validateOrder, createOrder)
router.put("/:id/status", checkPermission("orders", "update"), validateOrderStatus, updateOrderStatus)
router.patch("/:id/assign-drone", checkPermission("orders", "update"), assignDrone)
router.patch("/:id/cancel", checkPermission("orders", "update"), cancelOrder)
router.get("/:id/timeline", checkPermission("orders", "read"), getOrderTimeline)

// Bulk operations
router.patch("/bulk", checkPermission("orders", "update"), bulkUpdateOrders)

module.exports = router
