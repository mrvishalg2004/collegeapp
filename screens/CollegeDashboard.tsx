import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function CollegeDashboard() {
    const navigation = useNavigation<any>();

    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>College Admin</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeText}>Dashboard</Text>
                    <Text style={styles.dateText}>Manage your college events</Text>
                </View>

                <View style={styles.grid}>
                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ManageDepartments')}>
                        <Ionicons name="business" size={32} color="#4CAF50" />
                        <Text style={styles.cardText}>Departments</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ManageEvents')}>
                        <Ionicons name="calendar-outline" size={32} color="#2196F3" />
                        <Text style={styles.cardText}>Events</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ManageCoordinators')}>
                        <Ionicons name="people" size={32} color="#9C27B0" />
                        <Text style={styles.cardText}>Coordinators</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('VerifyPayments')}>
                        <Ionicons name="cash-outline" size={32} color="#FF9800" />
                        <Text style={styles.cardText}>Verify Payments</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PaymentHistory')}>
                        <Ionicons name="receipt-outline" size={32} color="#607D8B" />
                        <Text style={styles.cardText}>History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => Alert.alert('Coming Soon', 'Profile management')}>
                        <Ionicons name="person-circle-outline" size={32} color="#9C27B0" />
                        <Text style={styles.cardText}>Profile</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        padding: 20,
    },
    welcomeCard: {
        marginBottom: 30,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    dateText: {
        fontSize: 16,
        color: '#666',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    }
});
