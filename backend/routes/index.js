const express = require("express")
const router = express.Router()

// Import route modules
const authRoutes = require("./auth")
const adminRoutes = require("./admin")
const customerRoutes = require("./customers")
const partnerRoutes = require("./patners")
const productRoutes = require("./products")
const orderRoutes = require("./orders")
const paymentRoutes = require("./payments")
const droneRoutes = require("./drones")
const operatorRoutes = require("./operators")
const analyticsRoutes = require("./analytics")
const reportRoutes = require("./reports")
const notificationRoutes = require("./notifications")
const settingsRoutes = require("./settings")

// Mount routes
router.use("/auth", authRoutes)
router.use("/admin", adminRoutes)
router.use("/customers", customerRoutes)
router.use("/partners", partnerRoutes)
router.use("/products", productRoutes)
router.use("/orders", orderRoutes)
router.use("/payments", paymentRoutes)
router.use("/drones", droneRoutes)
router.use("/operators", operatorRoutes)
router.use("/analytics", analyticsRoutes)
router.use("/reports", reportRoutes)
router.use("/notifications", notificationRoutes)
router.use("/settings", settingsRoutes)

// Health check endpoint
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "API is running",
        timestamp: new Date().toISOString(),
    })
})

module.exports = router
