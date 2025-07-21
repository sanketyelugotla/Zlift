const { Outlet, Partner } = require("../models")
const mongoose = require("mongoose")

// Create a new outlet for a partner
const createOutlet = async (req, res) => {
    try {
        const partnerId = req.user.id // Authenticated partner's ID
        const { name, street, city, state, pincode, phone, email, latitude, longitude } = req.body

        // Basic validation (more detailed validation in middleware)
        if (!name || !street || !city || !state || !pincode || !phone) {
            return res.status(400).json({ success: false, message: "Missing required outlet fields" })
        }

        const newOutlet = new Outlet({
            partnerId,
            name,
            address: {
                street,
                city,
                state,
                pincode,
                coordinates: { latitude, longitude },
            },
            phone,
            email,
        })

        await newOutlet.save()

        // Add outlet to partner's outlets array
        await Partner.findByIdAndUpdate(partnerId, { $push: { outlets: newOutlet._id } })

        res.status(201).json({ success: true, message: "Outlet created successfully", data: newOutlet })
    } catch (error) {
        console.error("Error creating outlet:", error)
        res.status(500).json({ success: false, message: "Server error", error: error.message })
    }
}

// Get all outlets for the authenticated partner
const getOutlets = async (req, res) => {
    try {
        const partnerId = req.user.id
        const outlets = await Outlet.find({ partnerId })
        res.json({ success: true, data: outlets })
    } catch (error) {
        console.error("Error fetching outlets:", error)
        res.status(500).json({ success: false, message: "Server error", error: error.message })
    }
}

// Get a single outlet by ID
const getOutletById = async (req, res) => {
    try {
        const { id } = req.params
        const partnerId = req.user.id

        const outlet = await Outlet.findOne({ _id: id, partnerId })
        if (!outlet) {
            return res.status(404).json({ success: false, message: "Outlet not found or not authorized" })
        }
        res.json({ success: true, data: outlet })
    } catch (error) {
        console.error("Error fetching outlet by ID:", error)
        res.status(500).json({ success: false, message: "Server error", error: error.message })
    }
}

// Update an outlet
const updateOutlet = async (req, res) => {
    try {
        const { id } = req.params
        const partnerId = req.user.id
        const updateData = req.body

        const outlet = await Outlet.findOneAndUpdate({ _id: id, partnerId }, updateData, { new: true, runValidators: true })
        if (!outlet) {
            return res.status(404).json({ success: false, message: "Outlet not found or not authorized" })
        }
        res.json({ success: true, message: "Outlet updated successfully", data: outlet })
    } catch (error) {
        console.error("Error updating outlet:", error)
        res.status(500).json({ success: false, message: "Server error", error: error.message })
    }
}

// Delete an outlet
const deleteOutlet = async (req, res) => {
    try {
        const { id } = req.params
        const partnerId = req.user.id

        const outlet = await Outlet.findOneAndDelete({ _id: id, partnerId })
        if (!outlet) {
            return res.status(404).json({ success: false, message: "Outlet not found or not authorized" })
        }

        // Remove outlet from partner's outlets array
        await Partner.findByIdAndUpdate(partnerId, { $pull: { outlets: id } })

        res.json({ success: true, message: "Outlet deleted successfully" })
    } catch (error) {
        console.error("Error deleting outlet:", error)
        res.status(500).json({ success: false, message: "Server error", error: error.message })
    }
}

module.exports = {
    createOutlet,
    getOutlets,
    getOutletById,
    updateOutlet,
    deleteOutlet,
}
