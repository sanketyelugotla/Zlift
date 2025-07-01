const express = require("express")
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

const router = express.Router()

// Mount all routes
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

// Health check route
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "API is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    })
})

module.exports = router