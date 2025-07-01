"use client"

import { useState, useEffect } from "react"
import { StyleSheet, ScrollView, RefreshControl, View, Text, TouchableOpacity, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { dashboardService } from "../../services/dashboardService"

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  activePartners: number
  activeDrones: number
}

interface RecentOrder {
  id: string
  customerName: string
  status: string
  amount: number
  createdAt: string
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    activePartners: 0,
    activeDrones: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  const { user, logout } = useAuth()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsResponse, ordersResponse] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentOrders({ limit: 5 }),
      ])

      if (statsResponse.success) {
        setStats(statsResponse.data)
      }

      if (ordersResponse.success) {
        setRecentOrders(ordersResponse.data)
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ])
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "#10B981"
      case "in_transit":
        return "#F59E0B"
      case "pending":
        return "#6B7280"
      default:
        return "#6B7280"
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || "Admin"}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Ionicons name="receipt-outline" size={30} color="#667eea" />
            <Text style={styles.statNumber}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Ionicons name="cash-outline" size={30} color="#10B981" />
            <Text style={styles.statNumber}>{formatCurrency(stats.totalRevenue)}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <Ionicons name="storefront-outline" size={30} color="#F59E0B" />
            <Text style={styles.statNumber}>{stats.activePartners}</Text>
            <Text style={styles.statLabel}>Active Partners</Text>
          </View>
          <View style={[styles.statCard, styles.statCardPurple]}>
            <Ionicons name="airplane-outline" size={30} color="#8B5CF6" />
            <Text style={styles.statNumber}>{stats.activeDrones}</Text>
            <Text style={styles.statLabel}>Active Drones</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle-outline" size={24} color="#667eea" />
            <Text style={styles.actionText}>New Order</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="people-outline" size={24} color="#667eea" />
            <Text style={styles.actionText}>Manage Partners</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="airplane-outline" size={24} color="#667eea" />
            <Text style={styles.actionText}>Drone Status</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="bar-chart-outline" size={24} color="#667eea" />
            <Text style={styles.actionText}>Analytics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <View style={styles.ordersContainer}>
          {recentOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderCustomer}>{order.customerName}</Text>
                <Text style={styles.orderAmount}>{formatCurrency(order.amount)}</Text>
              </View>
              <View style={styles.orderFooter}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{order.status.replace("_", " ")}</Text>
                </View>
                <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
              </View>
            </View>
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
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  logoutButton: {
    padding: 8,
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
  statCardPurple: {
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
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
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
    textAlign: "center",
  },
  ordersContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  orderCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderCustomer: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10B981",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    textTransform: "capitalize",
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
  },
})
