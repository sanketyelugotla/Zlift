const express = require("express")
const router = express.Router()
const {
    getAllCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerStats,
    getCustomerOrders,
    updateCustomerStatus,
    getCustomerAnalytics,
} = require("../controllers/customerController")
const { authenticateAdmin, checkPermission } = require("../middleware/auth")
const { validateCustomer } = require("../middleware/validation")

// All routes require admin authentication
router.use(authenticateAdmin)

// Customer management
router.get("/", checkPermission("customers", "read"), getAllCustomers)
router.get("/stats", checkPermission("customers", "read"), getCustomerStats)
router.get("/:id", checkPermission("customers", "read"), getCustomerById)
router.post("/", checkPermission("customers", "write"), validateCustomer, createCustomer)
router.put("/:id", checkPermission("customers", "update"), updateCustomer)
router.delete("/:id", checkPermission("customers", "delete"), deleteCustomer)
router.patch("/:id/status", checkPermission("customers", "update"), updateCustomerStatus)

// Customer orders and analytics
router.get("/:id/orders", checkPermission("customers", "read"), getCustomerOrders)
router.get("/:id/analytics", checkPermission("customers", "read"), getCustomerAnalytics)

module.exports = router
