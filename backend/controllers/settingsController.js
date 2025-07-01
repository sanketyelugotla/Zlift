// Delivery Zones Controllers
const getDeliveryZones = async (req, res) => {
    try {
        const zones = [
            {
                id: "1",
                name: "Central Business District",
                description: "Downtown area",
                deliveryFee: 25,
                minimumOrderAmount: 200,
                estimatedDeliveryTime: 20,
                isActive: true,
            },
            {
                id: "2",
                name: "Residential Zone A",
                description: "North residential area",
                deliveryFee: 35,
                minimumOrderAmount: 250,
                estimatedDeliveryTime: 25,
                isActive: true,
            },
        ]

        res.json({
            success: true,
            data: zones,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

const createDeliveryZone = async (req, res) => {
    try {
        const zoneData = req.body

        const zone = {
            id: Date.now().toString(),
            ...zoneData,
            createdAt: new Date(),
        }

        res.status(201).json({
            success: true,
            message: "Delivery zone created successfully",
            data: zone,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

const updateDeliveryZone = async (req, res) => {
    try {
        const zoneData = req.body

        res.json({
            success: true,
            message: "Delivery zone updated successfully",
            data: { id: req.params.id, ...zoneData },
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

const deleteDeliveryZone = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Delivery zone deleted successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Promotions Controllers
const getPromotions = async (req, res) => {
    try {
        const promotions = [
            {
                id: "1",
                code: "WELCOME20",
                title: "Welcome Offer",
                description: "20% off on first order",
                discountType: "percentage",
                discountValue: 20,
                minimumOrderAmount: 300,
                validFrom: new Date(),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                isActive: true,
            },
        ]

        res.json({
            success: true,
            data: promotions,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

const createPromotion = async (req, res) => {
    try {
        const promotionData = req.body

        const promotion = {
            id: Date.now().toString(),
            ...promotionData,
            createdAt: new Date(),
        }

        res.status(201).json({
            success: true,
            message: "Promotion created successfully",
            data: promotion,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

const updatePromotion = async (req, res) => {
    try {
        const promotionData = req.body

        res.json({
            success: true,
            message: "Promotion updated successfully",
            data: { id: req.params.id, ...promotionData },
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

const deletePromotion = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Promotion deleted successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

// Categories Controllers
const getCategories = async (req, res) => {
    try {
        const categories = [
            {
                id: "1",
                name: "Fast Food",
                description: "Quick service restaurants",
                imageUrl: "/images/categories/fast-food.jpg",
                isActive: true,
                sortOrder: 1,
            },
            {
                id: "2",
                name: "Pharmacy",
                description: "Medical supplies and medicines",
                imageUrl: "/images/categories/pharmacy.jpg",
                isActive: true,
                sortOrder: 2,
            },
        ]

        res.json({
            success: true,
            data: categories,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

const createCategory = async (req, res) => {
    try {
        const categoryData = req.body

        const category = {
            id: Date.now().toString(),
            ...categoryData,
            createdAt: new Date(),
        }

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

const updateCategory = async (req, res) => {
    try {
        const categoryData = req.body

        res.json({
            success: true,
            message: "Category updated successfully",
            data: { id: req.params.id, ...categoryData },
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

const deleteCategory = async (req, res) => {
    try {
        res.json({
            success: true,
            message: "Category deleted successfully",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}

module.exports = {
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
}
  