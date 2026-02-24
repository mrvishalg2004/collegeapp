import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function SystemReports() {
    const navigation = useNavigation();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await api.get('/admin/reports');
            setData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <View style={styles.loadingContainer}>
            <LinearGradient colors={['#0F172A', '#020617']} style={StyleSheet.absoluteFill} />
            <ActivityIndicator color="#F59E0B" size="large" />
            <Text style={styles.loaderText}>GENESIS IN PROGRESS...</Text>
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />
            <View style={styles.meshContainer}>
                <LinearGradient colors={['#F59E0B', 'transparent']} style={[styles.orb, styles.orb1]} />
                <LinearGradient colors={['#A855F7', 'transparent']} style={[styles.orb, styles.orb2]} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>System Intelligence</Text>
                    <TouchableOpacity onPress={fetchReports} style={styles.refreshBtn}>
                        <Ionicons name="sync" size={20} color="#F59E0B" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Revenue Hero Card */}
                    <View style={styles.revenueHero}>
                        <LinearGradient
                            colors={['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.05)']}
                            style={styles.revenueInner}
                        >
                            <View style={styles.rowBetween}>
                                <Text style={styles.statLabel}>NET REVENUE FLOW</Text>
                                <View style={styles.vibrantBadge}>
                                    <Ionicons name="trending-up" size={14} color="#fff" />
                                    <Text style={styles.badgeText}>+18.4%</Text>
                                </View>
                            </View>
                            <Text style={styles.revenueValue}>₹{data?.totalRevenue?.toLocaleString()}</Text>
                            <View style={styles.glowBar} />
                            <Text style={styles.subLabel}>{data?.recentSubscriptions?.length || 0} SECURED TRANSACTIONS</Text>
                        </LinearGradient>
                    </View>

                    <View style={styles.grid}>
                        <Text style={styles.sectionTitle}>Institutional Rankings</Text>
                        {data?.topColleges?.map((college: any, index: number) => (
                            <TouchableOpacity key={index} style={styles.insightCard}>
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                                    style={styles.cardInner}
                                >
                                    <View style={styles.rankIcon}>
                                        <Text style={styles.rankText}>{index + 1}</Text>
                                    </View>
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.collegeName}>{college.collegeName}</Text>
                                        <View style={styles.progressContainer}>
                                            <LinearGradient
                                                colors={['#A855F7', '#D946EF']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={[styles.progressBar, { width: `${Math.min((college.eventCount / 15) * 100, 100)}%` }]}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statCount}>{college.eventCount}</Text>
                                        <Text style={styles.statUnit}>EVENTS</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Ledger Section */}
                    <View style={styles.ledgerSection}>
                        <Text style={styles.sectionTitle}>Financial Ledger</Text>
                        {data?.recentSubscriptions?.map((sub: any, index: number) => (
                            <View key={index} style={styles.ledgerItem}>
                                <View style={styles.ledgerInfo}>
                                    <Text style={styles.ledgerName}>{sub.name}</Text>
                                    <Text style={styles.ledgerMeta}>{sub.paidAt ? new Date(sub.paidAt).toDateString() : 'VERIFYING...'}</Text>
                                </View>
                                <View style={styles.ledgerValueBox}>
                                    <Text style={styles.ledgerAmount}>₹{sub.subscriptionPrice}</Text>
                                    <Text style={styles.ledgerStatus}>AUTHORIZED</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#020617' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { color: '#F59E0B', marginTop: 20, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
    meshContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    orb: { position: 'absolute', width: width, height: width, borderRadius: width / 2, opacity: 0.1 },
    orb1: { top: -200, left: -100 },
    orb2: { bottom: -200, right: -100 },
    safeArea: { flex: 1 },
    header: { paddingHorizontal: 25, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    refreshBtn: { padding: 8 },
    scrollContent: { paddingHorizontal: 25 },
    revenueHero: { borderRadius: 32, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)', marginBottom: 35, elevation: 20, shadowColor: '#F59E0B', shadowOpacity: 0.2, shadowRadius: 20 },
    revenueInner: { padding: 28 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statLabel: { color: 'rgba(245, 158, 11, 0.6)', fontSize: 11, fontWeight: 'bold', letterSpacing: 2 },
    vibrantBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '900', marginLeft: 4 },
    revenueValue: { color: '#fff', fontSize: 42, fontWeight: '900', marginTop: 15, letterSpacing: -1 },
    glowBar: { height: 2, backgroundColor: '#F59E0B', width: 60, marginTop: 15, marginBottom: 15, opacity: 0.4 },
    subLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 'bold' },
    sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 20, letterSpacing: 1 },
    grid: { marginBottom: 30 },
    insightCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 15 },
    cardInner: { flexDirection: 'row', alignItems: 'center', padding: 20 },
    rankIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(168, 85, 247, 0.1)', justifyContent: 'center', alignItems: 'center' },
    rankText: { color: '#A855F7', fontWeight: '900', fontSize: 16 },
    cardInfo: { flex: 1, marginLeft: 16, marginRight: 16 },
    collegeName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    progressContainer: { height: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: 3 },
    statBox: { alignItems: 'center' },
    statCount: { color: '#fff', fontSize: 20, fontWeight: '900' },
    statUnit: { color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' },
    ledgerSection: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    ledgerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    ledgerInfo: { flex: 1 },
    ledgerName: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    ledgerMeta: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 4 },
    ledgerValueBox: { alignItems: 'flex-end' },
    ledgerAmount: { color: '#10B981', fontSize: 16, fontWeight: '900' },
    ledgerStatus: { color: 'rgba(16, 185, 129, 0.4)', fontSize: 9, fontWeight: '900', marginTop: 4 }
});
