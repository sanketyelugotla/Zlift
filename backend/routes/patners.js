const express = require("express")
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

const router = express.Router()

// All routes require admin authentication
router.use(authenticateAdmin)

// Partner CRUD routes
router.get("/", checkPermission("partners", "read"), getAllPartners)
router.get("/stats", checkPermission("partners", "read"), getPartnerStats)
router.get("/:id", checkPermission("partners", "read"), getPartnerById)
router.get("/:id/orders", checkPermission("partners", "read"), getPartnerOrders)
router.get("/:id/products", checkPermission("partners", "read"), getPartnerProducts)
router.get("/:id/analytics", checkPermission("partners", "read"), getPartnerAnalytics)

router.post("/", checkPermission("partners", "write"), validatePartner, createPartner)
router.put("/:id", checkPermission("partners", "write"), validatePartner, updatePartner)
router.patch("/:id/status", checkPermission("partners", "write"), validatePartnerStatus, updatePartnerStatus)
router.delete("/:id", checkPermission("partners", "delete"), deletePartner)

// File upload routes
router.post(
    "/:id/documents",
    checkPermission("partners", "write"),
    upload.fields([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 1 },
        { name: "license", maxCount: 1 },
    ]),
    uploadPartnerDocuments,
)

module.exports = router
