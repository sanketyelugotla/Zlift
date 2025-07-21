const AdminUser = require("./AdminUser")
const Customer = require("./Customer")
const DailySalesAnalytics = require("./DailySalesAnalytics")
const Drone = require("./Drone")
const DroneOperator = require("./DroneOperator")
const Order = require("./Order")
const Partner = require("./Partner") // Corrected typo from Patner to Partner
const Payment = require("./Payment")
const Product = require("./Product")
const Outlet = require("./Outlet") // Added Outlet model

module.exports = {
    AdminUser,
    Customer,
    DailySalesAnalytics,
    Drone,
    DroneOperator,
    Order,
    Partner, // Corrected typo
    Payment,
    Product,
    Outlet, // Exported Outlet
}
