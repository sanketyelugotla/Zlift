"use client"

import type React from "react"
import { useEffect } from "react"
import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useColorScheme } from "@/components/useColorScheme"
import Colors from "@/constants/Colors"
import { useAuth } from "@/contexts/AuthContext"
import { Redirect } from "expo-router"

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>["name"]
  color: string
}) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />
}

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const { isAuthenticated, user, isLoadingAuth, refreshPartnerOutlets } = useAuth()

  useEffect(() => {
    // If user is a partner, refresh their outlets to ensure the latest data is in context
    if (user && user.userType === "partner") {
      refreshPartnerOutlets()
    }
  }, [user, refreshPartnerOutlets])

  if (isLoadingAuth) {
    // Optionally render a loading spinner or splash screen
    return null
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />
  }

  // Conditional redirect for partners without outlets
  if (user && user.userType === "partner" && user.outlets && user.outlets.length === 0) {
    return <Redirect href="/create-outlet" />
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color }) => <TabBarIcon name="cube" color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }) => <TabBarIcon name="stats-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  )
}
