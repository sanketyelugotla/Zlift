"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { authService } from "../services/authService"

interface User {
    id: string
    name: string
    email: string
    role: string
}

interface SignupData {
    firstName: string
    lastName: string
    email: string
    password: string
    phone: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    signup: (data: SignupData) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        checkAuthState()
    }, [])

    const checkAuthState = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken")
            const userData = await AsyncStorage.getItem("userData")

            if (token && userData) {
                const parsedUser = JSON.parse(userData)
                setUser(parsedUser)
                authService.setAuthToken(token)
            }
        } catch (error) {
            console.error("Error checking auth state:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const response = await authService.login(email, password)

            if (response.success && response.data) {
                const { token, user: userData } = response.data

                await AsyncStorage.setItem("authToken", token)
                await AsyncStorage.setItem("userData", JSON.stringify(userData))

                setUser(userData)
                authService.setAuthToken(token)
            } else {
                throw new Error(response.message || "Login failed")
            }
        } catch (error: any) {
            throw new Error(error.message || "Login failed")
        }
    }

    const signup = async (data: SignupData) => {
        try {
            const response = await authService.signup(data)

            if (!response.success) {
                throw new Error(response.message || "Signup failed")
            }
        } catch (error: any) {
            throw new Error(error.message || "Signup failed")
        }
    }

    const logout = async () => {
        try {
            await authService.logout()
        } catch (error) {
            console.error("Logout error:", error)
        } finally {
            await AsyncStorage.removeItem("authToken")
            await AsyncStorage.removeItem("userData")
            setUser(null)
            authService.setAuthToken(null)
        }
    }

    const value: AuthContextType = {
        user,
        isLoading,
        login,
        signup,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
