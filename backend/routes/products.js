const express = require("express")
const router = express.Router()
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductStats,
    bulkUpdateProducts,
    getProductsByPartner,
    updateProductAvailability,
} = require("../controllers/productController")
const { authenticateAdmin, checkPermission } = require("../middleware/auth")
const { validateProduct } = require("../middleware/validation")

// All routes require admin authentication
router.use(authenticateAdmin)

// Product management
router.get("/", checkPermission("products", "read"), getAllProducts)
router.get("/stats", checkPermission("products", "read"), getProductStats)
router.get("/partner/:partnerId", checkPermission("products", "read"), getProductsByPartner)
router.get("/:id", checkPermission("products", "read"), getProductById)
router.post("/", checkPermission("products", "write"), validateProduct, createProduct)
router.put("/:id", checkPermission("products", "update"), updateProduct)
router.delete("/:id", checkPermission("products", "delete"), deleteProduct)
router.patch("/:id/availability", checkPermission("products", "update"), updateProductAvailability)

// Bulk operations
router.patch("/bulk", checkPermission("products", "update"), bulkUpdateProducts)

module.exports = router
