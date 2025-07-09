import BaseService from "./baseService"

interface DashboardStats {
    totalOrders: number
    totalRevenue: number
    activePartners: number
    activeDrones: number
    pendingOrders: number
    completedOrders: number
    totalCustomers: number
    monthlyGrowth: number
}

interface RecentOrder {
    id: string
    customerName: string
    status: string
    amount: number
    createdAt: string
    partnerName: string
    items: number
}

interface AnalyticsData {
    revenue: Array<{
        month: string
        amount: number
    }>
    orders: Array<{
        date: string
        count: number
    }>
    topPartners: Array<{
        name: string
        orders: number
        revenue: number
    }>
}

class DashboardService extends BaseService {
    constructor() {
        super()
    }

    async getDashboardStats(): Promise<any> {
        try {
            const response = await this.get<DashboardStats>("/dashboard/stats")
            return response
        } catch (error: any) {
            console.error("Failed to fetch dashboard stats:", error)
            // Return demo data for development
            return {
                success: true,
                message: "Dashboard stats retrieved (Demo Mode)",
                data: {
                    totalOrders: 1247,
                    totalRevenue: 45678.9,
                    activePartners: 89,
                    activeDrones: 23,
                    pendingOrders: 45,
                    completedOrders: 1202,
                    totalCustomers: 3456,
                    monthlyGrowth: 12.5,
                },
            }
        }
    }

