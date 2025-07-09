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
<<<<<<< HEAD
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
=======
const adminRoutes = require("./admin")
const notificationRoutes = require("./notifications")
const reportRoutes = require("./reports")
const settingsRoutes = require("./settings")
const dashboardRoutes = require("./dashboard")
>>>>>>> 4b909385bf061f92d0f2e9e6dba122432b902b6a

// Health check endpoint
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "API is running",
        timestamp: new Date().toISOString(),
    })
})

<<<<<<< HEAD
=======
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

>>>>>>> 4b909385bf061f92d0f2e9e6dba122432b902b6a
module.exports = router
