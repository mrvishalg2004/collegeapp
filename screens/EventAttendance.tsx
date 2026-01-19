import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RegistrationService } from '../services/registration.service';
import { useRoute } from '@react-navigation/native';
import api from '../services/api';
import { IRegistration, IUser } from '../types';

export default function EventAttendance() {
    const route = useRoute<any>();
    const { eventId, eventName } = route.params;
    const [registrations, setRegistrations] = useState<IRegistration[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Assuming endpoint: GET /api/registrations/event/:eventId
            // Or similar. Let's check RegistrationService.
            // If not exists, I'll use api directly: api.get(\`/events/${eventId}/registrations\`)
            const res = await api.get(`/events/${eventId}/registrations`);
            setRegistrations(res.data);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not fetch registrations");
        }
    };

    const toggleAttendance = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        setRegistrations(prev => prev.map((r: any) => r._id === id ? { ...r, attendance: !currentStatus } : r));
        try {
            await api.put(`/registrations/${id}/attendance`, { status: !currentStatus });
        } catch (e) {
            Alert.alert("Error", "Failed to update");
            // Revert
            setRegistrations(prev => prev.map((r: any) => r._id === id ? { ...r, attendance: currentStatus } : r));
        }
    };

    const markCompleted = async () => {
        try {
            await api.put(`/events/${eventId}/complete`);
            Alert.alert("Success", "Event marked as completed. Certificates will be generated.");
        } catch (e) {
            Alert.alert("Error", "Failed to mark complete");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>{eventName}</Text>
            <Text style={styles.subtitle}>Mark Attendance</Text>

            <FlatList
                data={registrations}
                keyExtractor={item => item._id}
                renderItem={({ item }: { item: any }) => (
                    <View style={styles.row}>
                        <Text style={styles.name}>{item.studentId.name}</Text>
                        <Switch
                            value={item.attendance}
                            onValueChange={() => toggleAttendance(item._id, item.attendance)}
                        />
                    </View>
                )}
            />

            <TouchableOpacity style={styles.completeBtn} onPress={markCompleted}>
                <Text style={styles.completeText}>Mark Event Completed</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 },
    name: { fontSize: 16, fontWeight: '500' },
    completeBtn: { backgroundColor: '#FF5722', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
    completeText: { color: '#fff', fontWeight: 'bold' }
});
