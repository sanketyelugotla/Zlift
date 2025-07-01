const express = require("express")
const {
    getDeliveryZones,
    createDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone,
    getPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require("../controllers/settingsController")
const { authenticateAdmin, checkPermission } = require("../middleware/auth")
const { validateDeliveryZone, validatePromotion, validateCategory } = require("../middleware/validation")

const router = express.Router()

// All routes require admin authentication
router.use(authenticateAdmin)

// Delivery Zones
router.get("/delivery-zones", checkPermission("settings", "read"), getDeliveryZones)
router.post("/delivery-zones", checkPermission("settings", "write"), validateDeliveryZone, createDeliveryZone)
router.put("/delivery-zones/:id", checkPermission("settings", "write"), validateDeliveryZone, updateDeliveryZone)
router.delete("/delivery-zones/:id", checkPermission("settings", "delete"), deleteDeliveryZone)

// Promotions
router.get("/promotions", checkPermission("settings", "read"), getPromotions)
router.post("/promotions", checkPermission("settings", "write"), validatePromotion, createPromotion)
router.put("/promotions/:id", checkPermission("settings", "write"), validatePromotion, updatePromotion)
router.delete("/promotions/:id", checkPermission("settings", "delete"), deletePromotion)

// Categories
router.get("/categories", checkPermission("settings", "read"), getCategories)
router.post("/categories", checkPermission("settings", "write"), validateCategory, createCategory)
router.put("/categories/:id", checkPermission("settings", "write"), validateCategory, updateCategory)
router.delete("/categories/:id", checkPermission("settings", "delete"), deleteCategory)

module.exports = router
