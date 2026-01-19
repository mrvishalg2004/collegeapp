import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EventService } from '../services/event.service';
import { CollegeService } from '../services/college.service';
import { AuthService } from '../services/auth.service';
import { IEvent, IDepartment } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ManageEvents({ navigation }: any) {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState(''); // Added description
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [fee, setFee] = useState('');
    const [venue, setVenue] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('100');
    const [selectedDept, setSelectedDept] = useState('');
    // const [coordId, setCoordId] = useState(''); // Deprecated
    const [selectedCoordinators, setSelectedCoordinators] = useState<string[]>([]);

    const [departments, setDepartments] = useState<IDepartment[]>([]);
    const [availableCoordinators, setAvailableCoordinators] = useState<any[]>([]); // New list
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const u = await AuthService.getCurrentUser();
        setUser(u);
        if (u?.collegeId) {
            const evs = await EventService.getEvents({ collegeId: u.collegeId });
            setEvents(evs as IEvent[]);
            const depts = await CollegeService.getDepartments(u.collegeId);
            setDepartments(depts);

            // Fetch Coordinators
            try {
                const coords = await CollegeService.getCoordinators();
                setAvailableCoordinators(coords);
            } catch (e) { console.error("Failed to fetch coords", e); }
        }
    };

    const handleCreate = async () => {
        try {
            await EventService.createEvent({
                name,
                description, // Pass description
                date: date,
                venue,
                fee: Number(fee),
                maxParticipants: Number(maxParticipants),
                departmentId: selectedDept || null,
                coordinators: selectedCoordinators // Send array
            });
            setModalVisible(false);
            // Reset
            setName(''); setDescription(''); setFee(''); setVenue(''); setMaxParticipants('100'); setSelectedCoordinators([]);
            loadData();
            Alert.alert("Success", "Event Created");
        } catch (e: any) {
            console.error("Event Create Error:", e);
            const errorMsg = e.response?.data?.message || e.message || "Failed to create event";
            Alert.alert("Error", errorMsg);
        }
    };

    // Toggle coordinator selection
    const toggleCoordinator = (id: string) => {
        if (selectedCoordinators.includes(id)) {
            setSelectedCoordinators(prev => prev.filter(c => c !== id));
        } else {
            setSelectedCoordinators(prev => [...prev, id]);
        }
    };

    const confirmDelete = (id: string) => {
        Alert.alert(
            "Delete Event",
            "Are you sure you want to delete this event? This cannot be undone.",
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

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const renderEventItem = ({ item }: { item: IEvent }) => (
        <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.eventName}>{item.name}</Text>
                    <Text>{new Date(item.date).toDateString()}</Text>
                    <Text>Fee: ₹{item.fee}</Text>
                    <Text style={styles.subtitle}>{item.venue}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => navigation.navigate('EventRegistrations', { eventId: item._id, eventName: item.name })} style={{ padding: 10 }}>
                        <Ionicons name="people-outline" size={24} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDelete(item._id)} style={{ padding: 10 }}>
                        <Ionicons name="trash-outline" size={24} color="#F44336" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Manage Events</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={events}
                keyExtractor={item => item._id}
                renderItem={renderEventItem}
                style={styles.list}
            />

            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create Event</Text>

                        <Text style={styles.label}>Basic Info</Text>
                        <TextInput style={styles.input} placeholder="Event Name" value={name} onChangeText={setName} />
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="Event Description (What's this event about?)"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                        <TextInput style={styles.input} placeholder="Venue" value={venue} onChangeText={setVenue} />

                        <Text style={styles.label}>Event Date</Text>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.dateText}>{date.toDateString()}</Text>
                            <Ionicons name="calendar-outline" size={20} color="#666" />
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                            />
                        )}

                        <Text style={styles.label}>Details</Text>
                        <TextInput style={styles.input} placeholder="Fee (0 for free)" keyboardType="numeric" value={fee} onChangeText={setFee} />
                        <TextInput style={styles.input} placeholder="Max Participants" keyboardType="numeric" value={maxParticipants} onChangeText={setMaxParticipants} />
                        <TextInput style={styles.input} placeholder="Max Participants" keyboardType="numeric" value={maxParticipants} onChangeText={setMaxParticipants} />

                        <Text style={styles.label}>Assign Coordinators:</Text>
                        <View style={styles.coordList}>
                            {availableCoordinators.length > 0 ? availableCoordinators.map((c: any) => (
                                <TouchableOpacity
                                    key={c._id}
                                    style={[styles.coordItem, selectedCoordinators.includes(c._id) && styles.selectedCoord]}
                                    onPress={() => toggleCoordinator(c._id)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons
                                            name={selectedCoordinators.includes(c._id) ? "checkbox" : "square-outline"}
                                            size={20}
                                            color={selectedCoordinators.includes(c._id) ? "#fff" : "#666"}
                                        />
                                        <Text style={[styles.coordName, selectedCoordinators.includes(c._id) && { color: '#fff' }]}>{c.name}</Text>
                                    </View>
                                </TouchableOpacity>
                            )) : (
                                <Text style={{ color: '#999', fontStyle: 'italic' }}>No coordinators found. Create them first.</Text>
                            )}
                        </View>

                        <Text style={styles.label}>Select Department (Optional):</Text>
                        <View style={styles.deptList}>
                            {departments.map((d: any) => (
                                <TouchableOpacity
                                    key={d._id}
                                    style={[styles.chip, selectedDept === d._id && styles.selectedChip]}
                                    onPress={() => setSelectedDept(d._id)}
                                >
                                    <Text style={{ color: selectedDept === d._id ? '#fff' : '#000' }}>{d.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
                            <Text style={styles.submitText}>Create Event</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </SafeAreaView>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold' },
    addButton: { backgroundColor: '#2196F3', padding: 10, borderRadius: 20 },
    list: { padding: 20 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2 },
    eventName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    subtitle: { color: '#666', marginTop: 5 },
    modalContent: { padding: 20 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15, backgroundColor: '#fff' },
    dateButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15, backgroundColor: '#fff' },
    dateText: { fontSize: 16 },
    label: { marginBottom: 8, fontWeight: '600', color: '#333' },
    deptList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
    chip: { padding: 8, backgroundColor: '#eee', borderRadius: 20, marginRight: 8, marginBottom: 8 },
    selectedChip: { backgroundColor: '#2196F3' },

    coordList: { marginBottom: 20, maxHeight: 150 }, // Allow scrolling if needed but FlatList inside ScrollView warns
    coordItem: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 5 },
    selectedCoord: { backgroundColor: '#4CAF50' },
    coordName: { marginLeft: 10, fontSize: 16 },

    submitBtn: { backgroundColor: '#2196F3', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
    submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    closeBtn: { padding: 15, alignItems: 'center' }
});
