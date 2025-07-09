import BaseService, { type ApiResponse } from "./baseService"

export interface InventoryItem {
    id: string
    name: string
    description: string
    category: string
    price: number
    stock: number
    minStock: number
    status: "in_stock" | "low_stock" | "out_of_stock"
    supplier: string
    lastRestocked: string
    image?: string
}

class ApiService extends BaseService {
    private demoInventory: InventoryItem[] = [
        {
            id: "1",
            name: "Premium Pizza Box",
            description: "Insulated pizza delivery box",
            category: "Food Containers",
            price: 12.99,
            stock: 45,
            minStock: 10,
            status: "in_stock",
            supplier: "PackagingCorp",
            lastRestocked: "2024-01-15",
        },
        {
            id: "2",
            name: "Thermal Bag Small",
            description: "Small thermal insulated bag",
            category: "Thermal Bags",
            price: 8.5,
            stock: 5,
            minStock: 15,
            status: "low_stock",
            supplier: "ThermalTech",
            lastRestocked: "2024-01-10",
        },
        {
            id: "3",
            name: "Drone Battery Pack",
            description: "High capacity lithium battery",
            category: "Drone Parts",
            price: 89.99,
            stock: 0,
            minStock: 5,
            status: "out_of_stock",
            supplier: "BatteryPlus",
            lastRestocked: "2024-01-05",
        },
        {
            id: "4",
            name: "Delivery Labels",
            description: "Waterproof delivery labels",
            category: "Labels",
            price: 15.99,
            stock: 120,
            minStock: 25,
            status: "in_stock",
            supplier: "LabelMaster",
            lastRestocked: "2024-01-18",
        },
    ]

    async getInventoryItems(): Promise<ApiResponse<InventoryItem[]>> {
        try {
            const response = await this.get<InventoryItem[]>("/inventory")
            return response
        } catch (error) {
            console.log("Using demo inventory data")
            return {
                success: true,
                data: this.demoInventory,
                message: "Demo inventory data loaded",
            }
        }
    }

    async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
        try {
            const response = await this.put<InventoryItem>(`/inventory/${id}`, updates)
            return response
        } catch (error) {
            console.log(`Demo: Updated inventory item ${id}`)
            const item = this.demoInventory.find((i) => i.id === id)
            if (item) {
                Object.assign(item, updates)
            }
            return {
                success: true,
                data: item,
                message: "Inventory item updated successfully",
            }
        }
    }

    async addInventoryItem(item: Omit<InventoryItem, "id">): Promise<ApiResponse<InventoryItem>> {
        try {
            const response = await this.post<InventoryItem>("/inventory", item)
            return response
        } catch (error) {
            console.log("Demo: Added new inventory item")
            const newItem: InventoryItem = {
                ...item,
                id: Date.now().toString(),
            }
            this.demoInventory.push(newItem)
            return {
                success: true,
                data: newItem,
                message: "Inventory item added successfully",
            }
        }
    }

    async deleteInventoryItem(id: string): Promise<ApiResponse<any>> {
        try {
            const response = await this.delete(`/inventory/${id}`)
            return response
        } catch (error) {
            console.log(`Demo: Deleted inventory item ${id}`)
            const index = this.demoInventory.findIndex((i) => i.id === id)
            if (index > -1) {
                this.demoInventory.splice(index, 1)
            }
            return {
                success: true,
                message: "Inventory item deleted successfully",
            }
        }
    }

    async restockItem(id: string, quantity: number): Promise<ApiResponse<InventoryItem>> {
        try {
            const response = await this.post<InventoryItem>(`/inventory/${id}/restock`, { quantity })
            return response
        } catch (error) {
            console.log(`Demo: Restocked item ${id} with ${quantity} units`)
            const item = this.demoInventory.find((i) => i.id === id)
            if (item) {
                item.stock += quantity
                item.lastRestocked = new Date().toISOString().split("T")[0]
                item.status = item.stock > item.minStock ? "in_stock" : item.stock > 0 ? "low_stock" : "out_of_stock"
            }
            return {
                success: true,
                data: item,
                message: "Item restocked successfully",
            }
        }
    }
}

export default new ApiService()
