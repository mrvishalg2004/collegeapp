import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import api from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function AdminDashboard() {
    const navigation = useNavigation<any>();
    const [stats, setStats] = useState<{ colleges: number; events: number; students: number }>({ colleges: 0, events: 0, students: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data as any);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.logoIcon}>
                        <Ionicons name="grid" size={20} color="#00E5FF" />
                    </View>
                    <Text style={styles.headerTitle}>EventCraft</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={20} color="#F44336" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* System Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusContent}>
                        <Text style={styles.statusLabel}>SYSTEM STATUS: ACTIVE</Text>
                        <Text style={styles.welcomeTitle}>Welcome back, Super Admin</Text>
                        <Text style={styles.statusDesc}>The college network is performing at peak efficiency today.</Text>
                    </View>
                    {/* Decorative Circle */}
                    <View style={styles.decorativeCircle}>
                        <Ionicons name="person" size={80} color="rgba(255,255,255,0.2)" />
                    </View>
                </View>

                {/* System Overview */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>System Overview</Text>
                    <View style={styles.liveBadge}>
                        <Text style={styles.liveText}>Live</Text>
                        <View style={styles.liveDot} />
                    </View>
                </View>

                <View style={styles.overviewGrid}>
                    {/* Colleges Card */}
                    <View style={styles.overviewCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                            <Ionicons name="school" size={24} color="#FF9800" />
                        </View>
                        <Text style={styles.overviewLabel}>Colleges</Text>
                        <Text style={styles.overviewValue}>{loading ? '-' : stats.colleges}</Text>
                        <View style={[styles.trendBadge, { backgroundColor: '#E8F5E9' }]}>
                            <Text style={[styles.trendText, { color: '#4CAF50' }]}>~2%</Text>
                        </View>
                    </View>

                    {/* Students Card */}
                    <View style={styles.overviewCard}>
                        <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                            <Ionicons name="people" size={24} color="#2196F3" />
                        </View>
                        <Text style={styles.overviewLabel}>Students</Text>
                        <Text style={styles.overviewValue}>{loading ? '-' : stats.students}</Text>
                        <View style={[styles.trendBadge, { backgroundColor: '#E8F5E9' }]}>
                            <Text style={[styles.trendText, { color: '#4CAF50' }]}>~5%</Text>
                        </View>
                    </View>
                </View>

                {/* Live Events Card (Full Width) */}
                <View style={styles.liveEventsCard}>
                    <View style={[styles.iconBox, { backgroundColor: '#E0F7FA' }]}>
                        <Ionicons name="calendar" size={24} color="#00BCD4" />
                    </View>
                    <View style={{ marginLeft: 15, flex: 1 }}>
                        <Text style={styles.overviewLabel}>Live Events</Text>
                        <Text style={styles.overviewValue}>{loading ? '-' : stats.events}</Text>
                    </View>
                    <View style={[styles.trendBadge, { backgroundColor: '#E8F5E9' }]}>
                        <Ionicons name="trending-up" size={14} color="#4CAF50" style={{ marginRight: 4 }} />
                        <Text style={[styles.trendText, { color: '#4CAF50' }]}>+15%</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Quick Actions</Text>

                <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#F57C00' }]} onPress={() => navigation.navigate('CollegeList')}>
                    <View style={[styles.actionIconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <Ionicons name="school" size={24} color="#fff" />
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Manage Colleges</Text>
                        <Text style={styles.actionSubtitle}>Configure institutional data</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#3F51B5' }]} onPress={() => navigation.navigate('EventMonitor')}>
                    <View style={[styles.actionIconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <Ionicons name="eye" size={24} color="#fff" />
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Event Monitor</Text>
                        <Text style={styles.actionSubtitle}>Real-time attendance & logs</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#00C853' }]} onPress={() => navigation.navigate('SystemReports')}>
                    <View style={[styles.actionIconBox, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <Ionicons name="stats-chart" size={24} color="#fff" />
                    </View>
                    <View style={styles.actionContent}>
                        <Text style={styles.actionTitle}>Reports</Text>
                        <Text style={styles.actionSubtitle}>Export analytics & summaries</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        width: 35,
        height: 35,
        backgroundColor: '#E0F7FA',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    logoutBtn: {
        width: 35,
        height: 35,
        backgroundColor: '#FFEBEE',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
    },

    // Status Card
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 25,
        marginBottom: 25,
        flexDirection: 'row',
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#00BCD4',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },
    statusContent: {
        flex: 1,
        zIndex: 2,
    },
    statusLabel: {
        color: '#00BCD4',
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 8,
        letterSpacing: 1,
    },
    welcomeTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    statusDesc: {
        color: '#78909C',
        fontSize: 14,
        marginBottom: 20,
        lineHeight: 20,
    },
    decorativeCircle: {
        position: 'absolute',
        right: -30,
        top: -30,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#ECEFF1',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#37474F',
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    liveText: {
        color: '#00BCD4',
        fontWeight: 'bold',
        marginRight: 5,
        fontSize: 12,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00BCD4',
    },
    // Overview Grid
    overviewGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    overviewCard: {
        backgroundColor: '#fff',
        width: '48%',
        padding: 15,
        borderRadius: 20,
        elevation: 2,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    overviewLabel: {
        color: '#78909C',
        fontSize: 14,
        marginBottom: 5,
    },
    overviewValue: {
        color: '#333',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    trendBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
    },
    trendText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    // Live Events Card
    liveEventsCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        marginBottom: 10,
    },
    // Action Cards
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        marginBottom: 15,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
    },
    actionIconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionContent: {
        flex: 1,
        marginLeft: 15,
    },
    actionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    actionSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        marginTop: 2,
    },
});
