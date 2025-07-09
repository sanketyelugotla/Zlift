const express = require("express")
const router = express.Router()
const {
    getAllPartners,
    getPartnerById,
    createPartner,
    updatePartner,
    updatePartnerStatus,
    deletePartner,
    getPartnerStats,
    getPartnerOrders,
    getPartnerProducts,
    uploadPartnerDocuments,
    getPartnerAnalytics,
} = require("../controllers/partnerController")
const { authenticateAdmin, checkPermission } = require("../middleware/auth")
const { validatePartner, validatePartnerStatus } = require("../middleware/validation")
const upload = require("../middleware/upload")

// All routes require admin authentication
router.use(authenticateAdmin)

// Partner management
router.get("/", checkPermission("partners", "read"), getAllPartners)
router.get("/stats", checkPermission("partners", "read"), getPartnerStats)
router.get("/:id", checkPermission("partners", "read"), getPartnerById)
router.post("/", checkPermission("partners", "write"), validatePartner, createPartner)
router.put("/:id", checkPermission("partners", "update"), updatePartner)
router.patch("/:id/status", checkPermission("partners", "update"), validatePartnerStatus, updatePartnerStatus)
router.delete("/:id", checkPermission("partners", "delete"), deletePartner)

// Partner operations
router.get("/:id/orders", checkPermission("partners", "read"), getPartnerOrders)
router.get("/:id/products", checkPermission("partners", "read"), getPartnerProducts)
router.get("/:id/analytics", checkPermission("partners", "read"), getPartnerAnalytics)

// File uploads
router.post(
    "/:id/documents",
    checkPermission("partners", "update"),
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 1 },
        { name: "license", maxCount: 1 },
    ]),
    uploadPartnerDocuments,
)

module.exports = router
