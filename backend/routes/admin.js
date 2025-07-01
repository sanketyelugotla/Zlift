const express = require("express")
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

const router = express.Router()

// All routes require admin authentication
router.use(authenticateAdmin)

// Drone CRUD routes
router.get("/", checkPermission("drones", "read"), getAllDrones)
router.get("/stats", checkPermission("drones", "read"), getDroneStats)
router.get("/:id", checkPermission("drones", "read"), getDroneById)
router.get("/:id/location", checkPermission("drones", "read"), getDroneLocation)
router.get("/:id/flight-history", checkPermission("drones", "read"), getDroneFlightHistory)

router.post("/", checkPermission("drones", "write"), validateDrone, createDrone)
router.put("/:id", checkPermission("drones", "write"), validateDrone, updateDrone)
router.patch("/:id/status", checkPermission("drones", "write"), validateDroneStatus, updateDroneStatus)
router.patch("/:id/location", checkPermission("drones", "write"), updateDroneLocation)
router.post("/:id/maintenance", checkPermission("drones", "write"), scheduleMaintenance)
router.delete("/:id", checkPermission("drones", "delete"), deleteDrone)

module.exports = router
