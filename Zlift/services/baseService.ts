export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

class BaseService {
    protected baseURL: string
    private authToken: string | null = null

    constructor(baseURL = "http://192.168.0.105:5000//api") {
        this.baseURL = baseURL
    }

    setAuthToken(token: string | null) {
        this.authToken = token
    }

    protected buildQueryString(params?: Record<string, any>): string {
        if (!params) return ""

        const queryParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString())
            }
        })

        const queryString = queryParams.toString()
        return queryString ? `?${queryString}` : ""
    }

    protected async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        }

        // Add existing headers from options
        if (options.headers) {
            if (options.headers instanceof Headers) {
                options.headers.forEach((value, key) => {
                    headers[key] = value
                })
            } else if (Array.isArray(options.headers)) {
                options.headers.forEach(([key, value]) => {
                    headers[key] = value
                })
            } else {
                Object.assign(headers, options.headers)
            }
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

    protected async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: "GET" })
    }

    protected async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    protected async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    protected async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: "DELETE" })
    }
}

export default BaseService
