import BaseService, { type ApiResponse } from "./baseService"

interface Partner {
    _id: string
    businessName: string
    ownerName: string
    email: string
    phone: string
    businessType: "restaurant" | "pharmacy" | "grocery" | "retail"
    address: {
        street: string
        city: string
        state: string
        zipCode: string
        coordinates: { lat: number; lng: number }
    }
    businessHours: {
        [key: string]: { open: string; close: string; isOpen: boolean }
    }
    status: "pending" | "approved" | "rejected" | "suspended"
    documents: Array<{
        type: string
        url: string
        verified: boolean
    }>
    rating: number
    totalOrders: number
    totalRevenue: number
    commissionRate: number
    createdAt: string
    updatedAt: string
}

interface PartnerFilters {
    page?: number
    limit?: number
    status?: string
    businessType?: string
    city?: string
    search?: string
}

class PartnerService extends BaseService {
    async getPartners(filters?: PartnerFilters): Promise<
        ApiResponse<{
            partners: Partner[]
            total: number
            page: number
            totalPages: number
        }>
    > {
        const queryString = this.buildQueryString(filters)
        return this.request(`/partners${queryString}`)
    }

    async getPartnerById(partnerId: string): Promise<ApiResponse<Partner>> {
        return this.request(`/partners/${partnerId}`)
    }

    async updatePartnerStatus(partnerId: string, status: Partner["status"]): Promise<ApiResponse<Partner>> {
        return this.request(`/partners/${partnerId}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        })
    }

    async approvePartner(partnerId: string): Promise<ApiResponse<Partner>> {
        return this.request(`/partners/${partnerId}/approve`, {
            method: "PUT",
        })
    }

    async rejectPartner(partnerId: string, reason: string): Promise<ApiResponse<Partner>> {
        return this.request(`/partners/${partnerId}/reject`, {
            method: "PUT",
            body: JSON.stringify({ reason }),
        })
    }

    async suspendPartner(partnerId: string, reason: string): Promise<ApiResponse<Partner>> {
        return this.request(`/partners/${partnerId}/suspend`, {
            method: "PUT",
            body: JSON.stringify({ reason }),
        })
    }

    async updateCommissionRate(partnerId: string, commissionRate: number): Promise<ApiResponse<Partner>> {
        return this.request(`/partners/${partnerId}/commission`, {
            method: "PUT",
            body: JSON.stringify({ commissionRate }),
        })
    }

    async getPartnerAnalytics(
        partnerId: string,
        params?: {
            startDate?: string
            endDate?: string
        },
    ): Promise<
        ApiResponse<{
            totalOrders: number
            totalRevenue: number
            averageOrderValue: number
            rating: number
            ordersOverTime: Array<{ date: string; count: number; revenue: number }>
            topProducts: Array<{ name: string; orders: number; revenue: number }>
        }>
    > {
        const queryString = this.buildQueryString(params)
        return this.request(`/partners/${partnerId}/analytics${queryString}`)
    }

    async verifyDocument(partnerId: string, documentType: string, verified: boolean): Promise<ApiResponse<Partner>> {
        return this.request(`/partners/${partnerId}/documents/${documentType}/verify`, {
            method: "PUT",
            body: JSON.stringify({ verified }),
        })
    }
}

export const partnerService = new PartnerService()
