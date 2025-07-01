const { body, validationResult } = require("express-validator")

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation errors",
            errors: errors.array(),
        })
    }
    next()
}

// Auth validations
const validateLogin = [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    handleValidationErrors,
]

const validateRegister = [
    body("firstName").trim().isLength({ min: 2 }).withMessage("First name must be at least 2 characters"),
    body("lastName").trim().isLength({ min: 2 }).withMessage("Last name must be at least 2 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone").isMobilePhone().withMessage("Valid phone number is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    handleValidationErrors,
]

const validatePasswordReset = [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    handleValidationErrors,
]

// Partner validations
const validatePartner = [
    body("businessName").trim().isLength({ min: 2 }).withMessage("Business name is required"),
    body("partnerType")
        .isIn(["restaurant", "pharmacy", "grocery", "electronics", "fashion", "books", "general"])
        .withMessage("Valid partner type is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone").isMobilePhone().withMessage("Valid phone number is required"),
    body("ownerName").trim().isLength({ min: 2 }).withMessage("Owner name is required"),
    body("address.street").trim().isLength({ min: 5 }).withMessage("Street address is required"),
    body("address.city").trim().isLength({ min: 2 }).withMessage("City is required"),
    body("address.state").trim().isLength({ min: 2 }).withMessage("State is required"),
    body("address.pincode").isLength({ min: 5, max: 10 }).withMessage("Valid pincode is required"),
    body("address.coordinates.latitude").isFloat({ min: -90, max: 90 }).withMessage("Valid latitude is required"),
    body("address.coordinates.longitude").isFloat({ min: -180, max: 180 }).withMessage("Valid longitude is required"),
    handleValidationErrors,
]

const validatePartnerStatus = [
    body("status").isIn(["pending", "approved", "suspended", "rejected"]).withMessage("Valid status is required"),
    handleValidationErrors,
]

// Product validations
const validateProduct = [
    body("name").trim().isLength({ min: 2 }).withMessage("Product name is required"),
    body("category").trim().isLength({ min: 2 }).withMessage("Category is required"),
    body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
    body("partnerId").isMongoId().withMessage("Valid partner ID is required"),
    handleValidationErrors,
]

// Customer validations
const validateCustomer = [
    body("firstName").trim().isLength({ min: 2 }).withMessage("First name is required"),
    body("lastName").trim().isLength({ min: 2 }).withMessage("Last name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone").isMobilePhone().withMessage("Valid phone number is required"),
    handleValidationErrors,
]

// Order validations
const validateOrder = [
    body("customerId").isMongoId().withMessage("Valid customer ID is required"),
    body("partnerId").isMongoId().withMessage("Valid partner ID is required"),
    body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
    body("items.*.productId").isMongoId().withMessage("Valid product ID is required"),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("Valid quantity is required"),
    body("deliveryAddress.street").trim().isLength({ min: 5 }).withMessage("Delivery address is required"),
    handleValidationErrors,
]

const validateOrderStatus = [
    body("status")
        .isIn([
            "pending",
            "confirmed",
            "preparing",
            "ready_for_pickup",
            "picked_up",
            "in_transit",
            "delivered",
            "cancelled",
            "failed",
        ])
        .withMessage("Valid status is required"),
    handleValidationErrors,
]

// Payment validations
const validatePaymentStatus = [
    body("paymentStatus")
        .isIn(["pending", "completed", "failed", "refunded", "cancelled"])
        .withMessage("Valid payment status is required"),
    handleValidationErrors,
]

const validateRefund = [
    body("reason").trim().isLength({ min: 5 }).withMessage("Refund reason is required"),
    body("amount").optional().isFloat({ min: 0 }).withMessage("Valid refund amount is required"),
    handleValidationErrors,
]

// Drone validations
const validateDrone = [
    body("droneId").trim().isLength({ min: 3 }).withMessage("Drone ID is required"),
    body("model").trim().isLength({ min: 2 }).withMessage("Model is required"),
    body("manufacturer").trim().isLength({ min: 2 }).withMessage("Manufacturer is required"),
    body("maxPayload").isFloat({ min: 0 }).withMessage("Valid max payload is required"),
    body("maxRange").isFloat({ min: 0 }).withMessage("Valid max range is required"),
    body("maxFlightTime").isInt({ min: 1 }).withMessage("Valid max flight time is required"),
    body("batteryCapacity").isInt({ min: 1 }).withMessage("Valid battery capacity is required"),
    handleValidationErrors,
]

const validateDroneStatus = [
    body("status")
        .isIn(["available", "in_flight", "maintenance", "charging", "offline"])
        .withMessage("Valid status is required"),
    handleValidationErrors,
]

// Operator validations
const validateOperator = [
    body("employeeId").trim().isLength({ min: 3 }).withMessage("Employee ID is required"),
    body("firstName").trim().isLength({ min: 2 }).withMessage("First name is required"),
    body("lastName").trim().isLength({ min: 2 }).withMessage("Last name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone").isMobilePhone().withMessage("Valid phone number is required"),
    body("licenseNumber").trim().isLength({ min: 5 }).withMessage("License number is required"),
    body("licenseExpiryDate").isISO8601().withMessage("Valid license expiry date is required"),
    body("certificationLevel")
        .isIn(["basic", "intermediate", "advanced"])
        .withMessage("Valid certification level is required"),
    handleValidationErrors,
]

const validateOperatorStatus = [
    body("status").isIn(["active", "inactive", "suspended"]).withMessage("Valid status is required"),
    handleValidationErrors,
]

// Admin validations
const validateAdmin = [
    body("firstName").trim().isLength({ min: 2 }).withMessage("First name is required"),
    body("lastName").trim().isLength({ min: 2 }).withMessage("Last name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("role")
        .isIn([
            "super_admin",
            "operations_manager",
            "customer_support",
            "partner_manager",
            "drone_operator_manager",
            "finance_manager",
        ])
        .withMessage("Valid role is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    handleValidationErrors,
]

// Notification validations
const validateNotification = [
    body("title").trim().isLength({ min: 5 }).withMessage("Title is required"),
    body("message").trim().isLength({ min: 10 }).withMessage("Message is required"),
    body("recipientType")
        .isIn(["customer", "restaurant", "admin", "operator"])
        .withMessage("Valid recipient type is required"),
    body("recipientId").isMongoId().withMessage("Valid recipient ID is required"),
    handleValidationErrors,
]

// Settings validations
const validateDeliveryZone = [
    body("name").trim().isLength({ min: 2 }).withMessage("Zone name is required"),
    body("deliveryFee").isFloat({ min: 0 }).withMessage("Valid delivery fee is required"),
    body("minimumOrderAmount").isFloat({ min: 0 }).withMessage("Valid minimum order amount is required"),
    body("estimatedDeliveryTime").isInt({ min: 1 }).withMessage("Valid estimated delivery time is required"),
    handleValidationErrors,
]

const validatePromotion = [
    body("code").trim().isLength({ min: 3 }).withMessage("Promotion code is required"),
    body("title").trim().isLength({ min: 5 }).withMessage("Title is required"),
    body("discountType")
        .isIn(["percentage", "fixed_amount", "free_delivery"])
        .withMessage("Valid discount type is required"),
    body("discountValue").isFloat({ min: 0 }).withMessage("Valid discount value is required"),
    body("validFrom").isISO8601().withMessage("Valid start date is required"),
    body("validUntil").isISO8601().withMessage("Valid end date is required"),
    handleValidationErrors,
]

const validateCategory = [
    body("name").trim().isLength({ min: 2 }).withMessage("Category name is required"),
    handleValidationErrors,
]

const validateSystemSettings = [
    body("deliveryFee").optional().isFloat({ min: 0 }).withMessage("Valid delivery fee is required"),
    body("maxDeliveryDistance").optional().isFloat({ min: 0 }).withMessage("Valid max delivery distance is required"),
    handleValidationErrors,
]

module.exports = {
    validateLogin,
    validateRegister,
    validatePasswordReset,
    validatePartner,
    validatePartnerStatus,
    validateProduct,
    validateCustomer,
    validateOrder,
    validateOrderStatus,
    validatePaymentStatus,
    validateRefund,
    validateDrone,
    validateDroneStatus,
    validateOperator,
    validateOperatorStatus,
    validateAdmin,
    validateNotification,
    validateDeliveryZone,
    validatePromotion,
    validateCategory,
    validateSystemSettings,
}
