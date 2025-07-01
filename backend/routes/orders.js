const express = require("express")
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
const { authenticateAdmin, authenticateCustomer, checkPermission } = require("../middleware/auth")
const { validateOrder, validateOrderStatus } = require("../middleware/validation")

const router = express.Router()

// Admin routes
router.get("/", authenticateAdmin, checkPermission("orders", "read"), getAllOrders)
router.get("/recent", authenticateAdmin, checkPermission("orders", "read"), getRecentOrders)
router.get("/stats", authenticateAdmin, checkPermission("orders", "read"), getOrderStats)
router.get("/export", authenticateAdmin, checkPermission("orders", "read"), exportOrders)
router.get("/:id", authenticateAdmin, checkPermission("orders", "read"), getOrderById)
router.get("/:id/timeline", authenticateAdmin, checkPermission("orders", "read"), getOrderTimeline)

router.post("/", authenticateAdmin, checkPermission("orders", "write"), validateOrder, createOrder)
router.patch(
    "/:id/status",
    authenticateAdmin,
    checkPermission("orders", "write"),
    validateOrderStatus,
    updateOrderStatus,
)
router.patch("/:id/assign-drone", authenticateAdmin, checkPermission("orders", "write"), assignDrone)
router.patch("/:id/cancel", authenticateAdmin, checkPermission("orders", "write"), cancelOrder)
router.post("/bulk-update", authenticateAdmin, checkPermission("orders", "write"), bulkUpdateOrders)

// Customer routes (for future client app)
router.post("/customer", authenticateCustomer, validateOrder, createOrder)
router.get("/customer/my-orders", authenticateCustomer, (req, res) => {
    req.query.customerId = req.user.id
    getAllOrders(req, res)
})

module.exports = router
