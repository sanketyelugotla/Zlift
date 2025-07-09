const express = require("express")
const router = express.Router()
const {
    getAllAdmins,
    getAdminById,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    updateAdminStatus,
    updateAdminPermissions,
    getAdminProfile,
    updateAdminProfile,
    getSystemSettings,
    updateSystemSettings,
} = require("../controllers/adminController")
const { authenticateAdmin, checkSuperAdmin, checkPermission } = require("../middleware/auth")
const { validateAdmin } = require("../middleware/validation")

// Admin management routes (Super Admin only)
router.get("/", authenticateAdmin, checkSuperAdmin, getAllAdmins)
router.get("/profile", authenticateAdmin, getAdminProfile)
router.get("/:id", authenticateAdmin, checkSuperAdmin, getAdminById)
router.post("/", authenticateAdmin, checkSuperAdmin, validateAdmin, createAdmin)
router.put("/profile", authenticateAdmin, updateAdminProfile)
router.put("/:id", authenticateAdmin, checkSuperAdmin, updateAdmin)
router.delete("/:id", authenticateAdmin, checkSuperAdmin, deleteAdmin)
router.patch("/:id/status", authenticateAdmin, checkSuperAdmin, updateAdminStatus)
router.patch("/:id/permissions", authenticateAdmin, checkSuperAdmin, updateAdminPermissions)

// System settings
router.get("/settings/system", authenticateAdmin, checkPermission("settings", "read"), getSystemSettings)
router.put("/settings/system", authenticateAdmin, checkPermission("settings", "write"), updateSystemSettings)

module.exports = router