    async getRecentOrders(params?: { limit?: number; status?: string }): Promise<any> {
        try {
            const queryParams = new URLSearchParams()
            if (params?.limit) queryParams.append("limit", params.limit.toString())
            if (params?.status) queryParams.append("status", params.status)

            const endpoint = `/dashboard/recent-orders${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
            const response = await this.get<RecentOrder[]>(endpoint)
            return response
        } catch (error: any) {
            console.error("Failed to fetch recent orders:", error)
            // Return demo data for development
            return {
                success: true,
                message: "Recent orders retrieved (Demo Mode)",
                data: [
                    {
                        id: "1",
                        customerName: "John Doe",
                        status: "delivered",
                        amount: 45.99,
                        createdAt: new Date().toISOString(),
                        partnerName: "Pizza Palace",
                        items: 3,
                    },
                    {
                        id: "2",
                        customerName: "Jane Smith",
                        status: "in_transit",
                        amount: 32.5,
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                        partnerName: "Burger Barn",
                        items: 2,
                    },
                    {
                        id: "3",
                        customerName: "Mike Johnson",
                        status: "pending",
                        amount: 78.25,
                        createdAt: new Date(Date.now() - 7200000).toISOString(),
                        partnerName: "Sushi Spot",
                        items: 5,
                    },
                    {
                        id: "4",
                        customerName: "Sarah Wilson",
                        status: "delivered",
                        amount: 23.75,
                        createdAt: new Date(Date.now() - 10800000).toISOString(),
                        partnerName: "Coffee Corner",
                        items: 1,
                    },
                    {
                        id: "5",
                        customerName: "Tom Brown",
                        status: "cancelled",
                        amount: 56.0,
                        createdAt: new Date(Date.now() - 14400000).toISOString(),
                        partnerName: "Taco Time",
                        items: 4,
                    },
                ],
            }
        }
    }

    async getAnalyticsData(period = "30d"): Promise<any> {
        try {
            const response = await this.get<AnalyticsData>(`/dashboard/analytics?period=${period}`)
            return response
        } catch (error: any) {
            console.error("Failed to fetch analytics data:", error)
            // Return demo data for development
            return {
                success: true,
                message: "Analytics data retrieved (Demo Mode)",
                data: {
                    revenue: [
                        { month: "Jan", amount: 12000 },
                        { month: "Feb", amount: 15000 },
                        { month: "Mar", amount: 18000 },
                        { month: "Apr", amount: 22000 },
                        { month: "May", amount: 25000 },
                        { month: "Jun", amount: 28000 },
                    ],
                    orders: [
                        { date: "2024-01-01", count: 45 },
                        { date: "2024-01-02", count: 52 },
                        { date: "2024-01-03", count: 38 },
                        { date: "2024-01-04", count: 61 },
                        { date: "2024-01-05", count: 49 },
                    ],
                    topPartners: [
                        { name: "Pizza Palace", orders: 234, revenue: 12450 },
                        { name: "Burger Barn", orders: 189, revenue: 9876 },
                        { name: "Sushi Spot", orders: 156, revenue: 15678 },
                    ],
                },
            }
        }
    }

    async getPartnerStats(): Promise<any> {
        try {
            const response = await this.get("/dashboard/partner-stats")
            return response
        } catch (error: any) {
            console.error("Failed to fetch partner stats:", error)
            // Return demo data for development
            return {
                success: true,
                message: "Partner stats retrieved (Demo Mode)",
                data: {
                    totalPartners: 89,
                    activePartners: 76,
                    newPartnersThisMonth: 8,
                    topPerformingPartners: [
                        { name: "Pizza Palace", rating: 4.8, orders: 234 },
                        { name: "Burger Barn", rating: 4.6, orders: 189 },
                        { name: "Sushi Spot", rating: 4.9, orders: 156 },
                    ],
                },
            }
        }
    }

    async getDroneStats(): Promise<any> {
        try {
            const response = await this.get("/dashboard/drone-stats")
            return response
        } catch (error: any) {
            console.error("Failed to fetch drone stats:", error)
            // Return demo data for development
            return {
                success: true,
                message: "Drone stats retrieved (Demo Mode)",
                data: {
                    totalDrones: 23,
                    activeDrones: 18,
                    dronesInMaintenance: 3,
                    dronesIdle: 2,
                    averageDeliveryTime: 28, // minutes
                    successfulDeliveries: 98.5, // percentage
                },
            }
        }
    }

    // Super Admin specific methods
    async getSuperAdminStats(): Promise<any> {
        try {
            const response = await this.get("/dashboard/super-admin/stats")
            return response
        } catch (error: any) {
            console.error("Failed to fetch super admin stats:", error)
            return {
                success: true,
                message: "Super admin stats retrieved (Demo Mode)",
                data: {
                    totalPartners: 89,
                    activeDrones: 23,
                    todayRevenue: 12450.75,
                    totalOrders: 1247,
                },
            }
        }
    }

    async getSuperAdminAnalytics(): Promise<any> {
        try {
            const response = await this.get("/dashboard/super-admin/analytics")
            return response
        } catch (error: any) {
            console.error("Failed to fetch super admin analytics:", error)
            return {
                success: true,
                message: "Super admin analytics retrieved (Demo Mode)",
                data: {
                    perPartnerRevenue: [
                        { name: "Pizza Palace", revenue: 15420.5 },
                        { name: "Burger Barn", revenue: 12350.25 },
                        { name: "Sushi Spot", revenue: 18750.75 },
                        { name: "Taco Time", revenue: 9875.0 },
                        { name: "Coffee Corner", revenue: 6420.3 },
                    ],
                    avgOrderCost: 45.75,
                    avgOrdersPerDay: 85.5,
                    avgProfitPerDay: 1250.8,
                },
            }
        }
    }

    // Partner Manager specific methods
    async getPartnerManagerStats(): Promise<any> {
        try {
            const response = await this.get("/dashboard/partner-manager/stats")
            return response
        } catch (error: any) {
            console.error("Failed to fetch partner manager stats:", error)
            return {
                success: true,
                message: "Partner manager stats retrieved (Demo Mode)",
                data: {
                    totalOrders: 234,
                    successfulOrders: 198,
                    cancelledOrders: 12,
                    totalItems: 45,
                },
            }
        }
    }

    async getPartnerManagerAnalytics(): Promise<any> {
        try {
            const response = await this.get("/dashboard/partner-manager/analytics")
            return response
        } catch (error: any) {
            console.error("Failed to fetch partner manager analytics:", error)
            return {
                success: true,
                message: "Partner manager analytics retrieved (Demo Mode)",
                data: {
                    totalProfit: 8450.75,
                    perDayProfit: 285.5,
                    todayOrders: 12,
                    todayRevenue: 567.25,
                },
            }
        }
    }

    // Inventory management
    async getInventoryItems(): Promise<any> {
        try {
            const response = await this.get("/dashboard/inventory")
            return response
        } catch (error: any) {
            console.error("Failed to fetch inventory items:", error)
            return {
                success: true,
                message: "Inventory items retrieved (Demo Mode)",
                data: [
                    {
                        id: "1",
                        name: "Margherita Pizza",
                        category: "Pizza",
                        price: 12.99,
                        stock: 25,
                        status: "available",
                    },
                    {
                        id: "2",
                        name: "Chicken Burger",
                        category: "Burger",
                        price: 8.99,
                        stock: 5,
                        status: "low_stock",
                    },
                    {
                        id: "3",
                        name: "California Roll",
                        category: "Sushi",
                        price: 15.99,
                        stock: 0,
                        status: "out_of_stock",
                    },
                    {
                        id: "4",
                        name: "Beef Tacos",
                        category: "Mexican",
                        price: 9.99,
                        stock: 18,
                        status: "available",
                    },
                    {
                        id: "5",
                        name: "Cappuccino",
                        category: "Coffee",
                        price: 4.99,
                        stock: 50,
                        status: "available",
                    },
                ],
            }
        }
    }

    async addInventoryItem(item: {
        name: string
        category: string
        price: number
        stock: number
        description?: string
    }): Promise<any> {
        try {
            const response = await this.post("/dashboard/inventory", item)
            return response
        } catch (error: any) {
            console.error("Failed to add inventory item:", error)
            throw error
        }
    }

    async updateInventoryItem(
        id: string,
        item: {
            name?: string
            category?: string
            price?: number
            stock?: number
            description?: string
        },
    ): Promise<any> {
        try {
            const response = await this.put(`/dashboard/inventory/${id}`, item)
            return response
        } catch (error: any) {
            console.error("Failed to update inventory item:", error)
            throw error
        }
    }

    async deleteInventoryItem(id: string): Promise<any> {
        try {
            const response = await this.delete(`/dashboard/inventory/${id}`)
            return response
        } catch (error: any) {
            console.error("Failed to delete inventory item:", error)
            throw error
        }
    }

    async getSystemHealth(): Promise<any> {
        return this.get("/dashboard/health")
    }

    async getActivityFeed(params?: {
        limit?: number
        offset?: number
    }): Promise<any> {
        return this.get("/dashboard/activity")
    }
}

export const dashboardService = new DashboardService()
