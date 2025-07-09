const express = require("express")
const router = express.Router()
const {
    getAllDrones,
    getDroneById,
    createDrone,
    updateDrone,
    deleteDrone,
    getDroneStats,
    updateDroneStatus,
    getDroneLocation,
    updateDroneLocation,
    getDroneFlightHistory,
    scheduleMaintenance,
} = require("../controllers/droneContoller")
const { authenticateAdmin, checkPermission } = require("../middleware/auth")
const { validateDrone, validateDroneStatus } = require("../middleware/validation")

// All routes require admin authentication
router.use(authenticateAdmin)

// Drone management
router.get("/", checkPermission("drones", "read"), getAllDrones)
router.get("/stats", checkPermission("drones", "read"), getDroneStats)
router.get("/:id", checkPermission("drones", "read"), getDroneById)
router.post("/", checkPermission("drones", "write"), validateDrone, createDrone)
router.put("/:id", checkPermission("drones", "update"), updateDrone)
router.delete("/:id", checkPermission("drones", "delete"), deleteDrone)

// Drone operations
router.patch("/:id/status", checkPermission("drones", "update"), validateDroneStatus, updateDroneStatus)
router.get("/:id/location", checkPermission("drones", "read"), getDroneLocation)
router.patch("/:id/location", checkPermission("drones", "update"), updateDroneLocation)
router.get("/:id/flights", checkPermission("drones", "read"), getDroneFlightHistory)
router.post("/:id/maintenance", checkPermission("drones", "update"), scheduleMaintenance)

module.exports = router
