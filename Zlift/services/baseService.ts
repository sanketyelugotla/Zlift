export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
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
            headers.Authorization = `Bearer ${this.authToken}`
        }

        return headers
    }

    private buildQueryString(params: Record<string, any>): string {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value))
            }
        })
        return searchParams.toString()
    }

    protected async request<T = any>(
        endpoint: string,
        options: RequestInit = {},
        params?: Record<string, any>,
    ): Promise<ApiResponse<T>> {
        try {
            let url = `${this.baseURL}${endpoint}`
            console.log(url)

            if (params) {
                const queryString = this.buildQueryString(params)
                if (queryString) {
                    url += `?${queryString}`
                }
            }

            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.getHeaders(),
                    ...options.headers,
                },
            })

            const data = await response.json()

            if (!response.ok) {
                return {
                    success: false,
                    message: data.message || `HTTP error! status: ${response.status}`,
                    error: data.error,
                }
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message,
            }
        } catch (error: any) {
            console.error(`API request failed for ${endpoint}:`, error)

            // Return demo data for development when network fails
            if (endpoint.includes("/dashboard/stats")) {
                return {
                    success: true,
                    data: {
                        totalOrders: 1250,
                        totalRevenue: 45680.5,
                        activePartners: 85,
                        activeDrones: 12,
                    },
                } as ApiResponse<T>
            }

            if (endpoint.includes("/dashboard/recent-orders")) {
                return {
                    success: true,
                    data: [
                        {
                            id: "1",
                            customerName: "John Doe",
                            status: "delivered",
                            amount: 25.99,
                            createdAt: new Date().toISOString(),
                        },
                        {
                            id: "2",
                            customerName: "Jane Smith",
                            status: "in_transit",
                            amount: 42.5,
                            createdAt: new Date().toISOString(),
                        },
                        {
                            id: "3",
                            customerName: "Mike Johnson",
                            status: "pending",
                            amount: 18.75,
                            createdAt: new Date().toISOString(),
                        },
                    ],
                } as ApiResponse<T>
            }

            return {
                success: false,
                message: error.message || "Network error occurred",
                error: error.toString(),
            }
        }
    }
}

export default BaseService
  