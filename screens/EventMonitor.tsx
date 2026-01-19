import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventService } from '../services/event.service';
import { IEvent } from '../types';
import { Ionicons } from '@expo/vector-icons';

export default function EventMonitor() {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await EventService.getEvents();
            setEvents(data as IEvent[]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id: string) => {
        Alert.alert(
            "Delete Event",
            "Are you sure you want to delete this event?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await EventService.deleteEvent(id);
                            loadData(); // Refresh list
                            Alert.alert("Success", "Event deleted");
                        } catch (e: any) {
                            Alert.alert("Error", e.response?.data?.message || "Failed to delete");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: IEvent }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                        <Text style={styles.eventName}>{item.name}</Text>
                        <Text style={styles.status}>{item.completed ? 'Completed' : 'Active'}</Text>
                    </View>
                    <Text style={styles.details}>Date: {new Date(item.date).toDateString()}</Text>
                    <Text style={styles.details}>Venue: {item.venue}</Text>
                </View>
                <TouchableOpacity onPress={() => confirmDelete(item._id)} style={{ padding: 10 }}>
                    <Ionicons name="trash-outline" size={24} color="#F44336" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>All Events</Text>
            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={events}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No events found</Text>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    status: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    details: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
        fontStyle: 'italic',
    },
    empty: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
    }
});
