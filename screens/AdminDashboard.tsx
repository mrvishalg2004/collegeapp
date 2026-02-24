import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function AdminDashboard() {
    const navigation = useNavigation<any>();
    const [stats, setStats] = useState<{ colleges: number; events: number; students: number }>({ colleges: 0, events: 0, students: 0 });
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();

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

    const handleLogout = async () => {
        await logout();
    };

    const StatCard = ({ title, value, icon, colors, glowColor }: any) => (
        <TouchableOpacity style={styles.neoStatCard} activeOpacity={0.9}>
            <View style={[styles.glowContainer, { shadowColor: glowColor }]} />
            <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.05)']}
                style={styles.neoStatInner}
            >
                <LinearGradient colors={colors} style={styles.statIconBox}>
                    <Ionicons name={icon} size={24} color="#fff" />
                </LinearGradient>
                <View style={styles.statContent}>
                    <Text style={styles.neoStatValue}>{value}</Text>
                    <Text style={styles.neoStatTitle}>{title.toUpperCase()}</Text>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    const MenuButton = ({ title, subtitle, icon, color, onPress }: any) => (
        <TouchableOpacity style={styles.neoMenuBtn} onPress={onPress} activeOpacity={0.8}>
            <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']}
                style={styles.neoMenuInner}
            >
                <View style={[styles.menuIconBox, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={28} color={color} />
                </View>
                <View style={styles.menuText}>
                    <Text style={styles.neoMenuTitle}>{title}</Text>
                    <Text style={styles.neoMenuSub}>{subtitle}</Text>
                </View>
                <View style={styles.menuArrow}>
                    <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />

            {/* Background Mesh Elements */}
            <View style={styles.meshContainer}>
                <LinearGradient colors={['#A855F7', 'transparent']} style={[styles.orb, styles.orb1]} />
                <LinearGradient colors={['#06B6D4', 'transparent']} style={[styles.orb, styles.orb2]} />
                <LinearGradient colors={['#F59E0B', 'transparent']} style={[styles.orb, styles.orb3]} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>System Command</Text>
                        <Text style={styles.brandText}>EVENTCRAFT<Text style={{ color: '#A855F7' }}>.OS</Text></Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={styles.logoutCircle}>
                        <Ionicons name="power" size={24} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Hero Stats */}
                    <View style={styles.statsContainer}>
                        <StatCard
                            title="Institutions"
                            value={loading ? "..." : stats.colleges}
                            icon="business"
                            colors={['#A855F7', '#7E22CE']}
                            glowColor="#A855F7"
                        />
                        <StatCard
                            title="Global Events"
                            value={loading ? "..." : stats.events}
                            icon="flash"
                            colors={['#06B6D4', '#0891B2']}
                            glowColor="#06B6D4"
                        />
                        <StatCard
                            title="User Base"
                            value={loading ? "..." : stats.students}
                            icon="people"
                            colors={['#F59E0B', '#D97706']}
                            glowColor="#F59E0B"
                        />
                    </View>

                    {/* Console Header */}
                    <View style={styles.consoleSection}>
                        <View style={styles.consoleHeader}>
                            <View style={styles.consoleLine} />
                            <Text style={styles.consoleHeaderText}>ADMINISTRATION CONSOLE</Text>
                            <View style={styles.consoleLine} />
                        </View>

                        {/* Menu Actions */}
                        <View style={styles.menuGrid}>
                            <MenuButton
                                title="Institutional Directory"
                                subtitle="Verify and manage campus access"
                                icon="shield-checkmark"
                                color="#A855F7"
                                onPress={() => navigation.navigate('CollegeList')}
                            />
                            <MenuButton
                                title="Live Activity Monitor"
                                subtitle="Real-time global event tracking"
                                icon="radio"
                                color="#06B6D4"
                                onPress={() => navigation.navigate('EventMonitor')}
                            />
                            <MenuButton
                                title="Intelligence & Reports"
                                subtitle="Revenue analytics and performance"
                                icon="stats-chart"
                                color="#F59E0B"
                                onPress={() => navigation.navigate('SystemReports')}
                            />
                        </View>
                    </View>

                    <View style={styles.systemFooter}>
                        <View style={styles.scanLine} />
                        <Text style={styles.systemText}>SYSTEM LOG: ACCESS AUTHORIZED • v2.1.0-NEO</Text>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#020617',
    },
    meshContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    orb: {
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        opacity: 0.15,
    },
    orb1: { top: -200, left: -200 },
    orb2: { bottom: -200, right: -200 },
    orb3: { top: '30%', left: '10%', width: width * 0.8, height: width * 0.8, opacity: 0.1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        paddingTop: 15,
        paddingBottom: 25,
    },
    welcomeText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    brandText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -1,
    },
    logoutCircle: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    scrollContent: { paddingBottom: 40 },
    statsContainer: {
        paddingHorizontal: 25,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    neoStatCard: {
        width: (width - 65) / 2,
        height: 160,
        marginBottom: 15,
        position: 'relative',
    },
    glowContainer: {
        position: 'absolute',
        top: 15,
        left: 15,
        right: 15,
        bottom: 15,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 10,
    },
    neoStatInner: {
        flex: 1,
        borderRadius: 30,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'space-between',
    },
    statIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: {
        marginTop: 10,
    },
    neoStatValue: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
        letterSpacing: -1,
    },
    neoStatTitle: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginTop: 2,
    },
    consoleSection: {
        marginTop: 25,
        paddingHorizontal: 25,
    },
    consoleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    consoleLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    consoleHeaderText: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
        paddingHorizontal: 15,
    },
    menuGrid: {
        gap: 15,
    },
    neoMenuBtn: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    neoMenuInner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    menuIconBox: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        flex: 1,
        marginLeft: 20,
    },
    neoMenuTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    neoMenuSub: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 12,
        marginTop: 4,
    },
    menuArrow: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    systemFooter: {
        marginTop: 50,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    scanLine: {
        width: 100,
        height: 2,
        backgroundColor: '#A855F7',
        borderRadius: 1,
        marginBottom: 15,
        shadowColor: '#A855F7',
        shadowOpacity: 0.8,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
        elevation: 10,
    },
    systemText: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});
