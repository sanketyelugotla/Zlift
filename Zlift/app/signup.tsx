"use client"

import { useState } from "react"
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "../contexts/AuthContext"

export default function SignupScreen() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const { signup } = useAuth()
    const router = useRouter()

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const validateForm = () => {
        const { firstName, lastName, email, password, confirmPassword, phone } = formData

        if (!firstName.trim()) {
            Alert.alert("Error", "First name is required")
            return false
        }

        if (!lastName.trim()) {
            Alert.alert("Error", "Last name is required")
            return false
        }

        if (!email.trim()) {
            Alert.alert("Error", "Email is required")
            return false
        }

        if (!email.includes("@") || !email.includes(".")) {
            Alert.alert("Error", "Please enter a valid email address")
            return false
        }

        if (!phone.trim()) {
            Alert.alert("Error", "Phone number is required")
            return false
        }

        if (phone.length < 10) {
            Alert.alert("Error", "Please enter a valid phone number")
            return false
        }

        if (!password) {
            Alert.alert("Error", "Password is required")
            return false
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters long")
            return false
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match")
            return false
        }

        return true
    }

    const handleSignup = async () => {
        if (!validateForm()) return

        setIsLoading(true)
        try {
            const res = await signup(formData)
            console.log(res);
            Alert.alert("Success", "Account created successfully! Please login.", [
                {
                    text: "OK",
                    onPress: () => router.replace("/login"),
                },
            ])
        } catch (error: any) {
            Alert.alert("Signup Failed", error.message || "Failed to create account")
        } finally {
            setIsLoading(false)
        }
    }

    const navigateToLogin = () => {
        router.back()
    }

    return (
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
            <StatusBar barStyle="light-content" />

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backButton} onPress={navigateToLogin}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View style={styles.iconContainer}>
                            <Ionicons name="person-add" size={60} color="white" />
                        </View>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join Drone Delivery Admin</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.row}>
                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="First Name"
                                    placeholderTextColor="#999"
                                    value={formData.firstName}
                                    onChangeText={(value) => handleInputChange("firstName", value)}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Last Name"
                                    placeholderTextColor="#999"
                                    value={formData.lastName}
                                    onChangeText={(value) => handleInputChange("lastName", value)}
                                    autoCapitalize="words"
                                    autoCorrect={false}
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email Address"
                                placeholderTextColor="#999"
                                value={formData.email}
                                onChangeText={(value) => handleInputChange("email", value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                placeholderTextColor="#999"
                                value={formData.phone}
                                onChangeText={(value) => handleInputChange("phone", value)}
                                keyboardType="phone-pad"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="Password"
                                placeholderTextColor="#999"
                                value={formData.password}
                                onChangeText={(value) => handleInputChange("password", value)}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="Confirm Password"
                                placeholderTextColor="#999"
                                value={formData.confirmPassword}
                                onChangeText={(value) => handleInputChange("confirmPassword", value)}
                                secureTextEntry={!showConfirmPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            <Text style={styles.signupButtonText}>{isLoading ? "Creating Account..." : "Create Account"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.loginLink} onPress={navigateToLogin}>
                            <Text style={styles.loginLinkText}>
                                Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
        position: "relative",
    },
    backButton: {
        position: "absolute",
        left: 0,
        top: 0,
        padding: 10,
        zIndex: 1,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
    },
    formContainer: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 12,
        marginBottom: 20,
        paddingHorizontal: 15,
        backgroundColor: "#f9f9f9",
    },
    halfWidth: {
        width: "48%",
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: "#333",
    },
    passwordInput: {
        paddingRight: 40,
    },
    eyeIcon: {
        position: "absolute",
        right: 15,
        padding: 5,
    },
    signupButton: {
        backgroundColor: "#667eea",
        borderRadius: 12,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    signupButtonDisabled: {
        opacity: 0.7,
    },
    signupButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    loginLink: {
        alignItems: "center",
    },
    loginLinkText: {
        fontSize: 14,
        color: "#666",
    },
    loginLinkBold: {
        fontWeight: "bold",
        color: "#667eea",
    },
})
