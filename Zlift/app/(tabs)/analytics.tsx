"use client"

import { useState, useEffect } from "react"
import { StyleSheet, ScrollView, RefreshControl, View, Text, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../contexts/AuthContext"
import { dashboardService } from "../../services/dashboardService"

const { width: screenWidth } = Dimensions.get("window")

interface SuperAdminAnalytics {
    perPartnerRevenue: Array<{ name: string; revenue: number }>
    avgOrderCost: number
    avgOrdersPerDay: number
    avgProfitPerDay: number
}

interface PartnerManagerAnalytics {
    totalProfit: number
    perDayProfit: number
    todayOrders: number
    todayRevenue: number
}

export default function AnalyticsScreen() {
    const [superAdminAnalytics, setSuperAdminAnalytics] = useState<SuperAdminAnalytics>({
        perPartnerRevenue: [],
        avgOrderCost: 0,
        avgOrdersPerDay: 0,
        avgProfitPerDay: 0,
    })

    const [partnerAnalytics, setPartnerAnalytics] = useState<PartnerManagerAnalytics>({
        totalProfit: 0,
        perDayProfit: 0,
        todayOrders: 0,
        todayRevenue: 0,
    })

    const [refreshing, setRefreshing] = useState(false)
    const [loading, setLoading] = useState(true)

    const { user } = useAuth()

    useEffect(() => {
        loadAnalyticsData()
    }, [user])

    const loadAnalyticsData = async () => {
        try {
            if (user?.role === "super_admin") {
                const response = await dashboardService.getSuperAdminAnalytics()
                if (response.success) {
                    setSuperAdminAnalytics(response.data)
                }
            } else {
                const response = await dashboardService.getPartnerManagerAnalytics()
                if (response.success) {
                    setPartnerAnalytics(response.data)
                }
            }
        } catch (error) {
            console.error("Failed to load analytics data:", error)
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await loadAnalyticsData()
        setRefreshing(false)
    }

    const formatCurrency = (amount: number) => {
        return `$${amount.toFixed(2)}`
    }

    // Super Admin Analytics
    if (user?.role === "super_admin") {
        return (
            <ScrollView
                style={styles.container}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header */}
                <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
                        <Text style={styles.headerSubtitle}>Super Admin View</Text>
                    </View>
                </LinearGradient>

                {/* Key Metrics */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, styles.statCardBlue]}>
                            <Ionicons name="trending-up-outline" size={30} color="#667eea" />
                            <Text style={styles.statNumber}>{formatCurrency(superAdminAnalytics.avgOrderCost)}</Text>
                            <Text style={styles.statLabel}>Avg Order Cost</Text>
                        </View>
                        <View style={[styles.statCard, styles.statCardGreen]}>
                            <Ionicons name="receipt-outline" size={30} color="#10B981" />
                            <Text style={styles.statNumber}>{superAdminAnalytics.avgOrdersPerDay.toFixed(1)}</Text>
                            <Text style={styles.statLabel}>Avg Orders/Day</Text>
                        </View>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={[styles.statCard, styles.statCardOrange]}>
                            <Ionicons name="cash-outline" size={30} color="#F59E0B" />
                            <Text style={styles.statNumber}>{formatCurrency(superAdminAnalytics.avgProfitPerDay)}</Text>
                            <Text style={styles.statLabel}>Avg Profit/Day</Text>
                        </View>
                    </View>
                </View>

                {/* Per Partner Revenue */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Per Partner Revenue</Text>
                    <View style={styles.partnerRevenueContainer}>
                        {superAdminAnalytics.perPartnerRevenue.map((partner, index) => (
                            <View key={index} style={styles.partnerRevenueCard}>
                                <View style={styles.partnerInfo}>
                                    <Text style={styles.partnerName}>{partner.name}</Text>
                                    <Text style={styles.partnerRevenue}>{formatCurrency(partner.revenue)}</Text>
                                </View>
                                <View style={styles.revenueBar}>
                                    <View
                                        style={[
                                            styles.revenueBarFill,
                                            {
                                                width: `${(partner.revenue / Math.max(...superAdminAnalytics.perPartnerRevenue.map((p) => p.revenue))) * 100}%`,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        )
    }

    // Partner Manager Analytics
    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header */}
            <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Analytics Dashboard</Text>
                    <Text style={styles.headerSubtitle}>Partner Manager View</Text>
                </View>
            </LinearGradient>

            {/* Partner Analytics */}
            <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, styles.statCardBlue]}>
                        <Ionicons name="trending-up-outline" size={30} color="#667eea" />
                        <Text style={styles.statNumber}>{formatCurrency(partnerAnalytics.totalProfit)}</Text>
                        <Text style={styles.statLabel}>Total Profit</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardGreen]}>
                        <Ionicons name="calendar-outline" size={30} color="#10B981" />
                        <Text style={styles.statNumber}>{formatCurrency(partnerAnalytics.perDayProfit)}</Text>
                        <Text style={styles.statLabel}>Per Day Profit</Text>
                    </View>
                </View>
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, styles.statCardOrange]}>
                        <Ionicons name="receipt-outline" size={30} color="#F59E0B" />
                        <Text style={styles.statNumber}>{partnerAnalytics.todayOrders}</Text>
                        <Text style={styles.statLabel}>Today Orders</Text>
                    </View>
                    <View style={[styles.statCard, styles.statCardPurple]}>
                        <Ionicons name="cash-outline" size={30} color="#8B5CF6" />
                        <Text style={styles.statNumber}>{formatCurrency(partnerAnalytics.todayRevenue)}</Text>
                        <Text style={styles.statLabel}>Today Revenue</Text>
                    </View>
                </View>
            </View>

            {/* Performance Insights */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Performance Insights</Text>
                <View style={styles.insightsContainer}>
                    <View style={styles.insightCard}>
                        <Ionicons name="trending-up" size={24} color="#10B981" />
                        <Text style={styles.insightText}>Your daily profit has increased by 15% this week</Text>
                    </View>
                    <View style={styles.insightCard}>
                        <Ionicons name="star" size={24} color="#F59E0B" />
                        <Text style={styles.insightText}>
                            You have {partnerAnalytics.todayOrders} orders today, 20% above average
                        </Text>
                    </View>
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
        marginBottom: 20,
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
    partnerRevenueContainer: {
        backgroundColor: "white",
        borderRadius: 12,
        overflow: "hidden",
    },
    partnerRevenueCard: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    partnerInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    partnerName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    partnerRevenue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#10B981",
    },
    revenueBar: {
        height: 6,
        backgroundColor: "#f0f0f0",
        borderRadius: 3,
        overflow: "hidden",
    },
    revenueBarFill: {
        height: "100%",
        backgroundColor: "#667eea",
        borderRadius: 3,
    },
    insightsContainer: {
        backgroundColor: "white",
        borderRadius: 12,
        overflow: "hidden",
    },
    insightCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    insightText: {
        fontSize: 14,
        color: "#666",
        marginLeft: 12,
        flex: 1,
    },
})
