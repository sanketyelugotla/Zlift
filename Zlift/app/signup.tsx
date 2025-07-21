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
        phone: "",
        password: "",
        confirmPassword: "",
        businessName: "", // New required field
        partnerType: "", // New required field
        street: "", // New required field for address
        city: "", // New required field for address
        state: "", // New required field for address
        pincode: "", // New required field for address
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const { partnerRegister } = useAuth()
    const router = useRouter()

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const validateForm = () => {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
            confirmPassword,
            businessName,
            partnerType,
            street,
            city,
            state,
            pincode,
        } = formData

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

        if (!businessName.trim()) {
            Alert.alert("Error", "Business Name is required")
            return false
        }

        if (!partnerType.trim()) {
            Alert.alert("Error", "Partner Type is required (e.g., restaurant, grocery, retail, pharmacy)")
            return false
        }

        if (!street.trim()) {
            Alert.alert("Error", "Street Address is required")
            return false
        }

        if (!city.trim()) {
            Alert.alert("Error", "City is required")
            return false
        }

        if (!state.trim()) {
            Alert.alert("Error", "State is required")
            return false
        }

        if (!pincode.trim()) {
            Alert.alert("Error", "Pincode is required")
            return false
        }

        return true
    }

    const handleSignup = async () => {
        if (!validateForm()) return

        setIsLoading(true)
        try {
            const response = await partnerRegister(formData)
            if (response.success) {
                Alert.alert("Success", "Partner account created successfully! Now, let's set up your first outlet.", [
                    {
                        text: "OK",
                        onPress: () => router.replace("/createOutlet"), // Redirect to create outlet page
                    },
                ])
            } else {
                Alert.alert("Signup Failed", response.message || "Failed to create account")
            }
        } catch (error: any) {
            Alert.alert("Signup Failed", error.message || "An unexpected error occurred during signup")
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
                            <Ionicons name="business-outline" size={60} color="white" />
                        </View>
                        <Text style={styles.title}>Register Your Business</Text>
                        <Text style={styles.subtitle}>Create your partner account to get started</Text>
                    </View>

                    <View style={styles.formContainer}>
                        {/* Personal Details */}
                        <Text style={styles.sectionTitle}>Your Details</Text>
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

                        {/* Business Details */}
                        <Text style={styles.sectionTitle}>Business Details</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="briefcase-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Business Name"
                                placeholderTextColor="#999"
                                value={formData.businessName}
                                onChangeText={(value) => handleInputChange("businessName", value)}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="pricetag-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Partner Type (e.g., restaurant, grocery, retail, pharmacy)"
                                placeholderTextColor="#999"
                                value={formData.partnerType}
                                onChangeText={(value) => handleInputChange("partnerType", value)}
                                autoCapitalize="words"
                            />
                        </View>

                        {/* Business Address */}
                        <Text style={styles.sectionTitle}>Business Address</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Street Address"
                                placeholderTextColor="#999"
                                value={formData.street}
                                onChangeText={(value) => handleInputChange("street", value)}
                                autoCapitalize="words"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <Ionicons name="map-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="City"
                                    placeholderTextColor="#999"
                                    value={formData.city}
                                    onChangeText={(value) => handleInputChange("city", value)}
                                    autoCapitalize="words"
                                />
                            </View>
                            <View style={[styles.inputContainer, styles.halfWidth]}>
                                <Ionicons name="map-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="State"
                                    placeholderTextColor="#999"
                                    value={formData.state}
                                    onChangeText={(value) => handleInputChange("state", value)}
                                    autoCapitalize="words"
                                />
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Ionicons name="pin-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Pincode"
                                placeholderTextColor="#999"
                                value={formData.pincode}
                                onChangeText={(value) => handleInputChange("pincode", value)}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Password */}
                        <Text style={styles.sectionTitle}>Account Security</Text>
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
                            <Text style={styles.signupButtonText}>{isLoading ? "Registering Business..." : "Register Business"}</Text>
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
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        paddingHorizontal: 20,
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 15,
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingBottom: 5,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
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
        marginBottom: 0, // Override default marginBottom for row items
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
