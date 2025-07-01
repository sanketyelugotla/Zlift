const API_BASE_URL = "http://localhost:5000/api" // Change this to your server URL

interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

class ApiService {
    private authToken: string | null = null

    setAuthToken(token: string | null) {
        this.authToken = token
    }

    private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const url = `${API_BASE_URL}${endpoint}`

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...options.headers,
        }

        if (this.authToken) {
            headers.Authorization = `Bearer ${this.authToken}`
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`)
            }

            return data
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error)
            throw error
        }
    }

    // Auth endpoints
    async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
        return this.request("/auth/admin/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        })
    }

    async refreshToken(): Promise<ApiResponse<{ token: string }>> {
        return this.request("/auth/refresh", {
            method: "POST",
        })
    }

    // Dashboard endpoints
    async getDashboardAnalytics(): Promise<ApiResponse<any>> {
        return this.request("/analytics/dashboard")
    }

    async getDashboardStats(): Promise<ApiResponse<any>> {
        return this.request("/analytics/stats")
    }

    // Orders endpoints
    async getOrders(params?: {
        page?: number
        limit?: number
        status?: string
        partnerId?: string
        customerId?: string
        startDate?: string
        endDate?: string
    }): Promise<ApiResponse<any>> {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : ""
        return this.request(`/orders${queryString}`)
    }

    async getOrderById(orderId: string): Promise<ApiResponse<any>> {
        return this.request(`/orders/${orderId}`)
    }

    async getRecentOrders(limit = 10): Promise<ApiResponse<any>> {
        return this.request(`/orders/recent?limit=${limit}`)
    }

    async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<any>> {
        return this.request(`/orders/${orderId}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        })
    }

    async assignDroneToOrder(orderId: string, droneId: string): Promise<ApiResponse<any>> {
        return this.request(`/orders/${orderId}/assign-drone`, {
            method: "PUT",
            body: JSON.stringify({ droneId }),
        })
    }

    // Partners endpoints
    async getPartners(params?: {
        page?: number
        limit?: number
        status?: string
        businessType?: string
        city?: string
    }): Promise<ApiResponse<any>> {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : ""
        return this.request(`/partners${queryString}`)
    }

    async getPartnerById(partnerId: string): Promise<ApiResponse<any>> {
        return this.request(`/partners/${partnerId}`)
    }

    async updatePartnerStatus(partnerId: string, status: string): Promise<ApiResponse<any>> {
        return this.request(`/partners/${partnerId}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        })
    }

    async approvePartner(partnerId: string): Promise<ApiResponse<any>> {
        return this.request(`/partners/${partnerId}/approve`, {
            method: "PUT",
        })
    }

    async rejectPartner(partnerId: string, reason: string): Promise<ApiResponse<any>> {
        return this.request(`/partners/${partnerId}/reject`, {
            method: "PUT",
            body: JSON.stringify({ reason }),
        })
    }

    // Products endpoints
    async getProducts(params?: {
        page?: number
        limit?: number
        partnerId?: string
        category?: string
        isActive?: boolean
    }): Promise<ApiResponse<any>> {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : ""
        return this.request(`/products${queryString}`)
    }

    async getProductById(productId: string): Promise<ApiResponse<any>> {
        return this.request(`/products/${productId}`)
    }

    async updateProductStatus(productId: string, isActive: boolean): Promise<ApiResponse<any>> {
        return this.request(`/products/${productId}/status`, {
            method: "PUT",
            body: JSON.stringify({ isActive }),
        })
    }

    // Customers endpoints
    async getCustomers(params?: {
        page?: number
        limit?: number
        isActive?: boolean
        city?: string
    }): Promise<ApiResponse<any>> {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : ""
        return this.request(`/customers${queryString}`)
    }

    async getCustomerById(customerId: string): Promise<ApiResponse<any>> {
        return this.request(`/customers/${customerId}`)
    }

    async updateCustomerStatus(customerId: string, isActive: boolean): Promise<ApiResponse<any>> {
        return this.request(`/customers/${customerId}/status`, {
            method: "PUT",
            body: JSON.stringify({ isActive }),
        })
    }

    // Drones endpoints
    async getDrones(params?: {
        page?: number
        limit?: number
        status?: string
        operatorId?: string
    }): Promise<ApiResponse<any>> {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : ""
        return this.request(`/drones${queryString}`)
    }

    async getDroneById(droneId: string): Promise<ApiResponse<any>> {
        return this.request(`/drones/${droneId}`)
    }

    async updateDroneStatus(droneId: string, status: string): Promise<ApiResponse<any>> {
        return this.request(`/drones/${droneId}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        })
    }

    async getDroneLocation(droneId: string): Promise<ApiResponse<any>> {
        return this.request(`/drones/${droneId}/location`)
    }

    // Drone Operators endpoints
    async getOperators(params?: {
        page?: number
        limit?: number
        isActive?: boolean
        city?: string
    }): Promise<ApiResponse<any>> {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : ""
        return this.request(`/operators${queryString}`)
    }

    async getOperatorById(operatorId: string): Promise<ApiResponse<any>> {
        return this.request(`/operators/${operatorId}`)
    }

    async updateOperatorStatus(operatorId: string, isActive: boolean): Promise<ApiResponse<any>> {
        return this.request(`/operators/${operatorId}/status`, {
            method: "PUT",
            body: JSON.stringify({ isActive }),
        })
    }

    // Analytics endpoints
    async getSalesAnalytics(params?: {
        startDate?: string
        endDate?: string
        partnerId?: string
        groupBy?: "day" | "week" | "month"
    }): Promise<ApiResponse<any>> {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : ""
        return this.request(`/analytics/sales${queryString}`)
    }

    async getOrderAnalytics(params?: {
        startDate?: string
        endDate?: string
        status?: string
    }): Promise<ApiResponse<any>> {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : ""
        return this.request(`/analytics/orders${queryString}`)
    }

    async getPartnerAnalytics(params?: {
        startDate?: string
        endDate?: string
        partnerId?: string
    }): Promise<ApiResponse<any>> {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : ""
        return this.request(`/analytics/partners${queryString}`)
    }

    async getRevenueAnalytics(params?: {
        startDate?: string
        endDate?: string
        groupBy?: "day" | "week" | "month"
    }): Promise<ApiResponse<any>> {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : ""
        return this.request(`/analytics/revenue${queryString}`)
    }

    // Payments endpoints
    async getPayments(params?: {
        page?: number
        limit?: number
        status?: string
        method?: string
        orderId?: string
    }): Promise<ApiResponse<any>> {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : ""
        return this.request(`/payments${queryString}`)
    }

    async getPaymentById(paymentId: string): Promise<ApiResponse<any>> {
        return this.request(`/payments/${paymentId}`)
    }

    async updatePaymentStatus(paymentId: string, status: string): Promise<ApiResponse<any>> {
        return this.request(`/payments/${paymentId}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        })
    }

    // Reports endpoints
    async generateSalesReport(params: {
        startDate: string
        endDate: string
        format?: "pdf" | "excel"
    }): Promise<ApiResponse<any>> {
        return this.request("/reports/sales", {
            method: "POST",
            body: JSON.stringify(params),
        })
    }

    async generateOrdersReport(params: {
        startDate: string
        endDate: string
        status?: string
        format?: "pdf" | "excel"
    }): Promise<ApiResponse<any>> {
        return this.request("/reports/orders", {
            method: "POST",
            body: JSON.stringify(params),
        })
    }

    async generatePartnersReport(params: {
        startDate: string
        endDate: string
        format?: "pdf" | "excel"
    }): Promise<ApiResponse<any>> {
        return this.request("/reports/partners", {
            method: "POST",
            body: JSON.stringify(params),
        })
    }

    // Notifications endpoints
    async getNotifications(params?: {
        page?: number
        limit?: number
        isRead?: boolean
        type?: string
    }): Promise<ApiResponse<any>> {
        const queryString = params ? `?${new URLSearchParams(params as any)}` : ""
        return this.request(`/notifications${queryString}`)
    }

    async markNotificationAsRead(notificationId: string): Promise<ApiResponse<any>> {
        return this.request(`/notifications/${notificationId}/read`, {
            method: "PUT",
        })
    }

    async markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
        return this.request("/notifications/read-all", {
            method: "PUT",
        })
    }

    async sendNotification(data: {
        title: string
        message: string
        type: string
        recipients: string[]
    }): Promise<ApiResponse<any>> {
        return this.request("/notifications/send", {
            method: "POST",
            body: JSON.stringify(data),
        })
    }

    // Settings endpoints
    async getSettings(): Promise<ApiResponse<any>> {
        return this.request("/settings")
    }

    async updateSettings(settings: any): Promise<ApiResponse<any>> {
        return this.request("/settings", {
            method: "PUT",
            body: JSON.stringify(settings),
        })
    }

    async getSystemHealth(): Promise<ApiResponse<any>> {
        return this.request("/settings/health")
    }

    // File upload endpoint
    async uploadFile(file: FormData, type: "image" | "document" = "image"): Promise<ApiResponse<any>> {
        return fetch(`${API_BASE_URL}/upload/${type}`, {
            method: "POST",
            headers: {
                Authorization: this.authToken ? `Bearer ${this.authToken}` : "",
            },
            body: file,
        }).then((response) => response.json())
    }
}

export const apiService = new ApiService()
