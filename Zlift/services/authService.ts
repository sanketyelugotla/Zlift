import BaseService from "./baseService"

interface UserData {
    id: string
    email: string
    userType: "admin" | "customer" | "partner"
    // Admin specific
    name?: string
    role?: string
    permissions?: Array<{ module: string; actions: string[] }>
    // Customer specific
    firstName?: string
    lastName?: string
    phone?: string
    // Partner specific
    ownerName?: string
    businessName?: string
    partnerType?: string
    outlets?: string[] // Array of outlet IDs
}

interface LoginResponse {
    token: string
    refreshToken: string
    user: UserData
}

interface SignupData {
    firstName: string
    lastName: string
    email: string
    password: string
    phone: string
    role?: string // Only for admin signup
}

interface PartnerRegisterData extends SignupData {
    businessName: string
    partnerType: string
    street: string
    city: string
    state: string
    pincode: string
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
            // Try admin login first
            const adminResponse = await this.post<LoginResponse>("/auth/admin/login", {
                email,
                password,
            })
            if (adminResponse.success && adminResponse.data) {
                this.setAuthToken(adminResponse.data.token)
                return adminResponse
            }
        } catch (error) {
            // If admin login fails, try customer login
            try {
                const customerResponse = await this.post<LoginResponse>("/auth/customer/login", {
                    email,
                    password,
                })
                if (customerResponse.success && customerResponse.data) {
                    this.setAuthToken(customerResponse.data.token)
                    return customerResponse
                }
            } catch (error) {
                // If customer login fails, try partner login
                try {
                    const partnerResponse = await this.post<LoginResponse>("/auth/partner/login", {
                        email,
                        password,
                    })
                    if (partnerResponse.success && partnerResponse.data) {
                        this.setAuthToken(partnerResponse.data.token)
                        return partnerResponse
                    }
                } catch (error: any) {
                    console.error("Login failed across all types:", error)

                    // Return demo data for development if all real logins fail
                    if (email === "admin@dronedelivery.com" && password === "admin123") {
                        return {
                            success: true,
                            message: "Login successful (Demo Mode - Admin)",
                            data: {
                                token: "demo-token-admin-12345",
                                refreshToken: "demo-refresh-token-admin-12345",
                                user: {
                                    id: "demo-admin-id",
                                    name: "Demo Super Admin",
                                    email: email,
                                    role: "super_admin",
                                    permissions: [
                                        { module: "dashboard", actions: ["read"] },
                                        { module: "partners", actions: ["read", "write", "update", "delete"] },
                                        { module: "analytics", actions: ["read"] },
                                        { module: "admin", actions: ["read", "write", "update", "delete"] },
                                    ],
                                    userType: "admin",
                                },
                            },
                        }
                    } else if (email === "partner@dronedelivery.com" && password === "partner123") {
                        return {
                            success: true,
                            message: "Login successful (Demo Mode - Partner)",
                            data: {
                                token: "demo-token-partner-12345",
                                refreshToken: "demo-refresh-token-partner-12345",
                                user: {
                                    id: "demo-partner-id",
                                    ownerName: "Demo Partner Business",
                                    email: email,
                                    role: "partner",
                                    businessName: "Demo Partner Co.",
                                    partnerType: "retail",
                                    outlets: ["outlet-id-1", "outlet-id-2"], // Demo outlets
                                    userType: "partner",
                                },
                            },
                        }
                    } else if (email === "customer@dronedelivery.com" && password === "customer123") {
                        return {
                            success: true,
                            message: "Login successful (Demo Mode - Customer)",
                            data: {
                                token: "demo-token-customer-12345",
                                refreshToken: "demo-refresh-token-customer-12345",
                                user: {
                                    id: "demo-customer-id",
                                    firstName: "Demo",
                                    lastName: "Customer",
                                    email: email,
                                    phone: "1234567890",
                                    userType: "customer",
                                },
                            },
                        }
                    }

                    throw new Error("Invalid credentials")
                }
            }
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
            console.error("Admin Signup failed:", error)
            throw error
        }
    }

    async partnerRegister(data: PartnerRegisterData): Promise<any> {
        try {
            const response = await this.post("/auth/partner/register", data)
            if (response.success && response.data) {
                this.setAuthToken(response.data.token)
            }
            return response
        } catch (error: any) {
            console.error("Partner Registration failed:", error)
            throw error
        }
    }

    async createSuperAdmin(data: SuperAdminData): Promise<any> {
        try {
            const response = await this.post("/auth/admin/super-admin", data)
            return response
        } catch (error: any) {
            console.error("Super admin creation failed:", error)
            throw error
        }
    }

    async logout(userType: "admin" | "customer" | "partner"): Promise<any> {
        try {
            const endpoint = `/auth/${userType}/logout`
            const response = await this.post(endpoint)
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
            const response = await this.post<LoginResponse>("/auth/refresh-token", {
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

    async forgotPassword(email: string, userType: "admin" | "customer" | "partner"): Promise<any> {
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

    async changePassword(
        currentPassword: string,
        newPassword: string,
        userType: "admin" | "customer" | "partner",
    ): Promise<any> {
        try {
            const endpoint = `/auth/${userType}/change-password`
            const response = await this.post(endpoint, {
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
