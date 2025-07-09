"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from "react-native"
import { useAuth } from "@/contexts/AuthContext"

export default function ProfileScreen() {
  const { user, logout } = useAuth()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Edit profile form state
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  })

  // Change password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setIsLoading(true)
          try {
            await logout()
          } catch (error) {
            console.error("Logout error:", error)
          } finally {
            setIsLoading(false)
          }
        },
      },
    ])
  }

  const handleSaveProfile = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    try {
      setIsLoading(true)
      // Here you would call an API to update the profile
      // const response = await authService.updateProfile(editForm)

      Alert.alert("Success", "Profile updated successfully")
      setShowEditModal(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
      Alert.alert("Error", "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Error", "New passwords do not match")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters")
      return
    }

    try {
      setIsLoading(true)
      // Here you would call an API to change the password
      // const response = await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword)

      Alert.alert("Success", "Password changed successfully")
      setShowChangePasswordModal(false)
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Failed to change password:", error)
      Alert.alert("Error", "Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Administrator"
      case "partner_manager":
        return "Partner Manager"
      case "operations_manager":
        return "Operations Manager"
      case "customer_support":
        return "Customer Support"
      default:
        return role
    }
  }

  const getPermissionModules = () => {
    if (!user?.permissions) return []
    return user.permissions.map((p) => p.module).join(", ")
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Profile Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{getRoleDisplayName(user?.role || "")}</Text>
        </View>

        {user?.permissions && user.permissions.length > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Permissions</Text>
            <Text style={styles.value}>{getPermissionModules()}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>

        <TouchableOpacity style={styles.actionButton} onPress={() => setShowChangePasswordModal(true)}>
          <Text style={styles.actionButtonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>
            {isLoading ? "Logging out..." : "Logout"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={isLoading}>
              <Text style={styles.saveButton}>{isLoading ? "Saving..." : "Save"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editForm.name}
                onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={editForm.email}
                onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={showChangePasswordModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowChangePasswordModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={handleChangePassword} disabled={isLoading}>
              <Text style={styles.saveButton}>{isLoading ? "Changing..." : "Change"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                value={passwordForm.currentPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, currentPassword: text })}
                placeholder="Enter current password"
                secureTextEntry
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                value={passwordForm.newPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, newPassword: text })}
                placeholder="Enter new password"
                secureTextEntry
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                value={passwordForm.confirmPassword}
                onChangeText={(text) => setPasswordForm({ ...passwordForm, confirmPassword: text })}
                placeholder="Confirm new password"
                secureTextEntry
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: {
    fontSize: 16,
    color: "#666",
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: "#333",
    flex: 2,
    textAlign: "right",
  },
  editButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  actionButton: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  logoutButton: {
    backgroundColor: "#ffebee",
  },
  logoutButtonText: {
    color: "#F44336",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cancelButton: {
    color: "#007AFF",
    fontSize: 16,
  },
  saveButton: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
})
