import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { EventService } from '../services/event.service';
import { PaymentService } from '../services/payment.service';
import { AuthService } from '../services/auth.service';
import { Ionicons } from '@expo/vector-icons';
import { IEvent } from '../types';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Deterministic Image Helper
const getEventImage = (deptName: string = '') => {
    const name = deptName.toLowerCase();
    if (name.includes('computer') || name.includes('cs')) return 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    if (name.includes('mech')) return 'https://images.unsplash.com/photo-1581094794329-cd11965d152a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    if (name.includes('electr')) return 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    return 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
};

export default function CoordDashboard() {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'events' | 'finance' | 'alerts' | 'profile'>('events');
    const [user, setUser] = useState<any>(null); // For profile

    const navigation = useNavigation<any>();
    const { logout } = useAuth();

    const loadData = async () => {
        try {
            setLoading(true);
            const [myEvents, pending, profile] = await Promise.all([
                EventService.getMyAssignments(),
                PaymentService.getPendingPayments(),
                AuthService.getCurrentUser()
            ]);
            setEvents(myEvents as IEvent[]);
            setPendingCount((pending as any).length);
            setUser(profile);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleLogout = async () => {
        await logout();
    };

    const renderEventCard = ({ item }: { item: IEvent }) => {
        const imageUri = getEventImage((item.departmentId as any)?.name);
        return (
            <View style={styles.cardContainer}>
                <View style={styles.cardLeft}>
                    <View style={[styles.statusBadge, item.completed ? styles.statusCompleted : styles.statusActive]}>
                        <Text style={[styles.statusText, item.completed ? { color: '#546E7A' } : { color: '#00695C' }]}>
                            {item.completed ? 'COMPLETED' : 'ACTIVE'}
                        </Text>
                    </View>
                    <Text style={styles.eventTitle} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.eventDate}>{new Date(item.date).toDateString()}</Text>

                    <TouchableOpacity
                        style={styles.manageBtn}
                        onPress={() => navigation.navigate('EventAttendance', { eventId: item._id, eventName: item.name })}
                    >
                        <Text style={styles.manageBtnText}>{item.completed ? 'View Summary' : 'Manage Details'}</Text>
                        <Ionicons name="arrow-forward" size={16} color="#333" />
                    </TouchableOpacity>
                </View>
                <Image source={{ uri: imageUri }} style={styles.cardImage} />
            </View>
        );
    };

    // --- Sub-Views ---

    const EventsView = () => (
        <ScrollView
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* Pending Tasks Gradient Card */}
            <LinearGradient
                colors={['#1565C0', '#1976D2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
            >
                <View>
                    <Text style={styles.gradientLabel}>PENDING TASKS</Text>
                    <Text style={styles.gradientValue}>{pendingCount} Payments</Text>
                </View>
                <TouchableOpacity
                    style={styles.verifyBtn}
                    onPress={() => setActiveTab('finance')} // Switch to finance tab
                >
                    <Text style={styles.verifyBtnText}>Verify Now</Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* My Events Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>MY EVENTS</Text>
                <TouchableOpacity>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} color="#1565C0" />
            ) : (
                <FlatList
                    data={events}
                    renderItem={renderEventCard}
                    keyExtractor={item => item._id}
                    scrollEnabled={false}
                    ListEmptyComponent={<Text style={styles.emptyText}>No events assigned yet.</Text>}
                />
            )}
        </ScrollView>
    );

    const FinanceView = () => (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.tabContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <Text style={styles.tabTitle}>Finance Control</Text>
            <View style={styles.financeCard}>
                <Ionicons name="cash-outline" size={50} color="#1565C0" style={{ marginBottom: 10 }} />
                <Text style={styles.bigNumber}>{pendingCount}</Text>
                <Text style={styles.subText}>Pending Offline Payments</Text>
                <TouchableOpacity
                    style={styles.mainActionBtn}
                    onPress={() => navigation.navigate('VerifyPayments')}
                >
                    <Text style={styles.actionBtnText}>Go to Payment Verification</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const AlertsView = () => (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.tabContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <Text style={styles.tabTitle}>Notifications</Text>
            <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>No new alerts</Text>
            </View>
        </ScrollView>
    );

    const ProfileView = () => (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.tabContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <Text style={styles.tabTitle}>Coordinator Profile</Text>
            <View style={styles.profileCard}>
                <View style={[styles.iconBox, { width: 60, height: 60, borderRadius: 30, marginBottom: 15 }]}>
                    <Ionicons name="person" size={30} color="#1A237E" />
                </View>
                <Text style={styles.profileName}>{user?.name || 'Coordinator'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'email@college.edu'}</Text>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#D32F2F" style={{ marginRight: 10 }} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Common Header */}
            <View style={styles.header}>
                <View style={styles.iconBox}>
                    <Ionicons name="briefcase" size={24} color="#1A237E" />
                </View>
                <Text style={styles.headerTitle}>Coordinator Dashboard</Text>
            </View>

            {/* Content Area */}
            <View style={{ flex: 1 }}>
                {activeTab === 'events' && <EventsView />}
                {activeTab === 'finance' && <FinanceView />}
                {activeTab === 'alerts' && <AlertsView />}
                {activeTab === 'profile' && <ProfileView />}
            </View>

            {/* Bottom Navigation */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('events')}>
                    <Ionicons name={activeTab === 'events' ? "grid" : "grid-outline"} size={24} color={activeTab === 'events' ? "#1565C0" : "#999"} />
                    <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>EVENTS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('finance')}>
                    <Ionicons name={activeTab === 'finance' ? "wallet" : "wallet-outline"} size={24} color={activeTab === 'finance' ? "#1565C0" : "#999"} />
                    <Text style={[styles.tabText, activeTab === 'finance' && styles.activeTabText]}>FINANCE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('alerts')}>
                    <Ionicons name={activeTab === 'alerts' ? "notifications" : "notifications-outline"} size={24} color={activeTab === 'alerts' ? "#1565C0" : "#999"} />
                    <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>ALERTS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('profile')}>
                    <Ionicons name={activeTab === 'profile' ? "person" : "person-outline"} size={24} color={activeTab === 'profile' ? "#1565C0" : "#999"} />
                    <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>PROFILE</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#E8EAF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A237E'
    },

    // Gradient Card
    gradientCard: {
        margin: 20,
        borderRadius: 15,
        padding: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#1565C0',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
    },
    gradientLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 5
    },
    gradientValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold'
    },
    verifyBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    verifyBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12
    },

    // Section
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#78909C',
        letterSpacing: 1
    },
    viewAllText: {
        fontSize: 12,
        color: '#1565C0',
        fontWeight: 'bold'
    },

    // Event Card
    cardContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 15,
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    cardLeft: {
        flex: 1,
        paddingRight: 10,
        justifyContent: 'center'
    },
    cardImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#eee'
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 8
    },
    statusActive: { backgroundColor: '#E0F2F1' },
    statusCompleted: { backgroundColor: '#ECEFF1' },
    statusText: { fontSize: 10, fontWeight: 'bold' },

    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5
    },
    eventDate: {
        fontSize: 12,
        color: '#90A4AE',
        marginBottom: 12
    },
    manageBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: 'flex-start'
    },
    manageBtnText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1565C0',
        marginRight: 5
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20
    },

    // Bottom Bar
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingBottom: 20,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    tabItem: {
        alignItems: 'center',
        padding: 5
    },
    tabText: {
        fontSize: 10,
        marginTop: 4,
        color: '#999'
    },
    activeTabText: {
        color: '#1565C0',
        fontWeight: 'bold'
    },

    // Tab Contents
    tabContent: {
        flex: 1,
        padding: 20,
        alignItems: 'center'
    },
    tabTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        alignSelf: 'flex-start'
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    // Finance Tab
    financeCard: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10
    },
    bigNumber: { fontSize: 48, fontWeight: 'bold', color: '#1565C0' },
    subText: { fontSize: 16, color: '#666', marginBottom: 20 },
    mainActionBtn: {
        backgroundColor: '#1565C0',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10
    },
    actionBtnText: { color: '#fff', fontWeight: 'bold' },

    // Profile Tab
    profileCard: {
        width: '100%',
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 5
    },
    profileName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    profileEmail: { fontSize: 14, color: '#666', marginBottom: 30 },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#FFEBEE',
        width: '100%',
        justifyContent: 'center'
    },
    logoutText: {
        color: '#D32F2F',
        fontWeight: 'bold',
        fontSize: 16
    }
});
