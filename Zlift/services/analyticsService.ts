import BaseService, { type ApiResponse } from "./baseService"

interface SalesAnalytics {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    revenueGrowth: number
    ordersGrowth: number
    revenueByPeriod: Array<{ date: string; revenue: number; orders: number }>
    revenueByPartner: Array<{ partnerId: string; partnerName: string; revenue: number; orders: number }>
    revenueByCategory: Array<{ category: string; revenue: number; percentage: number }>
}

interface PerformanceMetrics {
    averageDeliveryTime: number
    onTimeDeliveryRate: number
    customerSatisfactionRate: number
    droneUtilizationRate: number
    partnerPerformance: Array<{
        partnerId: string
        partnerName: string
        averagePreparationTime: number
        orderAccuracy: number
        rating: number
    }>
}

class AnalyticsService extends BaseService {
    async getSalesAnalytics(params?: {
        startDate?: string
        endDate?: string
        partnerId?: string
        groupBy?: "day" | "week" | "month"
        period?: string
    }): Promise<any> {
        try {
            const queryString = this.buildQueryString(params)
            const response = await this.get(`/analytics/sales${queryString}`)
            return response
        } catch (error: any) {
            console.error("Failed to fetch sales analytics:", error)

            // Return demo data for development
            return {
                success: true,
                message: "Sales analytics retrieved (Demo Mode)",
                data: {
                    totalRevenue: 125000,
                    totalOrders: 2450,
                    averageOrderValue: 51.02,
                    revenueGrowth: 15.5,
                    ordersGrowth: 12.3,
                    salesTrend: [
                        { date: "2024-01-01", totalRevenue: 1200, orders: 25 },
                        { date: "2024-01-02", totalRevenue: 1450, orders: 28 },
                        { date: "2024-01-03", totalRevenue: 1100, orders: 22 },
                        { date: "2024-01-04", totalRevenue: 1650, orders: 32 },
                        { date: "2024-01-05", totalRevenue: 1380, orders: 27 },
                        { date: "2024-01-06", totalRevenue: 1520, orders: 30 },
                        { date: "2024-01-07", totalRevenue: 1750, orders: 35 },
                    ],
                    partnerTypeStats: [
                        { _id: "Restaurant", totalRevenue: 75000, count: 45 },
                        { _id: "Pharmacy", totalRevenue: 25000, count: 15 },
                        { _id: "Grocery", totalRevenue: 20000, count: 12 },
                        { _id: "Retail", totalRevenue: 5000, count: 8 },
                    ],
                    hourlyStats: [
                        { _id: 9, orderCount: 15 },
                        { _id: 10, orderCount: 25 },
                        { _id: 11, orderCount: 35 },
                        { _id: 12, orderCount: 45 },
                        { _id: 13, orderCount: 40 },
                        { _id: 14, orderCount: 30 },
                        { _id: 15, orderCount: 25 },
                        { _id: 16, orderCount: 20 },
                        { _id: 17, orderCount: 35 },
                        { _id: 18, orderCount: 50 },
                        { _id: 19, orderCount: 45 },
                        { _id: 20, orderCount: 30 },
                    ],
                    summary: {
                        totalOrders: 2450,
                        totalRevenue: 125000,
                        totalProfit: 37500,
                    },
                },
            }
        }
    }

    async getRevenueAnalytics(params?: {
        startDate?: string
        endDate?: string
        groupBy?: "day" | "week" | "month"
    }): Promise<
        ApiResponse<{
            totalRevenue: number
            revenueGrowth: number
            revenueByPeriod: Array<{ date: string; revenue: number }>
            revenueBySource: Array<{ source: string; revenue: number; percentage: number }>
            projectedRevenue: Array<{ date: string; projected: number }>
        }>
    > {
        const queryString = this.buildQueryString(params)
        return this.request(`/analytics/revenue${queryString}`)
    }

    async getPerformanceMetrics(params?: {
        startDate?: string
        endDate?: string
    }): Promise<ApiResponse<PerformanceMetrics>> {
        const queryString = this.buildQueryString(params)
        return this.request(`/analytics/performance${queryString}`)
    }

    async getCustomerAnalytics(params?: {
        startDate?: string
        endDate?: string
    }): Promise<
        ApiResponse<{
            totalCustomers: number
            newCustomers: number
            returningCustomers: number
            customerRetentionRate: number
            averageOrdersPerCustomer: number
            customerLifetimeValue: number
            customersByLocation: Array<{ city: string; count: number }>
            customerGrowth: Array<{ date: string; new: number; total: number }>
        }>
    > {
        const queryString = this.buildQueryString(params)
        return this.request(`/analytics/customers${queryString}`)
    }

    async getOperationalAnalytics(params?: {
        startDate?: string
        endDate?: string
    }): Promise<
        ApiResponse<{
            totalDeliveries: number
            successfulDeliveries: number
            failedDeliveries: number
            averageDeliveryTime: number
            droneUtilization: number
            operatorEfficiency: Array<{
                operatorId: string
                operatorName: string
                deliveries: number
                averageTime: number
                successRate: number
            }>
            deliveryHeatmap: Array<{
                location: { lat: number; lng: number }
                deliveries: number
            }>
        }>
    > {
        const queryString = this.buildQueryString(params)
        return this.request(`/analytics/operations${queryString}`)
    }

    async generateReport(
        type: "sales" | "operations" | "partners" | "customers",
        params: {
            startDate: string
            endDate: string
            format?: "pdf" | "excel" | "csv"
            email?: string
        },
    ): Promise<
        ApiResponse<{
            reportId: string
            downloadUrl?: string
            status: "generating" | "completed" | "failed"
        }>
    > {
        return this.request(`/analytics/reports/${type}`, {
            method: "POST",
            body: JSON.stringify(params),
        })
    }

    async getReportStatus(reportId: string): Promise<
        ApiResponse<{
            status: "generating" | "completed" | "failed"
            downloadUrl?: string
            error?: string
        }>
    > {
        return this.request(`/analytics/reports/${reportId}/status`)
    }
}

export const analyticsService = new AnalyticsService()
