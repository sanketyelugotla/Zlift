"use client"

import { useState, useEffect } from "react"
import { StyleSheet, ScrollView, RefreshControl, View, Text, TouchableOpacity, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { dashboardService } from "../../services/dashboardService"

interface InventoryItem {
    id: string
    name: string
    category: string
    price: number
    stock: number
    status: "available" | "out_of_stock" | "low_stock"
}

export default function InventoryScreen() {
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
    const [refreshing, setRefreshing] = useState(false)
    const [loading, setLoading] = useState(true)

    const { user } = useAuth()

    useEffect(() => {
        loadInventoryData()
    }, [])

    const loadInventoryData = async () => {
        try {
            const response = await dashboardService.getInventoryItems()
            if (response.success) {
                setInventoryItems(response.data)
            }
        } catch (error) {
            console.error("Failed to load inventory data:", error)
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await loadInventoryData()
        setRefreshing(false)
    }

    const handleAddItem = () => {
        Alert.alert("Add Item", "Add new item functionality will be implemented here")
    }

    const handleEditItem = (item: InventoryItem) => {
        Alert.alert("Edit Item", `Edit ${item.name} functionality will be implemented here`)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "available":
                return "#10B981"
            case "low_stock":
                return "#F59E0B"
            case "out_of_stock":
                return "#EF4444"
            default:
                return "#6B7280"
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case "available":
                return "Available"
            case "low_stock":
                return "Low Stock"
            case "out_of_stock":
                return "Out of Stock"
            default:
                return "Unknown"
        }
    }

    const formatCurrency = (amount: number) => {
        return `$${amount.toFixed(2)}`
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header */}
            <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Inventory Management</Text>
                    <Text style={styles.headerSubtitle}>Manage your products</Text>
                </View>
            </LinearGradient>

            {/* Add Item Button */}
            <View style={styles.addItemContainer}>
                <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem}>
                    <Ionicons name="add-circle-outline" size={24} color="white" />
                    <Text style={styles.addItemText}>Add New Item</Text>
                </TouchableOpacity>
            </View>

            {/* Inventory Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, styles.statCardBlue]}>
                        <Ionicons name="cube-outline" size={30} color="#667eea" />
                        <Text style={styles.statNumber}>{inventoryItems.length}</Text>
                        <Text style={styles.statLabel}>Total Items</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardGreen]}>
                        <Ionicons name="checkmark-circle-outline" size={30} color="#10B981" />
                        <Text style={styles.statNumber}>{inventoryItems.filter((item) => item.status === "available").length}</Text>
                        <Text style={styles.statLabel}>Available</Text>
                    </View>
                </View>
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, styles.statCardOrange]}>
                        <Ionicons name="warning-outline" size={30} color="#F59E0B" />
                        <Text style={styles.statNumber}>{inventoryItems.filter((item) => item.status === "low_stock").length}</Text>
                        <Text style={styles.statLabel}>Low Stock</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardRed]}>
                        <Ionicons name="close-circle-outline" size={30} color="#EF4444" />
                        <Text style={styles.statNumber}>
                            {inventoryItems.filter((item) => item.status === "out_of_stock").length}
                        </Text>
                        <Text style={styles.statLabel}>Out of Stock</Text>
                    </View>
                </View>
            </View>

            {/* Inventory Items */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Inventory Items</Text>
                <View style={styles.itemsContainer}>
                    {inventoryItems.map((item) => (
                        <TouchableOpacity key={item.id} style={styles.itemCard} onPress={() => handleEditItem(item)}>
                            <View style={styles.itemHeader}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemCategory}>{item.category}</Text>
                                </View>
                                <View style={styles.itemPriceContainer}>
                                    <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                                </View>
                            </View>
                            <View style={styles.itemFooter}>
                                <View style={styles.stockInfo}>
                                    <Text style={styles.stockText}>Stock: {item.stock}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    headerContent: {
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    headerSubtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
        marginTop: 5,
    },
    addItemContainer: {
        padding: 20,
        marginTop: -20,
    },
    addItemButton: {
        backgroundColor: "#667eea",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    addItemText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    statsContainer: {
        padding: 20,
        marginTop: -20,
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    statCard: {
        flex: 1,
        backgroundColor: "white",
        borderRadius: 15,
        padding: 20,
        alignItems: "center",
        marginHorizontal: 5,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    statCardBlue: {
        borderLeftWidth: 4,
        borderLeftColor: "#667eea",
    },
    statCardGreen: {
        borderLeftWidth: 4,
        borderLeftColor: "#10B981",
    },
    statCardOrange: {
        borderLeftWidth: 4,
        borderLeftColor: "#F59E0B",
    },
    statCardRed: {
        borderLeftWidth: 4,
        borderLeftColor: "#EF4444",
    },
    statNumber: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginTop: 10,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        marginTop: 5,
        textAlign: "center",
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
    },
    itemsContainer: {
        backgroundColor: "white",
        borderRadius: 12,
        overflow: "hidden",
    },
    itemCard: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    itemCategory: {
        fontSize: 14,
        color: "#666",
        marginTop: 2,
    },
    itemPriceContainer: {
        alignItems: "flex-end",
    },
    itemPrice: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#10B981",
    },
    itemFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    stockInfo: {
        flex: 1,
    },
    stockText: {
        fontSize: 14,
        color: "#666",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        color: "white",
        fontWeight: "600",
    },
})
