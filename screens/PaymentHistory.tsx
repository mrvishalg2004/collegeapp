import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaymentService } from '../services/payment.service';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentHistory() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await PaymentService.getPaymentHistory();
            setPayments(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.studentName}>{item.studentId?.name || 'Unknown User'}</Text>
                <Text style={styles.amount}>+ ₹{item.eventId?.fee}</Text>
            </View>
            <Text style={styles.email}>{item.studentId?.email}</Text>
            <Text style={styles.eventName}>{item.eventId?.name}</Text>

            <View style={styles.footer}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.paymentMethod.toUpperCase()}</Text>
                </View>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            {item.razorpayOrderId && (
                <Text style={styles.orderId}>Order ID: {item.razorpayOrderId}</Text>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Payment History</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#2196F3" />
            ) : (
                <FlatList
                    data={payments}
                    keyExtractor={(item: any) => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No payment records found.</Text>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    title: { fontSize: 24, fontWeight: 'bold', padding: 20, backgroundColor: '#fff' },
    list: { padding: 15 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    studentName: { fontSize: 16, fontWeight: 'bold' },
    amount: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
    email: { color: '#666', marginBottom: 5 },
    eventName: { fontSize: 14, fontStyle: 'italic', marginBottom: 10 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    badge: { backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
    badgeText: { fontSize: 12, color: '#2196F3', fontWeight: 'bold' },
    date: { color: '#999', fontSize: 12 },
    orderId: { fontSize: 10, color: '#bbb', marginTop: 5 },
    empty: { textAlign: 'center', marginTop: 50, color: '#666' }
});
