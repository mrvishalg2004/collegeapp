import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { EventService } from '../services/event.service';
import { Ionicons } from '@expo/vector-icons';
import { IEvent } from '../types';

export default function StudentDashboard() {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation<any>();

    const [filteredEvents, setFilteredEvents] = useState<IEvent[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [selectedDept, setSelectedDept] = useState('All');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await EventService.getEvents();
            const allEvents = data as IEvent[];
            setEvents(allEvents);
            setFilteredEvents(allEvents);

            // Extract unique departments from events
            const uniqueDeptsMap = new Map();
            allEvents.forEach(e => {
                if (e.departmentId && typeof e.departmentId === 'object') {
                    uniqueDeptsMap.set(e.departmentId._id, e.departmentId.name);
                }
            });

            const deptList = Array.from(uniqueDeptsMap, ([_id, name]) => ({ _id, name }));
            setDepartments([{ _id: 'All', name: 'All Departments' }, ...deptList]);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filterByDept = (deptId: string) => {
        setSelectedDept(deptId);
        if (deptId === 'All') {
            setFilteredEvents(events);
        } else {
            setFilteredEvents(events.filter(e =>
                (e.departmentId && typeof e.departmentId === 'object' && e.departmentId._id === deptId)
            ));
        }
    };

    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Student Dashboard</Text>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => navigation.navigate('MyCertificates')} style={{ marginRight: 15 }}>
                        <Ionicons name="ribbon-outline" size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')} style={{ marginRight: 15 }}>
                        <Ionicons name="person-circle-outline" size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <View>
                <Text style={styles.subtitle}>Unified Events</Text>
                {/* Department Filter Chips */}
                <FlatList
                    horizontal
                    data={departments}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item._id}
                    style={{ marginBottom: 15, maxHeight: 50 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.chip,
                                selectedDept === item._id && styles.selectedChip
                            ]}
                            onPress={() => filterByDept(item._id)}
                        >
                            <Text style={[
                                styles.chipText,
                                selectedDept === item._id && styles.selectedChipText
                            ]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {loading ? <ActivityIndicator /> : (
                <FlatList
                    data={filteredEvents}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }: { item: any }) => ( // Using any here because departmentId can be string or object
                        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EventDetails', { event: item })}>
                            <Text style={styles.eventName}>{item.name}</Text>
                            <Text style={styles.dept}>{item.departmentId?.name || 'Open Event'}</Text>
                            <View style={styles.row}>
                                <Text style={styles.date}>{new Date(item.date).toDateString()}</Text>
                                <Text style={styles.fee}>{item.fee > 0 ? `₹${item.fee}` : 'Free'}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No events available</Text>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    actions: { flexDirection: 'row', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold' },
    subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#555' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
    eventName: { fontSize: 18, fontWeight: 'bold' },
    dept: { fontSize: 14, color: '#666', marginBottom: 5 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
    date: { color: '#888' },
    fee: { fontWeight: 'bold', color: '#4CAF50' },
    empty: { textAlign: 'center', marginTop: 20, color: '#999' },

    // Filter Styles
    chip: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 20,
        marginRight: 10,
        height: 35,
        justifyContent: 'center'
    },
    selectedChip: {
        backgroundColor: '#2196F3',
    },
    chipText: {
        fontSize: 13,
        color: '#333'
    },
    selectedChipText: {
        color: '#fff',
        fontWeight: 'bold'
    }
});
