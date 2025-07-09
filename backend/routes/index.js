const express = require("express")
const router = express.Router()

// Import route modules
const authRoutes = require("./auth")
const partnerRoutes = require("./patners")
const productRoutes = require("./products")
const customerRoutes = require("./customers")
const orderRoutes = require("./orders")
const paymentRoutes = require("./payments")
const droneRoutes = require("./drones")
const operatorRoutes = require("./operators")
const analyticsRoutes = require("./analytics")
const adminRoutes = require("./admin")
const notificationRoutes = require("./notifications")
const reportRoutes = require("./reports")
const settingsRoutes = require("./settings")
const dashboardRoutes = require("./dashboard")

// Health check route
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "API is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    })
})

// Mount routes
router.use("/auth", authRoutes)
router.use("/partners", partnerRoutes)
router.use("/products", productRoutes)
router.use("/customers", customerRoutes)
router.use("/orders", orderRoutes)
router.use("/payments", paymentRoutes)
router.use("/drones", droneRoutes)
router.use("/operators", operatorRoutes)
router.use("/analytics", analyticsRoutes)
router.use("/admin", adminRoutes)
router.use("/notifications", notificationRoutes)
router.use("/reports", reportRoutes)
router.use("/settings", settingsRoutes)
router.use("/dashboard", dashboardRoutes)

// 404 handler for API routes
router.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
        path: req.originalUrl,
    })
})

module.exports = router
