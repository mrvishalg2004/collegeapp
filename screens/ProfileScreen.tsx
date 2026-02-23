import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Picker } from '@react-native-picker/picker';

export default function ProfileScreen() {
    const { user, login } = useAuth(); // Ideally updateProfile
    const [name, setName] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);

    // In a real app, fetch Colleges/Departments to populate pickers
    // For now, read-only display or simple text inputs

    const handleSave = async () => {
        setLoading(true);
        try {
            // Need API endpoint: PUT /auth/profile or /users/me
            // await api.put('/users/me', { name });
            Alert.alert("Success", "Profile updated");
        } catch (e) {
            Alert.alert("Error", "Failed to update");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>My Profile</Text>

            <View style={styles.field}>
                <Text style={styles.label}>Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput style={[styles.input, styles.disabled]} value={user?.email} editable={false} />
            </View>

            <View style={styles.field}>
                <Text style={styles.label}>Role</Text>
                <TextInput style={[styles.input, styles.disabled]} value={user?.role} editable={false} />
            </View>

            {/* If Student, show more fields like Department, College */}

            <TouchableOpacity style={styles.btn} onPress={handleSave}>
                <Text style={styles.btnText}>Save Changes</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    field: { marginBottom: 15 },
    label: { marginBottom: 5, color: '#666' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, fontSize: 16 },
    disabled: { backgroundColor: '#f0f0f0', color: '#999' },
    btn: { backgroundColor: '#2196F3', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#fff', fontWeight: 'bold' }
});
