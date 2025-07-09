const express = require("express")
const {
    getAllNotifications,
    getNotificationById,
    createNotification,
    markAsRead,
    deleteNotification,
    sendBulkNotification,
    getNotificationStats,
} = require("../controllers/notificationsController")
const { authenticateAdmin, checkPermission } = require("../middleware/auth")
const { validateNotification } = require("../middleware/validation")

const router = express.Router()

// All routes require admin authentication
router.use(authenticateAdmin)

// Notification routes
router.get("/", checkPermission("notifications", "read"), getAllNotifications)
router.get("/stats", checkPermission("notifications", "read"), getNotificationStats)
router.get("/:id", checkPermission("notifications", "read"), getNotificationById)

router.post("/", checkPermission("notifications", "write"), validateNotification, createNotification)
router.post("/bulk", checkPermission("notifications", "write"), sendBulkNotification)
router.patch("/:id/read", checkPermission("notifications", "write"), markAsRead)
router.delete("/:id", checkPermission("notifications", "delete"), deleteNotification)

module.exports = router
