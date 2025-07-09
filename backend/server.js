const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const mongoose = require("mongoose")
const path = require("path")
const fs = require("fs")
const { connectDB } = require("./config/db")
require("dotenv").config()

console.log(process.env.MONGODB_URI)
// Import routes
const routes = require("./routes")

// Import middleware
const { handleUploadError } = require("./middleware/upload")

const app = express()

// Trust proxy for rate limiting behind reverse proxy
app.set("trust proxy", 1)

// Security middleware
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    }),
)

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply rate limiting to API routes
app.use("/api", limiter)

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs for auth routes
    message: {
        success: false,
        message: "Too many authentication attempts, please try again later.",
    },
})

app.use("/api/auth", authLimiter)

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true)

        const allowedOrigins = [
            process.env.FRONTEND_URL || "http://localhost:3000",
            process.env.ADMIN_DASHBOARD_URL || "http://localhost:3001",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://192.168.0.100:3000",
            "http://192.168.0.100:19006",
            "http://192.168.0.100:19000",
            "http://localhost:8081",
        ]

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}

app.use(cors(corsOptions))

// Body parsing middleware
app.use(
    express.json({
        limit: "10mb",
        verify: (req, res, buf) => {
            // Store raw body for webhook verification
            if (req.originalUrl === "/api/payments/webhook") {
                req.rawBody = buf
            }
        },
    }),
)
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString()
    const method = req.method
    const url = req.originalUrl
    const ip = req.ip || req.connection.remoteAddress

    console.log(`[${timestamp}] ${method} ${url} - ${ip}`)

    // Log response time
    const start = Date.now()
    res.on("finish", () => {
        const duration = Date.now() - start
        console.log(`[${timestamp}] ${method} ${url} - ${res.statusCode} - ${duration}ms`)
    })

    next()
})

// Create upload directories if they don't exist
const uploadDirs = ["uploads", "uploads/partners", "uploads/products", "uploads/documents", "uploads/misc"]

uploadDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        console.log(`📁 Created directory: ${dir}`)
    }
})

// Serve static files (uploaded files)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Database connection with retry logic


// Connect to database
connectDB()

// Health check route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🚁 Drone Delivery API Server",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        status: "running",
        endpoints: {
            health: "/api/health",
            documentation: "/api/docs",
            admin: "/api/admin",
            partners: "/api/partners",
            orders: "/api/orders",
            analytics: "/api/analytics",
        },
    })
})

// API routes
app.use("/api", routes)

// Upload error handling
// app.use(handleUploadError)

// Global error handling middleware
// app.use((error, req, res, next) => {
//     console.error("❌ Error:", error.stack)

//     // Mongoose validation error
//     if (error.name === "ValidationError") {
//         const errors = Object.values(error.errors).map((err) => ({
//             field: err.path,
//             message: err.message,
//             value: err.value,
//         }))
//         return res.status(400).json({
//             success: false,
//             message: "Validation Error",
//             errors,
//         })
//     }

//     // Mongoose duplicate key error
//     if (error.code === 11000) {
//         const field = Object.keys(error.keyValue)[0]
//         const value = error.keyValue[field]
//         return res.status(400).json({
//             success: false,
//             message: `${field} '${value}' already exists`,
//             field,
//             value,
//         })
//     }

//     // Mongoose cast error (invalid ObjectId)
//     if (error.name === "CastError") {
//         return res.status(400).json({
//             success: false,
//             message: `Invalid ${error.path}: ${error.value}`,
//         })
//     }

//     // JWT errors
//     if (error.name === "JsonWebTokenError") {
//         return res.status(401).json({
//             success: false,
//             message: "Invalid token",
//         })
//     }

//     if (error.name === "TokenExpiredError") {
//         return res.status(401).json({
//             success: false,
//             message: "Token expired",
//         })
//     }

//     // CORS error
//     if (error.message === "Not allowed by CORS") {
//         return res.status(403).json({
//             success: false,
//             message: "CORS policy violation",
//         })
//     }

//     // Multer errors (handled by upload middleware, but just in case)
//     if (error.code === "LIMIT_FILE_SIZE") {
//         return res.status(400).json({
//             success: false,
//             message: "File too large",
//         })
//     }

//     // Default error
//     const statusCode = error.status || error.statusCode || 500
//     res.status(statusCode).json({
//         success: false,
//         message: error.message || "Internal Server Error",
//         ...(process.env.NODE_ENV === "development" && {
//             stack: error.stack,
//             details: error,
//         }),
//     })
// })

// 404 handler for undefined routes
// app.use("*", (req, res) => {
//     res.status(404).json({
//         success: false,
//         message: `Route ${req.method} ${req.originalUrl} not found`,
//         availableRoutes: {
//             health: "GET /api/health",
//             auth: "POST /api/auth/admin/login",
//             partners: "GET /api/partners",
//             orders: "GET /api/orders",
//             analytics: "GET /api/analytics/dashboard",
//         },
//     })
// })

// Graceful shutdown handling
// process.on("SIGTERM", gracefulShutdown)
// process.on("SIGINT", gracefulShutdown)

function gracefulShutdown(signal) {
    console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`)

    // Close server
    server.close(() => {
        console.log("✅ HTTP server closed")

        // Close database connection
        mongoose.connection.close(false, () => {
            console.log("✅ MongoDB connection closed")
            process.exit(0)
        })
    })

    // Force close after 10 seconds
    setTimeout(() => {
        console.error("❌ Could not close connections in time, forcefully shutting down")
        process.exit(1)
    }, 10000)
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error)
    process.exit(1)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason)
    process.exit(1)
})

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
    console.log(`
🚀 ===================================
   Drone Delivery API Server Started
🚀 ===================================

📍 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
📊 Database: ${process.env.MONGODB_URI ? "Connected" : "Not configured"}
🔗 API Base URL: http://localhost:${PORT}/api
📖 Health Check: http://localhost:${PORT}/api/health

Available Services:
├── 🔐 Authentication: /api/auth
├── 🏪 Partners: /api/partners  
├── 📦 Products: /api/products
├── 👥 Customers: /api/customers
├── 📋 Orders: /api/orders
├── 💳 Payments: /api/payments
├── 🚁 Drones: /api/drones
├── 👨‍✈️ Operators: /api/operators
├── 📊 Analytics: /api/analytics
├── 👨‍💼 Admin: /api/admin
├── 🔔 Notifications: /api/notifications
├── 📈 Reports: /api/reports
└── ⚙️ Settings: /api/settings

🚀 Ready to accept requests!
`)
})

module.exports = app
