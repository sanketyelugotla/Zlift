// validators.js
const { body, validationResult } = require("express-validator");

// Common error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation errors",
            errors: errors.array(),
        });
    }
    next();
};

// --- AUTH ---
const validateLogin = [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    handleValidationErrors,
];

const validateRegister = [
    body("firstName").trim().isLength({ min: 2 }).withMessage("First name must be at least 2 characters"),
    body("lastName").trim().isLength({ min: 2 }).withMessage("Last name must be at least 2 characters"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone").isMobilePhone().withMessage("Valid phone number is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    handleValidationErrors,
];

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

const validateAdminSignup = [
    body("firstName").trim().isLength({ min: 2 }).withMessage("First name must be at least 2 characters long"),
    body("lastName").trim().isLength({ min: 2 }).withMessage("Last name must be at least 2 characters long"),
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
    body("phone").isMobilePhone().withMessage("Please provide a valid phone number"),
    body("password")
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number"),
    body("role")
        .optional()
        .isIn(["super_admin", "admin", "operations_manager", "customer_support", "partner_manager"])
        .withMessage("Invalid role specified"),
    handleValidationErrors,
];

const validateSuperAdminCreation = [
    body("firstName").trim().isLength({ min: 2 }).withMessage("First name must be at least 2 characters long"),
    body("lastName").trim().isLength({ min: 2 }).withMessage("Last name must be at least 2 characters long"),
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("phone")
        .isMobilePhone()
        .withMessage("Please provide a valid phone number")
        .isLength({ min: 10, max: 15 })
        .withMessage("Phone number must be between 10-15 digits"),
    body("password")
        .isLength({ min: 12 })
        .withMessage("Super admin password must be at least 12 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    body("secretKey").notEmpty().withMessage("Secret key is required for super admin creation"),
    handleValidationErrors,
];

const validatePasswordReset = [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    handleValidationErrors,
];

// --- PARTNER ---
const validatePartner = [
    body("businessName").trim().isLength({ min: 2 }).withMessage("Business name must be at least 2 characters long"),
    body("ownerName").trim().isLength({ min: 2 }).withMessage("Owner name must be at least 2 characters long"),
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("phone")
        .isMobilePhone()
        .withMessage("Please provide a valid phone number")
        .isLength({ min: 10, max: 15 })
        .withMessage("Phone number must be between 10-15 digits"),
    body("businessType").isIn(["restaurant", "grocery", "pharmacy", "retail"]).withMessage("Invalid business type"),
    body("address.street").trim().notEmpty().withMessage("Street address is required"),
    body("address.city").trim().notEmpty().withMessage("City is required"),
    body("address.state").trim().notEmpty().withMessage("State is required"),
    body("address.zipCode").trim().notEmpty().withMessage("Zip code is required"),
    handleValidationErrors,
];

const validatePartnerStatus = [
    body("status").isIn(["pending", "approved", "suspended", "rejected"]).withMessage("Valid status is required"),
    handleValidationErrors,
];

const validatePartnerUpdate = [
    body("businessName").optional().notEmpty(),
    body("ownerName").optional().notEmpty(),
    body("email").optional().isEmail(),
    body("phone").optional().isMobilePhone("any"),
    body("partnerType").optional().isIn(["restaurant", "grocery", "pharmacy", "retail"]),
    body("address.street").optional().notEmpty(),
    body("address.city").optional().notEmpty(),
    body("address.state").optional().notEmpty(),
    body("address.pincode").optional().notEmpty(),
    body("status").optional().isIn(["pending", "approved", "suspended", "rejected"]),
    body("commissionRate").optional().isFloat({ min: 0, max: 100 }),
    handleValidationErrors,
];

// --- PRODUCT ---
const validateProduct = [
    body("name").trim().isLength({ min: 2 }).withMessage("Product name is required"),
    body("category").trim().isLength({ min: 2 }).withMessage("Category is required"),
    body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
    body("partnerId").isMongoId().withMessage("Valid partner ID is required"),
    handleValidationErrors,
];

const validateProductCreation = [
    body("partnerId").notEmpty().withMessage("Partner ID is required"),
    body("name").notEmpty().withMessage("Product name is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
    handleValidationErrors,
];

const validateProductUpdate = [
    body("name").optional().notEmpty(),
    body("category").optional().notEmpty(),
    body("price").optional().isFloat({ min: 0 }),
    body("stock").optional().isInt({ min: 0 }),
    handleValidationErrors,
];

// --- CUSTOMER ---
const validateCustomer = [
    body("firstName").trim().isLength({ min: 2 }).withMessage("First name is required"),
    body("lastName").trim().isLength({ min: 2 }).withMessage("Last name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone").isMobilePhone().withMessage("Valid phone number is required"),
    handleValidationErrors,
];

// --- ORDER ---
const validateOrder = [
    body("customerId").isMongoId().withMessage("Valid customer ID is required"),
    body("partnerId").isMongoId().withMessage("Valid partner ID is required"),
    body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
    body("items.*.productId").isMongoId().withMessage("Valid product ID is required"),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("Valid quantity is required"),
    body("deliveryAddress.street").trim().isLength({ min: 5 }).withMessage("Delivery address is required"),
    handleValidationErrors,
];

const validateOrderStatus = [
    body("status")
        .isIn(["pending", "confirmed", "preparing", "ready_for_pickup", "picked_up", "in_transit", "delivered", "cancelled", "failed"])
        .withMessage("Valid status is required"),
    handleValidationErrors,
];

const validateOrderCreation = [
    body("customerId").notEmpty().withMessage("Customer ID is required"),
    body("partnerId").notEmpty().withMessage("Partner ID is required"),
    body("items").isArray().notEmpty().withMessage("Order must contain at least one item"),
    body("items.*.productId").notEmpty().withMessage("Product ID is required for each item"),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("deliveryAddress.street").notEmpty().withMessage("Delivery street is required"),
    body("deliveryAddress.city").notEmpty().withMessage("Delivery city is required"),
    body("deliveryAddress.pincode").notEmpty().withMessage("Delivery pincode is required"),
    body("totalAmount").isFloat({ min: 0 }).withMessage("Total amount must be a positive number"),
    handleValidationErrors,
];

const validateOrderUpdate = [
    body("status")
        .optional()
        .isIn(["pending", "confirmed", "prepared", "out_for_delivery", "delivered", "cancelled"])
        .withMessage("Invalid order status"),
    body("assignedDroneId").optional().notEmpty(),
    body("assignedOperatorId").optional().notEmpty(),
    handleValidationErrors,
];

// --- PAYMENT ---
const validatePaymentStatus = [
    body("paymentStatus")
        .isIn(["pending", "completed", "failed", "refunded", "cancelled"])
        .withMessage("Valid payment status is required"),
    handleValidationErrors,
];

const validatePaymentCreation = [
    body("orderId").notEmpty().withMessage("Order ID is required"),
    body("customerId").notEmpty().withMessage("Customer ID is required"),
    body("amount").isFloat({ min: 0 }).withMessage("Amount must be a positive number"),
    body("paymentMethod").isIn(["card", "upi", "wallet", "cash_on_delivery"]).withMessage("Invalid payment method"),
    body("paymentStatus").isIn(["pending", "completed", "failed", "refunded"]).withMessage("Invalid payment status"),
    handleValidationErrors,
];

const validatePaymentUpdate = [
    body("paymentStatus").optional().isIn(["pending", "completed", "failed", "refunded"]).withMessage("Invalid payment status"),
    handleValidationErrors,
];

const validateRefund = [
    body("reason").trim().isLength({ min: 5 }).withMessage("Refund reason is required"),
    body("amount").optional().isFloat({ min: 0 }).withMessage("Valid refund amount is required"),
    handleValidationErrors,
];

// --- DRONE ---
const validateDrone = [
    body("droneId").trim().isLength({ min: 3 }).withMessage("Drone ID is required"),
    body("model").trim().isLength({ min: 2 }).withMessage("Model is required"),
    body("manufacturer").trim().isLength({ min: 2 }).withMessage("Manufacturer is required"),
    body("maxPayload").isFloat({ min: 0 }).withMessage("Valid max payload is required"),
    body("maxRange").isFloat({ min: 0 }).withMessage("Valid max range is required"),
    body("maxFlightTime").isInt({ min: 1 }).withMessage("Valid max flight time is required"),
    body("batteryCapacity").isInt({ min: 1 }).withMessage("Valid battery capacity is required"),
    handleValidationErrors,
];

const validateDroneStatus = [
    body("status")
        .isIn(["available", "in_flight", "maintenance", "charging", "offline"])
        .withMessage("Valid status is required"),
    handleValidationErrors,
];

const validateDroneCreation = [
    body("droneId").notEmpty().withMessage("Drone ID is required"),
    body("model").notEmpty().withMessage("Model is required"),
    body("capacity").isFloat({ min: 0 }).withMessage("Capacity must be a positive number"),
    body("maxFlightTime").isInt({ min: 0 }).withMessage("Max flight time must be a non-negative integer"),
    body("status").isIn(["active", "inactive", "maintenance", "charging"]).withMessage("Invalid drone status"),
    handleValidationErrors,
];

const validateDroneUpdate = [
    body("model").optional().notEmpty(),
    body("capacity").optional().isFloat({ min: 0 }),
    body("maxFlightTime").optional().isInt({ min: 0 }),
    body("status").optional().isIn(["active", "inactive", "maintenance", "charging"]),
    body("currentBatteryLevel").optional().isInt({ min: 0, max: 100 }),
    handleValidationErrors,
];

// --- OPERATOR ---
const validateOperator = [
    body("employeeId").trim().isLength({ min: 3 }).withMessage("Employee ID is required"),
    body("firstName").trim().isLength({ min: 2 }).withMessage("First name is required"),
    body("lastName").trim().isLength({ min: 2 }).withMessage("Last name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("phone").isMobilePhone().withMessage("Valid phone number is required"),
    body("licenseNumber").trim().isLength({ min: 5 }).withMessage("License number is required"),
    body("licenseExpiryDate").isISO8601().withMessage("Valid license expiry date is required"),
    body("certificationLevel").isIn(["basic", "intermediate", "advanced"]).withMessage("Valid certification level is required"),
    handleValidationErrors,
];

const validateOperatorStatus = [
    body("status").isIn(["active", "inactive", "suspended"]).withMessage("Valid status is required"),
    handleValidationErrors,
];

const validateOperatorCreation = [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").isMobilePhone("any").withMessage("Valid phone number is required"),
    body("licenseNumber").notEmpty().withMessage("License number is required"),
    body("status").isIn(["active", "inactive", "on_leave"]).withMessage("Invalid operator status"),
    handleValidationErrors,
];

const validateOperatorUpdate = [
    body("firstName").optional().notEmpty(),
    body("lastName").optional().notEmpty(),
    body("email").optional().isEmail(),
    body("phone").optional().isMobilePhone("any"),
    body("licenseNumber").optional().notEmpty(),
    body("status").optional().isIn(["active", "inactive", "on_leave"]),
    handleValidationErrors,
];

// --- NOTIFICATIONS ---
const validateNotification = [
    body("title").trim().isLength({ min: 5 }).withMessage("Title is required"),
    body("message").trim().isLength({ min: 10 }).withMessage("Message is required"),
    body("recipientType").isIn(["customer", "restaurant", "admin", "operator"]).withMessage("Valid recipient type is required"),
    body("recipientId").isMongoId().withMessage("Valid recipient ID is required"),
    handleValidationErrors,
];

// --- SETTINGS ---
const validateDeliveryZone = [
    body("name").trim().isLength({ min: 2 }).withMessage("Zone name is required"),
    body("deliveryFee").isFloat({ min: 0 }).withMessage("Valid delivery fee is required"),
    body("minimumOrderAmount").isFloat({ min: 0 }).withMessage("Valid minimum order amount is required"),
    body("estimatedDeliveryTime").isInt({ min: 1 }).withMessage("Valid estimated delivery time is required"),
    handleValidationErrors,
];

const validatePromotion = [
    body("code").trim().isLength({ min: 3 }).withMessage("Promotion code is required"),
    body("title").trim().isLength({ min: 5 }).withMessage("Title is required"),
    body("discountType").isIn(["percentage", "fixed_amount", "free_delivery"]).withMessage("Valid discount type is required"),
    body("discountValue").isFloat({ min: 0 }).withMessage("Valid discount value is required"),
    body("validFrom").isISO8601().withMessage("Valid start date is required"),
    body("validUntil").isISO8601().withMessage("Valid end date is required"),
    handleValidationErrors,
];

const validateCategory = [
    body("name").trim().isLength({ min: 2 }).withMessage("Category name is required"),
    handleValidationErrors,
];

const validateSystemSettings = [
    body("deliveryFee").optional().isFloat({ min: 0 }).withMessage("Valid delivery fee is required"),
    body("maxDeliveryDistance").optional().isFloat({ min: 0 }).withMessage("Valid max delivery distance is required"),
    handleValidationErrors,
];

// --- OUTLET ---
const validateOutletCreation = [
    body("name").notEmpty().withMessage("Outlet name is required"),
    body("street").notEmpty().withMessage("Street address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("pincode").notEmpty().withMessage("Pincode is required"),
    body("phone").isMobilePhone("any").withMessage("Valid phone number is required"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    handleValidationErrors,
];

const validateOutletUpdate = [
    body("name").optional().notEmpty().withMessage("Outlet name cannot be empty"),
    body("street").optional().notEmpty().withMessage("Street address cannot be empty"),
    body("city").optional().notEmpty().withMessage("City cannot be empty"),
    body("state").optional().notEmpty().withMessage("State cannot be empty"),
    body("pincode").optional().notEmpty().withMessage("Pincode cannot be empty"),
    body("phone").optional().isMobilePhone("any").withMessage("Valid phone number is required"),
    body("email").optional().isEmail().withMessage("Valid email is required"),
    body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),
    handleValidationErrors,
];

const validatePartnerCreation = [
    body("businessName").notEmpty().withMessage("Business name is required"),
    body("ownerName").notEmpty().withMessage("Owner name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").isMobilePhone("any").withMessage("Valid phone number is required"),
    body("partnerType").isIn(["restaurant", "grocery", "pharmacy", "retail"]).withMessage("Invalid partner type"),
    body("address.street").notEmpty().withMessage("Street address is required"),
    body("address.city").notEmpty().withMessage("City is required"),
    body("address.state").notEmpty().withMessage("State is required"),
    body("address.pincode").notEmpty().withMessage("Pincode is required"),
    handleValidationErrors,
]

module.exports = {
    handleValidationErrors,
    validateLogin,
    validateRegister,
    validateAdmin,
    validateAdminSignup,
    validateSuperAdminCreation,
    validatePasswordReset,
    validatePartner,
    validatePartnerStatus,
    validatePartnerCreation,
    validatePartnerUpdate,
    validateProduct,
    validateProductCreation,
    validateProductUpdate,
    validateCustomer,
    validateOrder,
    validateOrderStatus,
    validateOrderCreation,
    validateOrderUpdate,
    validatePaymentStatus,
    validatePaymentCreation,
    validatePaymentUpdate,
    validateRefund,
    validateDrone,
    validateDroneStatus,
    validateDroneCreation,
    validateDroneUpdate,
    validateOperator,
    validateOperatorStatus,
    validateOperatorCreation,
    validateOperatorUpdate,
    validateNotification,
    validateDeliveryZone,
    validatePromotion,
    validateCategory,
    validateSystemSettings,
    validateOutletCreation,
    validateOutletUpdate,
};
