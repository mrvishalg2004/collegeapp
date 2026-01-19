import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { IRegistration, IUser, IEvent } from '../types';
// Assuming we might need a dedicated PaymentService, but direct api call for verify is fine for now

export default function VerifyPayments() {
    const [registrations, setRegistrations] = useState<IRegistration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            // Fetch real pending payments
            // Since we don't have a specific endpoint, we'll fetch all registrations
            // and filter client-side, OR ideally update backend.
            // Let's use the 'getRegistrations' service and filter.
            // But wait, user wants REAL data, so I should ensure the backend provides it.
            // I'll call a new service method that I will implement.
            // For now, let's assume we fetch all for this college's events.
            // That's complex. Let's try to hit an endpoint that returns all registrations
            // and we filter by 'paymentStatus === "pending" && paymentMode === "offline"'

            // Actually, I can add a route to backend easily.
            // Let's assume the route `/api/payments/pending` exists (I will create it).
            const response = await api.get('/payments/pending');
            setRegistrations(response.data as IRegistration[]);
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
            Alert.alert("Error", "Failed to fetch pending payments");
        }
    };

    const handleConfirm = async (id: string) => {
        try {
            await api.post(`/payments/confirm-offline/${id}`);
            Alert.alert("Confirmed", "Payment marked as collected");
            // remove from list
            setRegistrations(prev => prev.filter((r: any) => r._id !== id));
        } catch (e) {
            Alert.alert("Error", "Failed to confirm");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Verify Offline Payments</Text>

            {loading ? <ActivityIndicator /> : (
                <FlatList
                    data={registrations}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }: { item: any }) => (
                        <View style={styles.card}>
                            <View>
                                <Text style={styles.uName}>{item.studentId.name}</Text>
                                <Text style={styles.eName}>{item.eventId.name}</Text>
                                <Text style={styles.amount}>₹{item.amount} (Cash)</Text>
                            </View>
                            <TouchableOpacity style={styles.btn} onPress={() => handleConfirm(item._id)}>
                                <Text style={styles.btnText}>Verify</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={<Text>No pending payments</Text>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    uName: { fontSize: 16, fontWeight: 'bold' },
    eName: { color: '#666' },
    amount: { color: '#4CAF50', fontWeight: 'bold', marginTop: 5 },
    btn: { backgroundColor: '#4CAF50', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20 },
    btnText: { color: '#fff', fontWeight: 'bold' }
});
