import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import api from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
    const navigation = useNavigation<any>();
    const [stats, setStats] = useState({ colleges: 0, events: 0, students: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const { logout } = useAuth();
    // const navigation = useNavigation<any>(); // Navigation might be used for other actions

    const handleLogout = async () => {
        await logout();
        // Context update will trigger AppNavigator to switch to Login screen automatically
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeText}>Welcome, Admin</Text>
                    <Text style={styles.dateText}>{new Date().toDateString()}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{loading ? '-' : stats.colleges}</Text>
                        <Text style={styles.statLabel}>Colleges</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{loading ? '-' : stats.events}</Text>
                        <Text style={styles.statLabel}>Events</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{loading ? '-' : stats.students}</Text>
                        <Text style={styles.statLabel}>Students</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Management</Text>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CollegeList')}>
                    <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.gradient}>
                        <Ionicons name="school" size={24} color="#fff" />
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>Manage Colleges</Text>
                            <Text style={styles.actionSubtitle}>Add, Edit, View Colleges</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('EventMonitor')}>
                    <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.gradient}>
                        <Ionicons name="calendar" size={24} color="#fff" />
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>Event Monitor</Text>
                            <Text style={styles.actionSubtitle}>Track active events & stats</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('SystemReports')}>
                    <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.gradient}>
                        <Ionicons name="document-text" size={24} color="#fff" />
                        <View style={styles.actionTextContainer}>
                            <Text style={styles.actionTitle}>Reports</Text>
                            <Text style={styles.actionSubtitle}>View System Reports</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>

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
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginHorizontal: 5,
        elevation: 2,
    },
    statNumber: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    actionButton: {
        marginBottom: 15,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 12,
    },
    actionTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    actionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    actionSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
    },
});
