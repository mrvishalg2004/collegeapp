import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { PaymentService } from '../services/payment.service';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function PaymentHistory() {
    const [payments, setPayments] = useState<any[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const loadHistory = async () => {
        try {
            const data = await PaymentService.getPaymentHistory();
            setPayments(data);
            setFilteredPayments(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadHistory();
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredPayments(payments);
        } else {
            const filtered = payments.filter(p =>
                p.studentId?.name.toLowerCase().includes(text.toLowerCase()) ||
                p.eventId?.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredPayments(filtered);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardAccent} />
            <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                    <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{item.studentId?.name || 'Unknown User'}</Text>
                        <Text style={styles.email}>{item.studentId?.email}</Text>
                    </View>
                    <View style={styles.amountContainer}>
                        <Text style={styles.amount}>+ ₹{item.eventId?.fee || item.amount}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
                            <Text style={[styles.statusText, { color: '#2E7D32' }]}>PAID</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.eventInfo}>
                    <Ionicons name="calendar-outline" size={14} color="#666" style={{ marginRight: 6 }} />
                    <Text style={styles.eventName}>{item.eventId?.name}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.methodBadge}>
                        <Ionicons name={item.paymentMethod === 'online' ? "globe-outline" : "hand-left-outline"} size={12} color="#1565C0" />
                        <Text style={styles.methodText}>{item.paymentMethod.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.date}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </Text>
                </View>

                {item.razorpayOrderId && (
                    <View style={styles.orderContainer}>
                        <Text style={styles.orderIdLabel}>Order ID:</Text>
                        <Text style={styles.orderIdText}>{item.razorpayOrderId}</Text>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#1A237E', '#283593']} style={styles.headerGradient}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerTitleRow}>
                        <Text style={styles.headerTitle}>Finance History</Text>
                        <View style={styles.historyIcon}>
                            <Ionicons name="receipt" size={20} color="#FFF" />
                        </View>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" style={{ marginLeft: 15 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Find student or event..."
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => handleSearch('')} style={{ marginRight: 10 }}>
                                <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
                            </TouchableOpacity>
                        )}
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <View style={styles.body}>
                {loading && !refreshing ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="large" color="#1A237E" />
                        <Text style={styles.loaderText}>Fetching records...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredPayments}
                        keyExtractor={(item: any) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.list}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A237E" />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="document-text-outline" size={60} color="#DDD" />
                                <Text style={styles.empty}>No payment records found.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FA' },
    headerGradient: {
        paddingBottom: 25,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        marginTop: 10,
        marginBottom: 20
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
    historyIcon: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 25,
        borderRadius: 15,
        height: 45
    },
    searchInput: {
        flex: 1,
        color: '#FFF',
        paddingHorizontal: 10,
        fontSize: 15
    },
    body: { flex: 1, marginTop: 10 },
    list: { padding: 20, paddingBottom: 50 },

    // Card
    card: {
        backgroundColor: '#FFF',
        borderRadius: 18,
        marginBottom: 15,
        flexDirection: 'row',
        overflow: 'hidden',
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8
    },
    cardAccent: { width: 5, backgroundColor: '#4CAF50' },
    cardContent: { flex: 1, padding: 18 },

    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    studentInfo: { flex: 1, marginRight: 10 },
    studentName: { fontSize: 17, fontWeight: '700', color: '#333' },
    email: { color: '#888', fontSize: 13, marginTop: 2 },

    amountContainer: { alignItems: 'flex-end' },
    amount: { fontSize: 18, fontWeight: '800', color: '#2E7D32' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 5 },
    statusText: { fontSize: 10, fontWeight: 'bold' },

    eventInfo: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F8F9FA', padding: 10, borderRadius: 10,
        marginTop: 12
    },
    eventName: { fontSize: 14, color: '#555', fontWeight: '500' },

    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
    methodBadge: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8
    },
    methodText: { fontSize: 11, color: '#1565C0', fontWeight: 'bold', marginLeft: 5 },
    date: { color: '#999', fontSize: 11, fontWeight: '500' },

    orderContainer: {
        flexDirection: 'row', alignItems: 'center',
        marginTop: 10, paddingTop: 10,
        borderTopWidth: 1, borderTopColor: '#F0F0F0'
    },
    orderIdLabel: { fontSize: 10, color: '#AAA', marginRight: 5 },
    orderIdText: { fontSize: 10, color: '#777', fontWeight: '500' },

    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loaderText: { marginTop: 10, color: '#666' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    empty: { textAlign: 'center', marginTop: 20, color: '#CCC', fontSize: 16 }
});
