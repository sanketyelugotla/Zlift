const express = require("express")
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
const upload = require("../middleware/upload")

const router = express.Router()

// All routes require admin authentication
router.use(authenticateAdmin)

// Product CRUD routes
router.get("/", checkPermission("products", "read"), getAllProducts)
router.get("/stats", checkPermission("products", "read"), getProductStats)
router.get("/partner/:partnerId", checkPermission("products", "read"), getProductsByPartner)
router.get("/:id", checkPermission("products", "read"), getProductById)

router.post("/", checkPermission("products", "write"), validateProduct, createProduct)
router.put("/:id", checkPermission("products", "write"), validateProduct, updateProduct)
router.patch("/:id/availability", checkPermission("products", "write"), updateProductAvailability)
router.post("/bulk-update", checkPermission("products", "write"), bulkUpdateProducts)
router.delete("/:id", checkPermission("products", "delete"), deleteProduct)

// Image upload
router.post("/:id/images", checkPermission("products", "write"), upload.array("images", 5), (req, res) => {
    // Handle product image upload
    res.json({
        success: true,
        message: "Images uploaded successfully",
        data: req.files.map((file) => file.location || file.path),
    })
})

module.exports = router
