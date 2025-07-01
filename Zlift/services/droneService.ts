import BaseService, { type ApiResponse } from "./baseService"

interface Drone {
    _id: string
    droneId: string
    model: string
    status: "available" | "in_flight" | "maintenance" | "charging" | "offline"
    batteryLevel: number
    currentLocation: {
        lat: number
        lng: number
        altitude: number
    }
    operatorId?: string
    operatorName?: string
    currentOrderId?: string
    maxPayload: number
    maxRange: number
    lastMaintenance: string
    nextMaintenance: string
    flightHours: number
    totalDeliveries: number
    createdAt: string
    updatedAt: string
}

interface DroneFilters {
    page?: number
    limit?: number
    status?: string
    operatorId?: string
    search?: string
}

class DroneService extends BaseService {
    async getDrones(filters?: DroneFilters): Promise<
        ApiResponse<{
            drones: Drone[]
            total: number
            page: number
            totalPages: number
        }>
    > {
        const queryString = this.buildQueryString(filters)
        return this.request(`/drones${queryString}`)
    }

    async getDroneById(droneId: string): Promise<ApiResponse<Drone>> {
        return this.request(`/drones/${droneId}`)
    }

    async updateDroneStatus(droneId: string, status: Drone["status"]): Promise<ApiResponse<Drone>> {
        return this.request(`/drones/${droneId}/status`, {
            method: "PUT",
            body: JSON.stringify({ status }),
        })
    }

    async getDroneLocation(droneId: string): Promise<
        ApiResponse<{
            location: { lat: number; lng: number; altitude: number }
            timestamp: string
        }>
    > {
        return this.request(`/drones/${droneId}/location`)
    }

    async assignOperator(droneId: string, operatorId: string): Promise<ApiResponse<Drone>> {
        return this.request(`/drones/${droneId}/assign-operator`, {
            method: "PUT",
            body: JSON.stringify({ operatorId }),
        })
    }

    async scheduleMaintenance(
        droneId: string,
        scheduledDate: string,
        type: string,
        notes?: string,
    ): Promise<ApiResponse<Drone>> {
        return this.request(`/drones/${droneId}/maintenance`, {
            method: "POST",
            body: JSON.stringify({ scheduledDate, type, notes }),
        })
    }

    async getDroneAnalytics(
        droneId: string,
        params?: {
            startDate?: string
            endDate?: string
        },
    ): Promise<
        ApiResponse<{
            totalFlightTime: number
            totalDeliveries: number
            averageDeliveryTime: number
            batteryUsage: Array<{ date: string; averageLevel: number }>
            deliveriesOverTime: Array<{ date: string; count: number }>
            maintenanceHistory: Array<{
                date: string
                type: string
                cost: number
                notes: string
            }>
        }>
    > {
        const queryString = this.buildQueryString(params)
        return this.request(`/drones/${droneId}/analytics${queryString}`)
    }

    async getAvailableDrones(location?: {
        lat: number
        lng: number
        radius?: number
    }): Promise<ApiResponse<Drone[]>> {
        const queryString = this.buildQueryString(location)
        return this.request(`/drones/available${queryString}`)
    }
}

export const droneService = new DroneService()
