import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { EventService } from '../services/event.service';
import { Ionicons } from '@expo/vector-icons';
import { IEvent } from '../types';

export default function CoordDashboard() {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await EventService.getMyAssignments();
            setEvents(data as IEvent[]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Coordinator Dashboard</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>My Events</Text>

            {loading ? <ActivityIndicator /> : (
                <FlatList
                    data={events}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }: { item: IEvent }) => (
                        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EventAttendance', { eventId: item._id, eventName: item.name })}>
                            <Text style={styles.eventName}>{item.name}</Text>
                            <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
                            <Text style={styles.status}>{item.completed ? 'Completed' : 'Active'}</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No assignments found</Text>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 22, fontWeight: 'bold' },
    subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#555' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
    eventName: { fontSize: 18, fontWeight: 'bold' },
    date: { color: '#666', marginTop: 5 },
    status: { marginTop: 5, color: 'blue', fontWeight: 'bold' },
    empty: { textAlign: 'center', marginTop: 20, color: '#999' }
});
