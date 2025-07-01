const express = require("express")
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

const router = express.Router()

// All routes require admin authentication
router.use(authenticateAdmin)

// Operator CRUD routes
router.get("/", checkPermission("operators", "read"), getAllOperators)
router.get("/stats", checkPermission("operators", "read"), getOperatorStats)
router.get("/:id", checkPermission("operators", "read"), getOperatorById)
router.get("/:id/flights", checkPermission("operators", "read"), getOperatorFlights)

router.post("/", checkPermission("operators", "write"), validateOperator, createOperator)
router.put("/:id", checkPermission("operators", "write"), validateOperator, updateOperator)
router.patch("/:id/status", checkPermission("operators", "write"), validateOperatorStatus, updateOperatorStatus)
router.post("/:id/assign-drone", checkPermission("operators", "write"), assignOperatorToDrone)
router.delete("/:id", checkPermission("operators", "delete"), deleteOperator)

module.exports = router
