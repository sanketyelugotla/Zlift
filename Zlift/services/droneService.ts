import BaseService, { type ApiResponse } from "./baseService"

export interface Drone {
  id: string
  name: string
  model: string
  status: "active" | "inactive" | "maintenance" | "in_flight"
  batteryLevel: number
  location: {
    latitude: number
    longitude: number
    address: string
  }
  currentOrder?: string
  lastMaintenance: string
  flightHours: number
  maxPayload: number
  range: number
}

export interface DroneStats {
  total: number
  active: number
  inactive: number
  inMaintenance: number
  inFlight: number
  averageBatteryLevel: number
  totalFlightHours: number
}

class DroneService extends BaseService {
  private demoDrones: Drone[] = [
    {
      id: "1",
      name: "Drone Alpha",
      model: "DJI Matrice 300",
      status: "active",
      batteryLevel: 85,
      location: {
        latitude: 40.7128,
        longitude: -74.006,
        address: "Downtown Hub",
      },
      currentOrder: "ORD-001",
      lastMaintenance: "2024-01-15",
      flightHours: 245.5,
      maxPayload: 5.5,
      range: 15,
    },
    {
      id: "2",
      name: "Drone Beta",
      model: "DJI Matrice 300",
      status: "in_flight",
      batteryLevel: 72,
      location: {
        latitude: 40.7589,
        longitude: -73.9851,
        address: "Midtown Area",
      },
      currentOrder: "ORD-002",
      lastMaintenance: "2024-01-10",
      flightHours: 189.2,
      maxPayload: 5.5,
      range: 15,
    },
    {
      id: "3",
      name: "Drone Gamma",
      model: "DJI Air 2S",
      status: "maintenance",
      batteryLevel: 0,
      location: {
        latitude: 40.7505,
        longitude: -73.9934,
        address: "Maintenance Facility",
      },
      lastMaintenance: "2024-01-20",
      flightHours: 312.8,
      maxPayload: 2.5,
      range: 10,
    },
    {
      id: "4",
      name: "Drone Delta",
      model: "DJI Mini 3",
      status: "active",
      batteryLevel: 95,
      location: {
        latitude: 40.7282,
        longitude: -74.0776,
        address: "West Side Hub",
      },
      lastMaintenance: "2024-01-18",
      flightHours: 156.3,
      maxPayload: 1.5,
      range: 8,
    },
    {
      id: "5",
      name: "Drone Echo",
      model: "DJI Matrice 300",
      status: "inactive",
      batteryLevel: 45,
      location: {
        latitude: 40.7831,
        longitude: -73.9712,
        address: "Upper East Hub",
      },
      lastMaintenance: "2024-01-12",
      flightHours: 278.9,
      maxPayload: 5.5,
      range: 15,
    },
  ]

  private demoStats: DroneStats = {
    total: 5,
    active: 2,
    inactive: 1,
    inMaintenance: 1,
    inFlight: 1,
    averageBatteryLevel: 59.4,
    totalFlightHours: 1182.7,
  }

  async getAllDrones(): Promise<ApiResponse<Drone[]>> {
    try {
      const response = await this.get<Drone[]>("/drones")
      return response
    } catch (error) {
      console.log("Using demo drone data")
      return {
        success: true,
        data: this.demoDrones,
        message: "Demo drone data loaded",
      }
    }
  }

  async getDroneById(id: string): Promise<ApiResponse<Drone>> {
    try {
      const response = await this.get<Drone>(`/drones/${id}`)
      return response
    } catch (error) {
      const drone = this.demoDrones.find((d) => d.id === id)
      return {
        success: !!drone,
        data: drone,
        message: drone ? "Demo drone data loaded" : "Drone not found",
      }
    }
  }

  async getDroneStats(): Promise<ApiResponse<DroneStats>> {
    try {
      const response = await this.get<DroneStats>("/drones/stats")
      return response
    } catch (error) {
      console.log("Using demo drone stats")
      return {
        success: true,
        data: this.demoStats,
        message: "Demo drone stats loaded",
      }
    }
  }

  async updateDroneStatus(id: string, status: Drone["status"]): Promise<ApiResponse<Drone>> {
    try {
      const response = await this.put<Drone>(`/drones/${id}/status`, { status })
      return response
    } catch (error) {
      console.log(`Demo: Updated drone ${id} status to ${status}`)
      const drone = this.demoDrones.find((d) => d.id === id)
      if (drone) {
        drone.status = status
      }
      return {
        success: true,
        data: drone,
        message: "Drone status updated successfully",
      }
    }
  }

  async assignDroneToOrder(droneId: string, orderId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.post(`/drones/${droneId}/assign`, { orderId })
      return response
    } catch (error) {
      console.log(`Demo: Assigned drone ${droneId} to order ${orderId}`)
      return {
        success: true,
        message: "Drone assigned to order successfully",
      }
    }
  }

  async getDroneLocation(id: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.get(`/drones/${id}/location`)
      return response
    } catch (error) {
      const drone = this.demoDrones.find((d) => d.id === id)
      return {
        success: !!drone,
        data: drone?.location,
        message: drone ? "Demo location data loaded" : "Drone not found",
      }
    }
  }

  async scheduleMaintenance(id: string, date: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.post(`/drones/${id}/maintenance`, { date })
      return response
    } catch (error) {
      console.log(`Demo: Scheduled maintenance for drone ${id} on ${date}`)
      return {
        success: true,
        message: "Maintenance scheduled successfully",
      }
    }
  }
}

export default new DroneService()
