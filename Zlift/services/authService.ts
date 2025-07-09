import BaseService from "./baseService"

interface LoginResponse {
    token: string
    refreshToken: string
    user: {
        id: string
        name: string
        email: string
        role: string
        permissions?: Array<{
            module: string
            actions: string[]
        }>
    }
}

interface SignupData {
    firstName: string
    lastName: string
    email: string
    password: string
    phone: string
    role?: string
}

interface SuperAdminData extends SignupData {
    secretKey: string
}

class AuthService extends BaseService {
    constructor() {
        super()
    }

    async login(email: string, password: string): Promise<any> {
        try {
            const response = await this.post<LoginResponse>("/auth/admin/login", {
                email,
                password,
            })

            if (response.success && response.data) {
                this.setAuthToken(response.data.token)
            }

            return response
        } catch (error: any) {
            console.error("Login failed:", error)

            // Return demo data for development
            if (email === "admin@dronedelivery.com" && password === "admin123") {
                return {
                    success: true,
                    message: "Login successful (Demo Mode)",
                    data: {
                        token: "demo-token-12345",
                        refreshToken: "demo-refresh-token-12345",
                        user: {
                            id: "demo-user-id",
                            name: "Demo Super Admin",
                            email: email,
                            role: "super_admin",
                            permissions: [
                                { module: "dashboard", actions: ["read"] },
                                { module: "partners", actions: ["read", "write", "update", "delete"] },
                                { module: "analytics", actions: ["read"] },
                                { module: "admin", actions: ["read", "write", "update", "delete"] },
                            ],
                        },
                    },
                }
            } else if (email === "partner@dronedelivery.com" && password === "partner123") {
                return {
                    success: true,
                    message: "Login successful (Demo Mode)",
                    data: {
                        token: "demo-token-partner-12345",
                        refreshToken: "demo-refresh-token-partner-12345",
                        user: {
                            id: "demo-partner-id",
                            name: "Demo Partner Manager",
                            email: email,
                            role: "partner_manager",
                            permissions: [
                                { module: "dashboard", actions: ["read"] },
                                { module: "partners", actions: ["read", "write", "update"] },
                                { module: "products", actions: ["read", "write", "update"] },
                                { module: "orders", actions: ["read", "update"] },
                                { module: "analytics", actions: ["read"] },
                            ],
                        },
                    },
                }
            }

            throw new Error("Invalid credentials")
        }
    }

    async signup(data: SignupData): Promise<any> {
        try {
            const response = await this.post("/auth/admin/signup", {
                ...data,
                role: data.role || "partner_manager",
            })

            return response
        } catch (error: any) {
            console.error("Signup failed:", error)
            throw error
        }
    }

    async createSuperAdmin(data: SuperAdminData): Promise<any> {
        try {
            const response = await this.post("/auth/admin/create-super-admin", data)
            return response
        } catch (error: any) {
            console.error("Super admin creation failed:", error)
            throw error
        }
    }

    async logout(): Promise<any> {
        try {
            const response = await this.post("/auth/admin/logout")
            this.setAuthToken(null)
            return response
        } catch (error: any) {
            console.error("Logout failed:", error)
            // Even if logout fails on server, clear local token
            this.setAuthToken(null)
            return {
                success: true,
                message: "Logged out successfully",
            }
        }
    }

    async refreshToken(refreshToken: string): Promise<any> {
        try {
            interface RefreshTokenResponse {
                token: string
                refreshToken: string
            }
            const response = await this.post<{ token: string; refreshToken: string }>("/auth/refresh-token", {
                refreshToken,
            })

            if (response.success && response.data && response.data.token) {
                this.setAuthToken(response.data.token)
            }

            return response
        } catch (error: any) {
            console.error("Token refresh failed:", error)
            throw error
        }
    }

    async forgotPassword(email: string, userType = "admin"): Promise<any> {
        try {
            const response = await this.post("/auth/forgot-password", {
                email,
                userType,
            })

            return response
        } catch (error: any) {
            console.error("Forgot password failed:", error)
            throw error
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<any> {
        try {
            const response = await this.post("/auth/reset-password", {
                token,
                newPassword,
            })

            return response
        } catch (error: any) {
            console.error("Password reset failed:", error)
            throw error
        }
    }

    async changePassword(currentPassword: string, newPassword: string): Promise<any> {
        try {
            const response = await this.post("/auth/admin/change-password", {
                currentPassword,
                newPassword,
            })

            return response
        } catch (error: any) {
            console.error("Password change failed:", error)
            throw error
        }
    }
}

export const authService = new AuthService()
