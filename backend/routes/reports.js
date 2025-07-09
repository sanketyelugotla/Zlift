const express = require("express")
const router = express.Router()
const {
    getSalesReport,
    getPartnerReport,
    getCustomerReport,
    getDroneUtilizationReport,
    getFinancialReport,
    getOperationalReport,
    exportReport,
} = require("../controllers/reportController")
const { authenticateAdmin, checkPermission } = require("../middleware/auth")

// All routes require admin authentication and reports read permission
router.use(authenticateAdmin)
router.use(checkPermission("reports", "read"))

// Report endpoints
router.get("/sales", getSalesReport)
router.get("/partners", getPartnerReport)
router.get("/customers", getCustomerReport)
router.get("/drones", getDroneUtilizationReport)
router.get("/financial", getFinancialReport)
router.get("/operational", getOperationalReport)

// Export reports
router.post("/export", exportReport)

module.exports = router
