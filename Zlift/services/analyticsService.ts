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
    }): Promise<ApiResponse<SalesAnalytics>> {
        const queryString = this.buildQueryString(params)
        return this.request(`/analytics/sales${queryString}`)
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
