"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, Alert } from "react-native"
import { useAuth } from "@/contexts/AuthContext"
import { dashboardService } from "@/services/dashboardService"

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

const { width } = Dimensions.get("window")

export default function AnalyticsScreen() {
    const { user } = useAuth()
    const [analytics, setAnalytics] = useState<SuperAdminAnalytics | PartnerManagerAnalytics | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const isSuperAdmin = user?.role === "super_admin"
    const isPartnerManager = user?.role === "partner_manager"

    useEffect(() => {
        loadAnalyticsData()
    }, [user])

    const loadAnalyticsData = async () => {
        try {
            setIsLoading(true)

            let response
            if (isSuperAdmin) {
                response = await dashboardService.getSuperAdminAnalytics()
            } else if (isPartnerManager) {
                response = await dashboardService.getPartnerManagerAnalytics()
            }

            if (response?.success) {
                setAnalytics(response.data)
            }
        } catch (error) {
            console.error("Failed to load analytics data:", error)
            Alert.alert("Error", "Failed to load analytics data")
        } finally {
            setIsLoading(false)
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

    const renderRevenueBar = (partner: { name: string; revenue: number }, maxRevenue: number) => {
        const barWidth = (partner.revenue / maxRevenue) * (width - 80)

        return (
            <View key={partner.name} style={styles.revenueBarContainer}>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <View style={styles.barBackground}>
                    <View style={[styles.bar, { width: barWidth }]} />
                </View>
                <Text style={styles.revenueAmount}>{formatCurrency(partner.revenue)}</Text>
            </View>
        )
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading analytics...</Text>
            </View>
        )
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{isSuperAdmin ? "Super Admin Analytics" : "Partner Analytics"}</Text>
            </View>

            {isSuperAdmin && analytics && "perPartnerRevenue" in analytics ? (
                <>
                    {/* Per Partner Revenue */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Per Partner Revenue</Text>
                        {analytics.perPartnerRevenue.length > 0 ? (
                            <>
                                {analytics.perPartnerRevenue.map((partner) =>
                                    renderRevenueBar(partner, Math.max(...analytics.perPartnerRevenue.map((p) => p.revenue))),
                                )}
                            </>
                        ) : (
                            <Text style={styles.emptyText}>No revenue data available</Text>
                        )}
                    </View>

                    {/* Key Metrics */}
                    <View style={styles.metricsContainer}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricNumber}>{formatCurrency(analytics.avgOrderCost)}</Text>
                            <Text style={styles.metricLabel}>Avg Order Cost</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricNumber}>{analytics.avgOrdersPerDay.toFixed(1)}</Text>
                            <Text style={styles.metricLabel}>Avg Orders/Day</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricNumber}>{formatCurrency(analytics.avgProfitPerDay)}</Text>
                            <Text style={styles.metricLabel}>Avg Profit/Day</Text>
                        </View>
                    </View>
                </>
            ) : isPartnerManager && analytics && "totalProfit" in analytics ? (
                <>
                    {/* Partner Manager Analytics */}
                    <View style={styles.metricsContainer}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricNumber}>{formatCurrency(analytics.totalProfit)}</Text>
                            <Text style={styles.metricLabel}>Total Profit</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricNumber}>{formatCurrency(analytics.perDayProfit)}</Text>
                            <Text style={styles.metricLabel}>Per Day Profit</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricNumber}>{analytics.todayOrders}</Text>
                            <Text style={styles.metricLabel}>Today Orders</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricNumber}>{formatCurrency(analytics.todayRevenue)}</Text>
                            <Text style={styles.metricLabel}>Today Revenue</Text>
                        </View>
                    </View>
                </>
            ) : (
                <View style={styles.section}>
                    <Text style={styles.emptyText}>No analytics data available</Text>
                </View>
            )}
        </ScrollView>
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
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    section: {
        margin: 16,
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 16,
    },
    revenueBarContainer: {
        marginBottom: 16,
    },
    partnerName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    barBackground: {
        height: 20,
        backgroundColor: "#e0e0e0",
        borderRadius: 10,
        marginBottom: 4,
    },
    bar: {
        height: 20,
        backgroundColor: "#007AFF",
        borderRadius: 10,
    },
    revenueAmount: {
        fontSize: 12,
        color: "#666",
        textAlign: "right",
    },
    metricsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        padding: 16,
        gap: 16,
    },
    metricCard: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 8,
        flex: 1,
        minWidth: "45%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    metricNumber: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#007AFF",
    },
    metricLabel: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
        textAlign: "center",
    },
    emptyText: {
        textAlign: "center",
        color: "#666",
        fontSize: 16,
        padding: 20,
    },
})
