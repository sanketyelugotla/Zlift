const express = require("express")
const router = express.Router()
const {
    getAllPayments,
    getPaymentById,
    updatePaymentStatus,
    processSettlement,
    getPaymentStats,
    refundPayment,
    getSettlementReport,
    processWebhook,
} = require("../controllers/paymentController")
const { authenticateAdmin, checkPermission } = require("../middleware/auth")
const { validatePaymentStatus, validateRefund } = require("../middleware/validation")

// Webhook endpoint (no authentication required)
router.post("/webhook", processWebhook)

// All other routes require admin authentication
router.use(authenticateAdmin)

// Payment management
router.get("/", checkPermission("payments", "read"), getAllPayments)
router.get("/stats", checkPermission("payments", "read"), getPaymentStats)
router.get("/settlement-report", checkPermission("payments", "read"), getSettlementReport)
router.get("/:id", checkPermission("payments", "read"), getPaymentById)
router.patch("/:id/status", checkPermission("payments", "update"), validatePaymentStatus, updatePaymentStatus)
router.post("/:id/refund", checkPermission("payments", "update"), validateRefund, refundPayment)

// Settlement operations
router.post("/settlement", checkPermission("payments", "update"), processSettlement)

module.exports = router
