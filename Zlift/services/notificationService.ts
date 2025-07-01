import BaseService, { type ApiResponse } from "./baseService"

interface Notification {
    _id: string
    title: string
    message: string
    type: "info" | "warning" | "error" | "success"
    priority: "low" | "medium" | "high" | "urgent"
    isRead: boolean
    recipientId: string
    recipientType: "admin" | "partner" | "customer" | "operator"
    metadata?: any
    actionUrl?: string
    createdAt: string
    readAt?: string
}

interface NotificationFilters {
    page?: number
    limit?: number
    isRead?: boolean
    type?: string
    priority?: string
    startDate?: string
    endDate?: string
}

class NotificationService extends BaseService {
    async getNotifications(filters?: NotificationFilters): Promise<
        ApiResponse<{
            notifications: Notification[]
            total: number
            unreadCount: number
            page: number
            totalPages: number
        }>
    > {
        const queryString = this.buildQueryString(filters)
        return this.request(`/notifications${queryString}`)
    }

    async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
        return this.request("/notifications/unread-count")
    }

    async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
        return this.request(`/notifications/${notificationId}/read`, {
            method: "PUT",
        })
    }

    async markAllAsRead(): Promise<ApiResponse<{ updatedCount: number }>> {
        return this.request("/notifications/read-all", {
            method: "PUT",
        })
    }

    async deleteNotification(notificationId: string): Promise<ApiResponse> {
        return this.request(`/notifications/${notificationId}`, {
            method: "DELETE",
        })
    }

    async sendNotification(data: {
        title: string
        message: string
        type: Notification["type"]
        priority: Notification["priority"]
        recipients: Array<{
            id: string
            type: "admin" | "partner" | "customer" | "operator"
        }>
        actionUrl?: string
        metadata?: any
        scheduleAt?: string
    }): Promise<ApiResponse<{ notificationIds: string[] }>> {
        return this.request("/notifications/send", {
            method: "POST",
            body: JSON.stringify(data),
        })
    }

    async sendBulkNotification(data: {
        title: string
        message: string
        type: Notification["type"]
        priority: Notification["priority"]
        recipientType: "all" | "admin" | "partner" | "customer" | "operator"
        filters?: any
        actionUrl?: string
        metadata?: any
        scheduleAt?: string
    }): Promise<ApiResponse<{ sentCount: number }>> {
        return this.request("/notifications/send-bulk", {
            method: "POST",
            body: JSON.stringify(data),
        })
    }

    async getNotificationTemplates(): Promise<
        ApiResponse<
            Array<{
                id: string
                name: string
                title: string
                message: string
                type: string
                variables: string[]
            }>
        >
    > {
        return this.request("/notifications/templates")
    }

    async sendTemplateNotification(data: {
        templateId: string
        recipients: Array<{
            id: string
            type: "admin" | "partner" | "customer" | "operator"
        }>
        variables?: Record<string, any>
        scheduleAt?: string
    }): Promise<ApiResponse<{ notificationIds: string[] }>> {
        return this.request("/notifications/send-template", {
            method: "POST",
            body: JSON.stringify(data),
        })
    }
}

export const notificationService = new NotificationService()
