import BaseService, { type ApiResponse } from "./baseService"

interface Outlet {
    _id: string
    partnerId: string
    name: string
    address: {
        street: string
        city: string
        state: string
        pincode: string
        coordinates?: {
            latitude: number
            longitude: number
        }
    }
    phone: string
    email?: string
    businessHours?: {
        monday: { open: string; close: string; isClosed: boolean }
        tuesday: { open: string; close: string; isClosed: boolean }
        wednesday: { open: string; close: string; isClosed: boolean }
        thursday: { open: string; close: string; isClosed: boolean }
        friday: { open: string; close: string; isClosed: boolean }
        saturday: { open: string; close: string; isClosed: boolean }
        sunday: { open: string; close: string; isClosed: boolean }
    }
    isActive: boolean
    createdAt: string
    updatedAt: string
}

interface CreateOutletData {
    name: string
    street: string
    city: string
    state: string
    pincode: string
    phone: string
    email?: string
    latitude?: number
    longitude?: number
}

interface UpdateOutletData {
    name?: string
    street?: string
    city?: string
    state?: string
    pincode?: string
    phone?: string
    email?: string
    latitude?: number
    longitude?: number
    businessHours?: Outlet["businessHours"]
    isActive?: boolean
}

class OutletService extends BaseService {
    constructor() {
        super()
    }

    async createOutlet(data: CreateOutletData): Promise<ApiResponse<Outlet>> {
        try {
            const response = await this.post<Outlet>("/outlets", data)
            return response
        } catch (error: any) {
            console.error("Failed to create outlet:", error)
            throw error
        }
    }

    async getOutlets(): Promise<ApiResponse<Outlet[]>> {
        try {
            const response = await this.get<Outlet[]>("/outlets")
            return response
        } catch (error: any) {
            console.error("Failed to fetch outlets:", error)
            // Return demo data for development
            return {
                success: true,
                message: "Outlets retrieved (Demo Mode)",
                data: [
                    {
                        _id: "demo-outlet-1",
                        partnerId: "demo-partner-id",
                        name: "Main Street Branch",
                        address: {
                            street: "123 Main St",
                            city: "Anytown",
                            state: "CA",
                            pincode: "90210",
                            coordinates: { latitude: 34.0522, longitude: -118.2437 },
                        },
                        phone: "555-123-4567",
                        email: "main@example.com",
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                    {
                        _id: "demo-outlet-2",
                        partnerId: "demo-partner-id",
                        name: "Downtown Kiosk",
                        address: {
                            street: "456 Oak Ave",
                            city: "Anytown",
                            state: "CA",
                            pincode: "90210",
                            coordinates: { latitude: 34.045, longitude: -118.25 },
                        },
                        phone: "555-987-6543",
                        email: "downtown@example.com",
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    },
                ],
            }
        }
    }

    async getOutletById(id: string): Promise<ApiResponse<Outlet>> {
        try {
            const response = await this.get<Outlet>(`/outlets/${id}`)
            return response
        } catch (error: any) {
            console.error(`Failed to fetch outlet ${id}:`, error)
            throw error
        }
    }

    async updateOutlet(id: string, data: UpdateOutletData): Promise<ApiResponse<Outlet>> {
        try {
            const response = await this.put<Outlet>(`/outlets/${id}`, data)
            return response
        } catch (error: any) {
            console.error(`Failed to update outlet ${id}:`, error)
            throw error
        }
    }

    async deleteOutlet(id: string): Promise<ApiResponse<null>> {
        try {
            const response = await this.delete<null>(`/outlets/${id}`)
            return response
        } catch (error: any) {
            console.error(`Failed to delete outlet ${id}:`, error)
            throw error
        }
    }
}

export const outletService = new OutletService()
