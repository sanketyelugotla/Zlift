"use client"

import { useState, useEffect } from "react"
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
} from "react-native"
import { useAuth } from "@/contexts/AuthContext"
import { dashboardService } from "@/services/dashboardService"

interface InventoryItem {
    id: string
    name: string
    category: string
    price: number
    stock: number
    status: "available" | "out_of_stock" | "low_stock"
}

export default function InventoryScreen() {
    const { user } = useAuth()
    const [items, setItems] = useState<InventoryItem[]>([])
    const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        stock: "",
        description: "",
    })

    useEffect(() => {
        loadInventoryData()
    }, [])

    useEffect(() => {
        filterItems()
    }, [items, searchQuery])

    const loadInventoryData = async () => {
        try {
            setIsLoading(true)
            const response = await dashboardService.getInventoryItems()

            if (response?.success) {
                setItems(response.data)
            }
        } catch (error) {
            console.error("Failed to load inventory data:", error)
            Alert.alert("Error", "Failed to load inventory data")
        } finally {
            setIsLoading(false)
        }
    }

    const filterItems = () => {
        if (!searchQuery.trim()) {
            setFilteredItems(items)
        } else {
            const filtered = items.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.category.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            setFilteredItems(filtered)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await loadInventoryData()
        setRefreshing(false)
    }

    const resetForm = () => {
        setFormData({
            name: "",
            category: "",
            price: "",
            stock: "",
            description: "",
        })
        setEditingItem(null)
    }

    const handleAddItem = () => {
        resetForm()
        setShowAddModal(true)
    }

    const handleEditItem = (item: InventoryItem) => {
        setFormData({
            name: item.name,
            category: item.category,
            price: item.price.toString(),
            stock: item.stock.toString(),
            description: "",
        })
        setEditingItem(item)
        setShowAddModal(true)
    }

    const handleSaveItem = async () => {
        if (!formData.name.trim() || !formData.category.trim() || !formData.price || !formData.stock) {
            Alert.alert("Error", "Please fill in all required fields")
            return
        }

        try {
            const itemData = {
                name: formData.name.trim(),
                category: formData.category.trim(),
                price: Number.parseFloat(formData.price),
                stock: Number.parseInt(formData.stock),
                description: formData.description.trim(),
            }

            let response
            if (editingItem) {
                response = await dashboardService.updateInventoryItem(editingItem.id, itemData)
            } else {
                response = await dashboardService.addInventoryItem(itemData)
            }

            if (response?.success) {
                Alert.alert("Success", editingItem ? "Item updated successfully" : "Item added successfully")
                setShowAddModal(false)
                resetForm()
                await loadInventoryData()
            } else {
                Alert.alert("Error", response?.message || "Failed to save item")
            }
        } catch (error) {
            console.error("Failed to save item:", error)
            Alert.alert("Error", "Failed to save item")
        }
    }

    const handleDeleteItem = (item: InventoryItem) => {
        Alert.alert("Delete Item", `Are you sure you want to delete "${item.name}"?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteItem(item.id) },
        ])
    }

    const deleteItem = async (itemId: string) => {
        try {
            const response = await dashboardService.deleteInventoryItem(itemId)

            if (response?.success) {
                Alert.alert("Success", "Item deleted successfully")
                await loadInventoryData()
            } else {
                Alert.alert("Error", response?.message || "Failed to delete item")
            }
        } catch (error) {
            console.error("Failed to delete item:", error)
            Alert.alert("Error", "Failed to delete item")
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
                return "#4CAF50"
            case "low_stock":
                return "#FF9800"
            case "out_of_stock":
                return "#F44336"
            default:
                return "#757575"
        }
    }

    const formatCurrency = (amount: number) => {
        return `$${amount.toFixed(2)}`
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading inventory...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Inventory Management</Text>
                <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                    <Text style={styles.addButtonText}>+ Add Item</Text>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search items..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Inventory List */}
            <ScrollView
                style={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <View key={item.id} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                                    <Text style={styles.statusText}>{item.status.replace("_", " ")}</Text>
                                </View>
                            </View>

                            <View style={styles.itemDetails}>
                                <Text style={styles.itemCategory}>{item.category}</Text>
                                <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                            </View>

                            <View style={styles.itemFooter}>
                                <Text style={styles.stockText}>Stock: {item.stock}</Text>
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity style={styles.editButton} onPress={() => handleEditItem(item)}>
                                        <Text style={styles.editButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteItem(item)}>
                                        <Text style={styles.deleteButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>
                        {searchQuery ? "No items found matching your search" : "No inventory items"}
                    </Text>
                )}
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowAddModal(false)}>
                            <Text style={styles.cancelButton}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>{editingItem ? "Edit Item" : "Add New Item"}</Text>
                        <TouchableOpacity onPress={handleSaveItem}>
                            <Text style={styles.saveButton}>Save</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.formContainer}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Name *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Enter item name"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Category *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.category}
                                onChangeText={(text) => setFormData({ ...formData, category: text })}
                                placeholder="Enter category"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Price *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.price}
                                onChangeText={(text) => setFormData({ ...formData, price: text })}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Stock *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.stock}
                                onChangeText={(text) => setFormData({ ...formData, stock: text })}
                                placeholder="0"
                                keyboardType="number-pad"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="Enter description (optional)"
                                multiline
                                numberOfLines={3}
                            />
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    loadingText: {
        fontSize: 16,
        color: "#666",
    },
    header: {
        backgroundColor: "#fff",
        padding: 20,
        paddingTop: 60,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    addButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    addButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    searchContainer: {
        backgroundColor: "#fff",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    searchInput: {
        backgroundColor: "#f5f5f5",
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    listContainer: {
        flex: 1,
        padding: 16,
    },
    itemCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    itemName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        textTransform: "capitalize",
    },
    itemDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    itemCategory: {
        fontSize: 14,
        color: "#666",
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#007AFF",
    },
    itemFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    stockText: {
        fontSize: 14,
        color: "#666",
    },
    actionButtons: {
        flexDirection: "row",
        gap: 8,
    },
    editButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    editButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    deleteButton: {
        backgroundColor: "#F44336",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    deleteButtonText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    emptyText: {
        textAlign: "center",
        color: "#666",
        fontSize: 16,
        padding: 40,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    cancelButton: {
        color: "#007AFF",
        fontSize: 16,
    },
    saveButton: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "600",
    },
    formContainer: {
        flex: 1,
        padding: 16,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#f5f5f5",
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
})
