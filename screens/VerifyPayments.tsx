import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaymentService } from '../services/payment.service';
import { IRegistration } from '../types';

export default function VerifyPayments({ navigation }: any) {
    const [pending, setPending] = useState<IRegistration[]>([]);
    const [verified, setVerified] = useState<IRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'pending' | 'verified'>('pending');
    const [searchText, setSearchText] = useState('');

    const totals = {
        pending: pending.reduce((sum, item) => sum + (Number((item.eventId as any)?.fee) || 0), 0),
        verified: verified.reduce((sum, item) => sum + (Number((item.eventId as any)?.fee) || 0), 0)
    };

    const loadData = async () => {
        try {
            const [pendingRes, verifiedRes] = await Promise.all([
                PaymentService.getPendingPayments() as Promise<IRegistration[]>,
                PaymentService.getPaymentHistory() as Promise<IRegistration[]>
            ]);
            setPending(pendingRes);
            setVerified(verifiedRes);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to refresh payment data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleConfirm = async (id: string) => {
        try {
            await PaymentService.confirmOfflinePayment(id);
            Alert.alert("Success", "Payment verified successfully");
            loadData(); // Reload all
        } catch (e) {
            Alert.alert("Error", "Failed to confirm payment");
        }
    };

    const filteredData = (activeTab === 'pending' ? pending : verified).filter(item =>
        (item.studentId as any)?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.eventId as any)?.name?.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.eventName}>{item.eventId?.name?.toUpperCase()}</Text>
                <View style={[styles.badge, { backgroundColor: item.paymentMethod === 'online' ? '#E3F2FD' : '#E8F5E9' }]}>
                    <Text style={[styles.badgeText, { color: item.paymentMethod === 'online' ? '#1565C0' : '#2E7D32' }]}>
                        {item.paymentMethod.toUpperCase()}
                    </Text>
                </View>
            </View>

            <Text style={styles.studentName}>{item.studentId?.name}</Text>

            <View style={styles.metaRow}>
                <View>
                    <Text style={styles.metaLabel}>Registration ID</Text>
                    <Text style={styles.metaValue}>#REG-{item._id.substring(item._id.length - 5)}</Text>
                </View>
                <View>
                    <Text style={[styles.amount, { textAlign: 'right', color: activeTab === 'pending' ? '#FFA000' : '#2E7D32' }]}>
                        ₹{(item.eventId?.fee || 0).toFixed(2)}
                    </Text>
                </View>
            </View>

            <Text style={styles.timeText}>
                {activeTab === 'pending' ? 'Initiated' : 'Verified'}: {new Date(item.updatedAt || item.createdAt).toLocaleString()}
            </Text>

            {activeTab === 'pending' && (
                <TouchableOpacity style={styles.verifyBtn} onPress={() => handleConfirm(item._id)}>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.verifyBtnText}>Verify Cash Payment</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Financial Overview</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>PENDING ({pending.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'verified' && styles.activeTab]}
                    onPress={() => setActiveTab('verified')}
                >
                    <Text style={[styles.tabText, activeTab === 'verified' && styles.activeTabText]}>VERIFIED ({verified.length})</Text>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search student or event..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator style={{ marginTop: 40 }} color="#1A237E" size="large" />
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={60} color="#DDD" />
                            <Text style={styles.emptyText}>No {activeTab} payments found</Text>
                        </View>
                    }
                />
            )}

            {/* Comprehensive Footer */}
            <View style={styles.footer}>
                <View style={styles.footerStat}>
                    <Text style={styles.footerLabel}>COLLECTED</Text>
                    <Text style={[styles.footerAmount, { color: '#2E7D32' }]}>₹{totals.verified.toFixed(0)}</Text>
                </View>
                <View style={styles.footerDivider} />
                <View style={styles.footerStat}>
                    <Text style={styles.footerLabel}>PENDING</Text>
                    <Text style={[styles.footerAmount, { color: '#FFA000' }]}>₹{totals.pending.toFixed(0)}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    tabContainer: {
        flexDirection: 'row', backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#eee',
    },
    tab: {
        flex: 1, paddingVertical: 15, alignItems: 'center',
        borderBottomWidth: 2, borderBottomColor: 'transparent',
    },
    activeTab: { borderBottomColor: '#1A237E' },
    tabText: { fontWeight: 'bold', color: '#999', fontSize: 12, letterSpacing: 0.5 },
    activeTabText: { color: '#1A237E' },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        margin: 15, paddingHorizontal: 15, borderRadius: 12,
        borderWidth: 1, borderColor: '#E0E0E0', height: 48,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 15 },
    listContent: { paddingHorizontal: 15, paddingBottom: 20 },
    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 15,
        elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    eventName: { fontSize: 11, fontWeight: '800', color: '#666', letterSpacing: 1 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
    studentName: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    metaLabel: { fontSize: 12, color: '#999', marginBottom: 2 },
    metaValue: { fontSize: 12, color: '#444', fontWeight: '500' },
    amount: { fontSize: 18, fontWeight: 'bold' },
    timeText: { fontSize: 11, color: '#AAA', fontStyle: 'italic', marginBottom: 15 },
    verifyBtn: {
        backgroundColor: '#2E7D32', flexDirection: 'row', justifyContent: 'center',
        alignItems: 'center', paddingVertical: 12, borderRadius: 10,
    },
    verifyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { textAlign: 'center', marginTop: 15, color: '#999', fontSize: 16 },
    footer: {
        backgroundColor: '#fff', padding: 15, flexDirection: 'row',
        alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee',
        paddingBottom: 25,
    },
    footerStat: { flex: 1, alignItems: 'center' },
    footerDivider: { width: 1, height: 30, backgroundColor: '#EEE' },
    footerLabel: { fontSize: 10, fontWeight: '800', color: '#999', letterSpacing: 1, marginBottom: 4 },
    footerAmount: { fontSize: 20, fontWeight: 'bold' },
});
