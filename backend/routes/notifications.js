const express = require("express")
const router = express.Router()
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

// All routes require admin authentication
router.use(authenticateAdmin)

// Notification management
router.get("/", checkPermission("notifications", "read"), getAllNotifications)
router.get("/stats", checkPermission("notifications", "read"), getNotificationStats)
router.get("/:id", checkPermission("notifications", "read"), getNotificationById)
router.post("/", checkPermission("notifications", "write"), validateNotification, createNotification)
router.patch("/:id/read", checkPermission("notifications", "update"), markAsRead)
router.delete("/:id", checkPermission("notifications", "delete"), deleteNotification)

// Bulk operations
router.post("/bulk", checkPermission("notifications", "write"), sendBulkNotification)

module.exports = router
