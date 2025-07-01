import BaseService, { type ApiResponse } from "./baseService"

interface LoginResponse {
    token: string
    user: {
        id: string
        name: string
        email: string
        role: string
    }
}

interface SignupData {
    firstName: string
    lastName: string
    email: string
    password: string
    phone: string
}

class AuthService extends BaseService {
    async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
        // Demo login for development
        if (email === "admin@dronedelivery.com" && password === "admin123") {
            return {
                success: true,
                data: {
                    token: "demo-token-123",
                    user: {
                        id: "demo-admin",
                        name: "Demo Admin",
                        email: "admin@dronedelivery.com",
                        role: "admin",
                    },
                },
            }
        }

        return this.request("/auth/admin/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        })
    }

    async signup(data: SignupData): Promise<ApiResponse> {
        const signupPayload = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            phone: data.phone,
            role: "admin",
        }

        return this.request("/auth/admin/signup", {
            method: "POST",
            body: JSON.stringify(signupPayload),
        })
    }

    async refreshToken(): Promise<ApiResponse<{ token: string }>> {
        return this.request("/auth/refresh", {
            method: "POST",
        })
    }

    async logout(): Promise<ApiResponse> {
        return this.request("/auth/logout", {
            method: "POST",
        })
    }

    async getProfile(): Promise<ApiResponse> {
        return this.request("/auth/profile")
    }

    async updateProfile(data: {
        name?: string
        email?: string
        currentPassword?: string
        newPassword?: string
    }): Promise<ApiResponse> {
        return this.request("/auth/profile", {
            method: "PUT",
            body: JSON.stringify(data),
        })
    }
}

export const authService = new AuthService()
