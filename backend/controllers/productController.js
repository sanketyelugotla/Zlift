const { Product, Partner } = require("../models")

// Get all products (Admin)
const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, partnerId, category, isAvailable, search } = req.query

    // Build filter
    const filter = {}
    if (partnerId) filter.partnerId = partnerId
    if (category) filter.category = category
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true"
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    const products = await Product.find(filter)
      .populate("partnerId", "businessName partnerType")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments(filter)

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("partnerId", "businessName partnerType address")

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.json({
      success: true,
      data: product,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Create new product
const createProduct = async (req, res) => {
  try {
    const productData = req.body

    // Verify partner exists
    const partner = await Partner.findById(productData.partnerId)
    if (!partner) {
      return res.status(400).json({
        success: false,
        message: "Partner not found",
      })
    }

    const product = new Product(productData)
    await product.save()

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get product statistics
const getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ["$isAvailable", true] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } },
          averagePrice: { $avg: "$price" },
        },
      },
    ])

    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          averagePrice: { $avg: "$price" },
        },
      },
    ])

    const partnerStats = await Product.aggregate([
      {
        $group: {
          _id: "$partnerId",
          productCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "partners",
          localField: "_id",
          foreignField: "_id",
          as: "partner",
        },
      },
      {
        $unwind: "$partner",
      },
      {
        $project: {
          partnerName: "$partner.businessName",
          partnerType: "$partner.partnerType",
          productCount: 1,
        },
      },
      {
        $sort: { productCount: -1 },
      },
      {
        $limit: 10,
      },
    ])

    res.json({
      success: true,
      data: {
        overview: stats[0] || { total: 0, available: 0, outOfStock: 0, averagePrice: 0 },
        byCategory: categoryStats,
        topPartners: partnerStats,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Bulk update products
const bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updateData } = req.body

    const result = await Product.updateMany({ _id: { $in: productIds } }, updateData)

    res.json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get products by partner
const getProductsByPartner = async (req, res) => {
  try {
    const { partnerId } = req.params
    const { page = 1, limit = 10, category, isAvailable } = req.query

    const filter = { partnerId }
    if (category) filter.category = category
    if (isAvailable !== undefined) filter.isAvailable = isAvailable === "true"

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Product.countDocuments(filter)

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Update product availability
const updateProductAvailability = async (req, res) => {
  try {
    const { isAvailable, stock } = req.body

    const updateData = { isAvailable }
    if (stock !== undefined) updateData.stock = stock

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    res.json({
      success: true,
      message: "Product availability updated successfully",
      data: product,
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
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  bulkUpdateProducts,
  getProductsByPartner,
  updateProductAvailability,
}
