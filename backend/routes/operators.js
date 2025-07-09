const express = require("express")
const router = express.Router()
const {
    getAllOperators,
    getOperatorById,
    createOperator,
    updateOperator,
    deleteOperator,
    getOperatorStats,
    updateOperatorStatus,
    getOperatorFlights,
    assignOperatorToDrone,
} = require("../controllers/operatorController")
const { authenticateAdmin, checkPermission } = require("../middleware/auth")
const { validateOperator, validateOperatorStatus } = require("../middleware/validation")

// All routes require admin authentication
router.use(authenticateAdmin)

// Operator management
router.get("/", checkPermission("operators", "read"), getAllOperators)
router.get("/stats", checkPermission("operators", "read"), getOperatorStats)
router.get("/:id", checkPermission("operators", "read"), getOperatorById)
router.post("/", checkPermission("operators", "write"), validateOperator, createOperator)
router.put("/:id", checkPermission("operators", "update"), updateOperator)
router.delete("/:id", checkPermission("operators", "delete"), deleteOperator)

// Operator operations
router.patch("/:id/status", checkPermission("operators", "update"), validateOperatorStatus, updateOperatorStatus)
router.get("/:id/flights", checkPermission("operators", "read"), getOperatorFlights)
router.post("/:id/assign-drone", checkPermission("operators", "update"), assignOperatorToDrone)

module.exports = router
