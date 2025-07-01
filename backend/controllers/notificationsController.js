// Get all notifications
const getAllNotifications = async (req, res) => {
    try {
        const { page = 1, limit = 10, recipientType, isRead } = req.query

        const filter = {}
        if (recipientType) filter.recipientType = recipientType
        if (isRead !== undefined) filter.isRead = isRead === "true"

        const notifications = [
            {
                id: "1",
                title: "New Order Received",
                message: "Order #ORD001234 has been placed",
                recipientType: "admin",
                isRead: false,
                createdAt: new Date(),
            },
            {
                id: "2",
                title: "Drone Maintenance Due",
                message: "Drone DR001 requires maintenance",
                recipientType: "admin",
                isRead: true,
                createdAt: new Date(Date.now() - 86400000),
            },
        ]

        res.json({
            success: true,
            data: {
                notifications,
                pagination: {
                    current: 1,
                    pages: 1,
                    total: notifications.length,
                },
            },
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get notification by ID
const getNotificationById = async (req, res) => {
    try {
        const notification = {
            id: req.params.id,
            title: "New Order Received",
            message: "Order #ORD001234 has been placed by John Doe",
            recipientType: "admin",
            isRead: false,
            createdAt: new Date(),
        }

        res.json({
            success: true,
            data: notification,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Create notification
const createNotification = async (req, res) => {
    try {
        const notificationData = req.body

        // In a real implementation, this would save to database
        const notification = {
            id: Date.now().toString(),
            ...notificationData,
            createdAt: new Date(),
        }

        res.status(201).json({
            success: true,
            message: "Notification created successfully",
            data: notification,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Mark as read
const markAsRead = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Notification marked as read",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Notification deleted successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Send bulk notification
const sendBulkNotification = async (req, res) => {
    try {
        const { recipients, title, message } = req.body

        res.json({
            success: true,
            message: `Notification sent to ${recipients.length} recipients`,
            data: {
                sentCount: recipients.length,
                sentAt: new Date(),
            },
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Get notification stats
const getNotificationStats = async (req, res) => {
    try {
        const stats = {
            total: 150,
            unread: 25,
            read: 125,
            byType: {
                order: 80,
                system: 30,
                maintenance: 20,
                payment: 20,
            },
        }

        res.json({
            success: true,
            data: stats,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

module.exports = {
    getAllNotifications,
    getNotificationById,
    createNotification,
    markAsRead,
    deleteNotification,
    sendBulkNotification,
    getNotificationStats,
}
  