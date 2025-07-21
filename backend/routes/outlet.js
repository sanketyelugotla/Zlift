const express = require("express")
const router = express.Router()
const outletController = require("../controllers/outletController")
const { authenticateUser, checkPermission } = require("../middleware/auth") // Use general authenticateUser
const { validateOutletCreation, validateOutletUpdate } = require("../middleware/validation")

// All outlet routes require partner authentication and specific permissions
router.use(authenticateUser) // Authenticate any user type
router.use(checkPermission("outlets", "read")) // Ensure user has read permission for outlets

router.post("/", checkPermission("outlets", "write"), validateOutletCreation, outletController.createOutlet)
router.get("/", outletController.getOutlets)
router.get("/:id", outletController.getOutletById)
router.put("/:id", checkPermission("outlets", "update"), validateOutletUpdate, outletController.updateOutlet)
router.delete("/:id", checkPermission("outlets", "delete"), outletController.deleteOutlet)

module.exports = router
