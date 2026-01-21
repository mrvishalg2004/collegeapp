import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { CertificateService } from '../services/certificate.service';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

export default function EventRegistrations() {
    const route = useRoute<any>();
    const { eventId, eventName } = route.params;

    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/events/${eventId}/registrations`);
            setRegistrations(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch registrations");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCertificate = async (registrationId: string) => {
        try {
            await CertificateService.generateCertificate(registrationId);
            Alert.alert("Success", "Certificate Generated!");
            fetchRegistrations(); // Refresh to update status if needed
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to generate");
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View>
                <Text style={styles.name}>{item.studentId?.name || 'Unknown'}</Text>
                <Text style={styles.email}>{item.studentId?.email}</Text>
                <Text style={[styles.status, { color: item.paymentStatus === 'paid' ? 'green' : 'orange' }]}>
                    Payment: {item.paymentStatus.toUpperCase()}
                </Text>
                <Text style={[styles.status, { color: item.attendance ? '#1A237E' : '#999' }]}>
                    Attendance: {item.attendance ? "MARKED" : "NOT MARKED"}
                </Text>
            </View>

            {item.paymentStatus === 'paid' && (
                <TouchableOpacity
                    style={[styles.btn, item.certificateGenerated ? styles.btnDisabled : styles.btnActive]}
                    onPress={() => !item.certificateGenerated && handleGenerateCertificate(item._id)}
                    disabled={item.certificateGenerated}
                >
                    <Ionicons name="ribbon-outline" size={20} color="#fff" />
                    <Text style={styles.btnText}>
                        {item.certificateGenerated ? "Generated" : "Certificate"}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Registrations: {eventName}</Text>
            {loading ? <ActivityIndicator style={{ marginTop: 20 }} /> : (
                <FlatList
                    data={registrations}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No registrations found</Text>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    list: { paddingBottom: 20 },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2
    },
    name: { fontSize: 16, fontWeight: 'bold' },
    email: { fontSize: 13, color: '#666' },
    status: { fontSize: 12, fontWeight: 'bold', marginTop: 4 },
    empty: { textAlign: 'center', color: '#999', marginTop: 20 },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8
    },
    btnActive: { backgroundColor: '#2196F3' },
    btnDisabled: { backgroundColor: '#B0BEC5' },
    btnText: { color: '#fff', fontSize: 12, marginLeft: 5, fontWeight: 'bold' }
});
