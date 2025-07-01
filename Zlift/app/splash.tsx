"use client"

import { useEffect, useRef } from "react"
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "../contexts/AuthContext"

const { width, height } = Dimensions.get("window")

export default function SplashScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current
    const scaleAnim = useRef(new Animated.Value(0.3)).current
    const slideAnim = useRef(new Animated.Value(50)).current

    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                delay: 300,
                useNativeDriver: true,
            }),
        ]).start()

        // Navigate after animations and auth check
        const timer = setTimeout(() => {
            if (!isLoading) {
                if (user) {
                    router.replace("/(tabs)")
                } else {
                    router.replace("/login")
                }
            }
        }, 2500)

        return () => clearTimeout(timer)
    }, [user, isLoading])

    return (
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.container}>
            <StatusBar barStyle="light-content" />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name="airplane" size={80} color="white" />
                </View>

                <Animated.View
                    style={[
                        styles.textContainer,
                        {
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Text style={styles.title}>Drone Delivery</Text>
                    <Text style={styles.subtitle}>Admin Dashboard</Text>
                </Animated.View>

                <Animated.View
                    style={[
                        styles.loadingContainer,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                >
                    <View style={styles.loadingDots}>
                        <View style={[styles.dot, styles.dot1]} />
                        <View style={[styles.dot, styles.dot2]} />
                        <View style={[styles.dot, styles.dot3]} />
                    </View>
                </Animated.View>
            </Animated.View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        alignItems: "center",
        justifyContent: "center",
    },
    iconContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    textContainer: {
        alignItems: "center",
        marginBottom: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "white",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 18,
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
    },
    loadingContainer: {
        alignItems: "center",
    },
    loadingDots: {
        flexDirection: "row",
        alignItems: "center",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "white",
        marginHorizontal: 4,
    },
    dot1: {
        opacity: 0.4,
    },
    dot2: {
        opacity: 0.7,
    },
    dot3: {
        opacity: 1,
    },
})
