import BaseService, { type ApiResponse } from "./baseService"

interface Order {
    _id: string
    orderNumber: string
    customerId: string
    customerName: string
    partnerId: string
    partnerName: string
    items: Array<{
        productId: string
        name: string
        quantity: number
        price: number
    }>
    status: "pending" | "confirmed" | "preparing" | "ready" | "picked_up" | "in_transit" | "delivered" | "cancelled"
    total: number
    deliveryAddress: {
        street: string
        city: string
        state: string
        zipCode: string
        coordinates: { lat: number; lng: number }
    }
    droneId?: string
    operatorId?: string
    estimatedDeliveryTime?: string
    actualDeliveryTime?: string
    createdAt: string
    updatedAt: string
}

interface OrderFilters {
    page?: number
    limit?: number
    status?: string
    partnerId?: string
    customerId?: string
    droneId?: string
    startDate?: string
    endDate?: string
    search?: string
}

class OrderService extends BaseService {
    async getOrders(filters?: OrderFilters): Promise<
        ApiResponse<{
            orders: Order[]
            total: number
            page: number
            totalPages: number
        }>
    > {
        const queryString = this.buildQueryString(filters)
        return this.request(`/orders${queryString}`)
    }

    async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
        return this.request(`/orders/${orderId}`)
    }

    async getRecentOrders(limit = 10): Promise<ApiResponse<Order[]>> {
        return this.request(`/orders/recent?limit=${limit}`)
    }

    async updateOrderStatus(orderId: string, status: Order["status"], notes?: string): Promise<ApiResponse<Order>> {
        return this.request(`/orders/${orderId}/status`, {
            method: "PUT",
            body: JSON.stringify({ status, notes }),
        })
    }

    async assignDroneToOrder(orderId: string, droneId: string, operatorId?: string): Promise<ApiResponse<Order>> {
        return this.request(`/orders/${orderId}/assign-drone`, {
            method: "PUT",
            body: JSON.stringify({ droneId, operatorId }),
        })
    }

    async getOrderTracking(orderId: string): Promise<
        ApiResponse<{
            currentLocation: { lat: number; lng: number }
            estimatedArrival: string
            status: string
            timeline: Array<{
                status: string
                timestamp: string
                location?: { lat: number; lng: number }
            }>
        }>
    > {
        return this.request(`/orders/${orderId}/tracking`)
    }

    async cancelOrder(orderId: string, reason: string): Promise<ApiResponse<Order>> {
        return this.request(`/orders/${orderId}/cancel`, {
            method: "PUT",
            body: JSON.stringify({ reason }),
        })
    }

    async getOrderAnalytics(params?: {
        startDate?: string
        endDate?: string
        groupBy?: "day" | "week" | "month"
    }): Promise<
        ApiResponse<{
            totalOrders: number
            completedOrders: number
            cancelledOrders: number
            averageOrderValue: number
            ordersByStatus: Array<{ status: string; count: number }>
            ordersOverTime: Array<{ date: string; count: number }>
        }>
    > {
        const queryString = this.buildQueryString(params)
        return this.request(`/analytics/orders${queryString}`)
    }
}

export const orderService = new OrderService()
