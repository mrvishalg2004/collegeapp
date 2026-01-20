import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions, ImageBackground, StatusBar, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { EventService } from '../services/event.service';
import { PaymentService } from '../services/payment.service';

const { width } = Dimensions.get('window');

export default function CollegeDashboard() {
    const navigation = useNavigation<any>();
    const { logout, user } = useAuth();

    const [stats, setStats] = useState({
        activeEvents: 0,
        pendingPayments: 0,
        totalRevenue: 0
    });
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const filters = user?.collegeId ? { collegeId: user.collegeId } : {};
            const [eventsData, pendingData, historyData] = await Promise.all([
                EventService.getEvents(filters) as Promise<any[]>,
                PaymentService.getPendingPayments() as Promise<any[]>,
                PaymentService.getPaymentHistory() as Promise<any[]>
            ]);

            // Ensure we have arrays
            const events = Array.isArray(eventsData) ? eventsData : [];
            const pending = Array.isArray(pendingData) ? pendingData : [];
            const history = Array.isArray(historyData) ? historyData : [];

            // Calculate revenue from history (only paid records)
            const revenue = history.reduce((acc, curr) => acc + (curr.eventId?.fee || 0), 0);

            setStats({
                activeEvents: events.filter(e => !e.completed).length,
                pendingPayments: pending.length,
                totalRevenue: revenue
            });

            // Process Recent Activity
            const activityList: any[] = [];

            // 1. New Events
            events.forEach(e => {
                activityList.push({
                    id: e._id,
                    type: 'event',
                    title: `Event Created`,
                    description: e.name,
                    date: new Date(e.createdAt || Date.now()),
                    icon: 'calendar',
                    color: '#FFF',
                    gradient: ['#42A5F5', '#1976D2']
                });
            });

            // 2. Pending Payments
            pending.forEach(p => {
                activityList.push({
                    id: p._id,
                    type: 'pending',
                    title: `Payment Pending`,
                    description: `${p.studentId?.name || 'Student'} - ₹${p.eventId?.fee || 0}`,
                    date: new Date(p.registrationDate || p.createdAt || Date.now()),
                    icon: 'time',
                    color: '#FFF',
                    gradient: ['#FFCA28', '#FF6F00']
                });
            });

            // 3. Paid History
            history.forEach(h => {
                activityList.push({
                    id: h._id,
                    type: 'paid',
                    title: `Payment Received`,
                    description: `${h.studentId?.name || 'Student'} - ₹${h.eventId?.fee || 0}`,
                    date: new Date(h.updatedAt || h.createdAt || Date.now()),
                    icon: 'checkmark-circle',
                    color: '#FFF',
                    gradient: ['#66BB6A', '#2E7D32']
                });
            });

            // Sort by date desc and take top 5
            const sortedActivity = activityList.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
            setRecentActivity(sortedActivity);

        } catch (error) {
            console.error("Failed to load dashboard stats", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive", onPress: async () => await logout() }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header Background */}
            <LinearGradient
                colors={['#1A237E', '#283593']}
                style={styles.headerBackground}
            >
                <SafeAreaView edges={['top']} style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
                            <View style={styles.logoContainer}>
                                <Ionicons name="school" size={24} color="#FFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.headerGreeting} numberOfLines={1}>Welcome Back,</Text>
                                <Text style={styles.headerName} numberOfLines={1}>{user?.name || 'Admin'}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={18} color="#FFF" style={{ marginRight: 6 }} />
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats Carousel (Horizontal Scroll) */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll} style={{ marginTop: 20 }}>
                        {/* Events Stat */}
                        <LinearGradient colors={['#42A5F5', '#1976D2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
                            <View style={styles.statIconCircle}>
                                <Ionicons name="calendar" size={20} color="#1976D2" />
                            </View>
                            <Text style={styles.statValue}>{stats.activeEvents}</Text>
                            <Text style={styles.statLabel}>Active Events</Text>
                        </LinearGradient>

                        {/* Pending Stat */}
                        <LinearGradient colors={['#FFCA28', '#FF6F00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
                            <View style={styles.statIconCircle}>
                                <Ionicons name="time" size={20} color="#FF6F00" />
                            </View>
                            <Text style={styles.statValue}>{stats.pendingPayments}</Text>
                            <Text style={styles.statLabel}>Pending</Text>
                        </LinearGradient>

                        {/* Revenue Stat */}
                        <LinearGradient colors={['#66BB6A', '#2E7D32']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
                            <View style={styles.statIconCircle}>
                                <Ionicons name="cash" size={20} color="#2E7D32" />
                            </View>
                            <Text style={styles.statValue}>₹{stats.totalRevenue}</Text>
                            <Text style={styles.statLabel}>Total Revenue</Text>
                        </LinearGradient>
                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>

            {/* Main Content (Rounded Sheet) */}
            <View style={styles.mainSheet}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A237E" />
                    }
                >

                    {/* Quick Actions Grid */}
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.gridContainer}>

                        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('ManageDepartments')}>
                            <View style={[styles.gridIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="business" size={24} color="#1565C0" />
                            </View>
                            <Text style={styles.gridTitle}>Departments</Text>
                            <Text style={styles.gridSubtitle}>Manage Units</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('ManageEvents')}>
                            <View style={[styles.gridIcon, { backgroundColor: '#E8F5E9' }]}>
                                <Ionicons name="calendar-outline" size={24} color="#2E7D32" />
                            </View>
                            <Text style={styles.gridTitle}>Events</Text>
                            <Text style={styles.gridSubtitle}>Schedule</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('ManageCoordinators')}>
                            <View style={[styles.gridIcon, { backgroundColor: '#F3E5F5' }]}>
                                <Ionicons name="people" size={24} color="#7B1FA2" />
                            </View>
                            <Text style={styles.gridTitle}>Coordinators</Text>
                            <Text style={styles.gridSubtitle}>Staff Leads</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('VerifyPayments')}>
                            <View style={[styles.gridIcon, { backgroundColor: '#FFF3E0' }]}>
                                <Ionicons name="wallet-outline" size={24} color="#EF6C00" />
                            </View>
                            {stats.pendingPayments > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{stats.pendingPayments}</Text>
                                </View>
                            )}
                            <Text style={styles.gridTitle}>Payments</Text>
                            <Text style={styles.gridSubtitle}>Verify Now</Text>
                        </TouchableOpacity>

                    </View>

                    {/* Recent Activity */}
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={styles.activityContainer}>
                        {recentActivity.length === 0 ? (
                            <Text style={styles.emptyText}>No recent activity</Text>
                        ) : (
                            recentActivity.map((item, index) => (
                                <View key={index} style={styles.activityRow}>
                                    <LinearGradient colors={item.gradient} style={styles.activityIcon}>
                                        <Ionicons name={item.icon} size={16} color="#FFF" />
                                    </LinearGradient>
                                    <View style={styles.activityContent}>
                                        <Text style={styles.activityTitle}>{item.title}</Text>
                                        <Text style={styles.activityDesc}>{item.description}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.activityTime}>
                                            {Math.floor((Date.now() - item.date.getTime()) / (1000 * 60 * 60 * 24)) === 0
                                                ? 'Today'
                                                : `${Math.floor((Date.now() - item.date.getTime()) / (1000 * 60 * 60 * 24))}d ago`}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    {/* Secondary Logout Option */}
                    <TouchableOpacity style={styles.secondaryLogoutBtn} onPress={handleLogout}>
                        <Ionicons name="log-out" size={20} color="#FF5252" />
                        <Text style={styles.secondaryLogoutText}>Sign Out Account</Text>
                    </TouchableOpacity>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A237E', // Match header bg for seamless look
    },
    headerBackground: {
        paddingBottom: 30, // Space for the rounded sheet overlap
    },
    headerContent: {
        paddingHorizontal: 20,
        paddingBottom: 20
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    logoContainer: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12
    },
    headerGreeting: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
    headerName: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    logoutText: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: 'bold'
    },

    // Stats
    statsScroll: { paddingRight: 20 },
    statCard: {
        width: 140, height: 100, borderRadius: 16,
        padding: 15, marginRight: 15,
        justifyContent: 'space-between'
    },
    statIconCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#FFF',
        justifyContent: 'center', alignItems: 'center',
        alignSelf: 'flex-start'
    },
    statValue: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 5 },
    statLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },

    // Main Sheet
    mainSheet: {
        flex: 1, backgroundColor: '#F5F7FA',
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        marginTop: -20,
        overflow: 'hidden'
    },
    scrollContent: { padding: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A237E', marginBottom: 15, marginTop: 10 },

    // Grid
    gridContainer: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'
    },
    gridItem: {
        width: '48%', backgroundColor: '#FFF',
        borderRadius: 20, padding: 20, marginBottom: 15,
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5,
        alignItems: 'flex-start'
    },
    gridIcon: {
        width: 45, height: 45, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginBottom: 15
    },
    gridTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    gridSubtitle: { fontSize: 12, color: '#999', marginTop: 2 },
    badge: {
        position: 'absolute', top: 15, right: 15,
        backgroundColor: '#FF5252', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10
    },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

    // Activity
    activityContainer: {
        backgroundColor: '#FFF', borderRadius: 20, padding: 20,
        elevation: 2, shadowColor: '#000', shadowOpacity: 0.05
    },
    activityRow: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 20
    },
    activityIcon: {
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    activityContent: { flex: 1 },
    activityTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    activityDesc: { fontSize: 12, color: '#666' },
    activityTime: { fontSize: 11, color: '#BBB', fontWeight: 'bold' },
    emptyText: { color: '#999', textAlign: 'center', fontStyle: 'italic' },
    secondaryLogoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        marginTop: 30,
        paddingVertical: 15,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFEBEE',
        elevation: 1, shadowColor: '#000', shadowOpacity: 0.05
    },
    secondaryLogoutText: {
        color: '#FF5252',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10
    }
});
