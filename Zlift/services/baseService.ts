interface ApiResponse<T = any> {
    success: boolean
    message: string
    data?: T
    error?: string
}

class BaseService {
    private baseURL: string
    private authToken: string | null = null

    constructor(baseURL = "http://192.168.0.100:5000/api") {
        this.baseURL = baseURL
    }

    setAuthToken(token: string | null) {
        this.authToken = token
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        }

        if (this.authToken) {
            headers["Authorization"] = `Bearer ${this.authToken}`
        }

        return headers
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        try {
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`)
            }

            return data
        } catch (error) {
            console.error("API Response Error:", error)
            throw error
        }
    }

    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            console.log(`Making GET request to: ${this.baseURL}${endpoint}`)

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: "GET",
                headers: this.getHeaders(),
            })

            return await this.handleResponse<T>(response)
        } catch (error: any) {
            console.error(`GET ${endpoint} failed:`, error)
            throw new Error(error.message || "Network request failed")
        }
    }

    async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        try {
            console.log(`Making POST request to: ${this.baseURL}${endpoint}`)
            console.log("Request data:", data)

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: "POST",
                headers: this.getHeaders(),
                body: data ? JSON.stringify(data) : undefined,
            })

            return await this.handleResponse<T>(response)
        } catch (error: any) {
            console.error(`POST ${endpoint} failed:`, error)
            throw new Error(error.message || "Network request failed")
        }
    }

    async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        try {
            console.log(`Making PUT request to: ${this.baseURL}${endpoint}`)

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: "PUT",
                headers: this.getHeaders(),
                body: data ? JSON.stringify(data) : undefined,
            })

            return await this.handleResponse<T>(response)
        } catch (error: any) {
            console.error(`PUT ${endpoint} failed:`, error)
            throw new Error(error.message || "Network request failed")
        }
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            console.log(`Making DELETE request to: ${this.baseURL}${endpoint}`)

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: "DELETE",
                headers: this.getHeaders(),
            })

            return await this.handleResponse<T>(response)
        } catch (error: any) {
            console.error(`DELETE ${endpoint} failed:`, error)
            throw new Error(error.message || "Network request failed")
        }
    }
}

export default BaseService
  