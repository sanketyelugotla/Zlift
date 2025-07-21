"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, useCallback } from "react"
import * as SecureStore from "expo-secure-store"
import { authService } from "../services/authService"
import { outletService } from "../services/outletService" // Import outlet service

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

interface AuthContextType {
    user: UserData | null
    isAuthenticated: boolean
    isLoadingAuth: boolean
    login: (email: string, password: string) => Promise<void>
    signup: (data: any) => Promise<any> // For admin signup
    partnerRegister: (data: any) => Promise<any> // For partner registration
    logout: () => Promise<void>
    refreshPartnerOutlets: () => Promise<void> // New function to refresh partner outlets
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = "auth_token"
const REFRESH_TOKEN_KEY = "refresh_token"
const USER_DATA_KEY = "user_data"

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoadingAuth, setIsLoadingAuth] = useState(true)

    const saveAuthData = async (token: string, refreshToken: string, userData: UserData) => {
        await SecureStore.setItemAsync(TOKEN_KEY, token)
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken)
        await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData))
        setUser(userData)
        setIsAuthenticated(true)
    }

    const clearAuthData = async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY)
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
        await SecureStore.deleteItemAsync(USER_DATA_KEY)
        setUser(null)
        setIsAuthenticated(false)
    }

    const loadAuthData = useCallback(async () => {
        try {
            const storedToken = await SecureStore.getItemAsync(TOKEN_KEY)
            const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
            const storedUserData = await SecureStore.getItemAsync(USER_DATA_KEY)

            if (storedToken && storedRefreshToken && storedUserData) {
                const parsedUser: UserData = JSON.parse(storedUserData)
                setUser(parsedUser)
                setIsAuthenticated(true)
                authService.setAuthToken(storedToken) // Set token in service for future requests

                // Attempt to refresh token if it's close to expiry or for initial validation
                // This is a simplified logic; a more robust solution would check token expiry
                try {
                    const refreshResponse = await authService.refreshToken(storedRefreshToken)
                    if (refreshResponse.success && refreshResponse.data?.token) {
                        await saveAuthData(
                            refreshResponse.data.token,
                            storedRefreshToken,
                            refreshResponse.data.user || parsedUser, // Use refreshed user data if available
                        )
                    } else {
                        console.warn("Failed to refresh token on load, logging out.")
                        await clearAuthData()
                    }
                } catch (refreshError) {
                    console.error("Error refreshing token on load:", refreshError)
                    await clearAuthData()
                }
            } else {
                setIsAuthenticated(false)
            }
        } catch (error) {
            console.error("Failed to load auth data:", error)
            await clearAuthData()
        } finally {
            setIsLoadingAuth(false)
        }
    }, [])

    useEffect(() => {
        loadAuthData()
    }, [loadAuthData])

    const login = async (email: string, password: string) => {
        const response = await authService.login(email, password)
        if (response.success && response.data) {
            await saveAuthData(response.data.token, response.data.refreshToken, response.data.user)
        } else {
            throw new Error(response.message || "Login failed")
        }
    }

    const signup = async (data: any) => {
        // This is for admin signup
        const response = await authService.signup(data)
        if (!response.success) {
            throw new Error(response.message || "Signup failed")
        }
        return response
    }

    const partnerRegister = async (data: any) => {
        // This is for partner registration
        const response = await authService.partnerRegister(data)
        if (response.success && response.data) {
            await saveAuthData(response.data.token, response.data.refreshToken, response.data.user)
        } else {
            throw new Error(response.message || "Partner registration failed")
        }
        return response
    }

    const logout = async () => {
        if (user) {
            await authService.logout(user.userType)
        }
        await clearAuthData()
    }

    const refreshPartnerOutlets = useCallback(async () => {
        if (user && user.userType === "partner") {
            try {
                const response = await outletService.getOutlets()
                if (response.success && response.data) {
                    const updatedUser = { ...user, outlets: response.data.map((o) => o._id) }
                    // Update SecureStore and state with new outlet list
                    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(updatedUser))
                    setUser(updatedUser)
                } else {
                    console.error("Failed to refresh partner outlets:", response.message)
                }
            } catch (error) {
                console.error("Error refreshing partner outlets:", error)
            }
        }
    }, [user])

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoadingAuth,
                login,
                signup,
                partnerRegister,
                logout,
                refreshPartnerOutlets,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
