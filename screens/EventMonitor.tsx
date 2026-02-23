import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventService } from '../services/event.service';
import { CollegeService } from '../services/college.service';
import { AuthService } from '../services/auth.service';
import { IEvent, IDepartment, ICollege } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker'; // Ensure this is installed/available, or copy logic
import { Modal, ScrollView, Platform } from 'react-native';

export default function EventMonitor() {
    const navigation = useNavigation<any>();
    const [events, setEvents] = useState<IEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Event Form State
    const [modalVisible, setModalVisible] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [fee, setFee] = useState('');
    const [venue, setVenue] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('100');
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedCoordinators, setSelectedCoordinators] = useState<string[]>([]);

    const [departments, setDepartments] = useState<IDepartment[]>([]);
    const [availableCoordinators, setAvailableCoordinators] = useState<any[]>([]);
    const [colleges, setColleges] = useState<ICollege[]>([]);
    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const user = await AuthService.getCurrentUser();
            setIsSuperAdmin(!user.collegeId);

            if (user.collegeId) {
                // College Admin
                setSelectedCollegeId(user.collegeId);
                fetchCollegeData(user.collegeId);
                const data = await EventService.getEvents({ collegeId: user.collegeId });
                setEvents(data as IEvent[]);
            } else {
                // Super Admin
                const allColleges = await CollegeService.getColleges();
                setColleges(allColleges as ICollege[]);
                const data = await EventService.getEvents();
                setEvents(data as IEvent[]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollegeData = async (cId: string) => {
        const depts = await CollegeService.getDepartments(cId);
        setDepartments(depts);
        try {
            const coords = await CollegeService.getCoordinators();
            setAvailableCoordinators(coords);
        } catch (e) { console.log("Coordinator fetch skipped/failed"); }
    };

    const handleCreate = async () => {
        try {
            if (!selectedCollegeId) {
                Alert.alert("Error", "Please select a college");
                return;
            }
            await EventService.createEvent({
                name,
                description,
                date,
                venue,
                fee: Number(fee),
                maxParticipants: Number(maxParticipants),
                departmentId: selectedDept || null,
                coordinators: selectedCoordinators,
                collegeId: selectedCollegeId
            });
            setModalVisible(false);
            // Reset
            setName(''); setDescription(''); setFee(''); setVenue(''); setMaxParticipants('100'); setSelectedCoordinators([]);
            loadData();
            Alert.alert("Success", "Event Created");
        } catch (e: any) {
            Alert.alert("Error", e.response?.data?.message || "Failed to create event");
        }
    };

    const toggleCoordinator = (id: string) => {
        if (selectedCoordinators.includes(id)) {
            setSelectedCoordinators(prev => prev.filter(c => c !== id));
        } else {
            setSelectedCoordinators(prev => [...prev, id]);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) setDate(selectedDate);
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

    const confirmComplete = (id: string) => {
        Alert.alert(
            "Complete Event",
            "Mark this event as completed? It will be closed for all users.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Complete",
                    onPress: async () => {
                        try {
                            await EventService.completeEvent(id);
                            loadData();
                            Alert.alert("Success", "Event marked as completed");
                        } catch (e: any) {
                            Alert.alert("Error", e.response?.data?.message || "Failed to update");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: IEvent }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: item.completed ? '#37474F' : '#004D40' }]}>
                    <View style={[styles.badgeDot, { backgroundColor: item.completed ? '#B0BEC5' : '#00E676' }]} />
                    <Text style={[styles.badgeText, { color: item.completed ? '#B0BEC5' : '#00E676' }]}>
                        {item.completed ? 'COMPLETED' : 'ACTIVE'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.eventName}>{item.name}</Text>

                <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={14} color="#78909C" style={{ marginRight: 6 }} />
                    <Text style={styles.details}>{new Date(item.date).toDateString()}</Text>
                </View>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={14} color="#78909C" style={{ marginRight: 6 }} />
                    <Text style={styles.details}>{item.venue}</Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                {!item.completed && (
                    <TouchableOpacity onPress={() => confirmComplete(item._id)} style={styles.completeBtn}>
                        <Ionicons name="checkmark" size={20} color="#fff" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => confirmDelete(item._id)} style={styles.deleteBtn}>
                    <Ionicons name="trash" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

    const toggleSearch = () => {
        setSearchVisible(!searchVisible);
        if (searchVisible) setSearchQuery(''); // Clear on close
    };

    const showFilterOptions = () => {
        Alert.alert('Filter Events', 'Choose status to display', [
            { text: 'All', onPress: () => setFilterStatus('all') },
            { text: 'Active', onPress: () => setFilterStatus('active') },
            { text: 'Completed', onPress: () => setFilterStatus('completed') },
            { text: 'Cancel', style: 'cancel' }
        ]);
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.venue.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterStatus === 'all') return matchesSearch;
        if (filterStatus === 'active') return matchesSearch && !event.completed;
        if (filterStatus === 'completed') return matchesSearch && event.completed;
        return matchesSearch;
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            {/* Dark Header */}
            <View style={styles.header}>
                {!searchVisible ? (
                    <>
                        <View style={styles.logoBox}>
                            <Ionicons name="layers" size={24} color="#00E676" />
                        </View>
                        <Text style={styles.headerTitle}>Event Monitor</Text>
                    </>
                ) : (
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search events..."
                        placeholderTextColor="#90A4AE"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                )}

                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.iconBtn} onPress={toggleSearch}>
                        <Ionicons name={searchVisible ? "close" : "search"} size={20} color="#CFD8DC" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={showFilterOptions}>
                        <Ionicons name={filterStatus === 'all' ? "options" : "filter"} size={20} color={filterStatus === 'all' ? "#CFD8DC" : "#00E676"} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Status Indicator */}
            {filterStatus !== 'all' && (
                <View style={styles.filterBadgeContainer}>
                    <Text style={styles.filterBadgeText}>Filter: {filterStatus.toUpperCase()}</Text>
                    <TouchableOpacity onPress={() => setFilterStatus('all')}>
                        <Ionicons name="close-circle" size={16} color="#00E676" />
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} color="#00E676" />
            ) : (
                <FlatList
                    data={filteredEvents}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No events found</Text>}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Analytics FAB - Only for College Admins */}
            {!isSuperAdmin && (
                <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={32} color="#000" />
                </TouchableOpacity>
            )}

            <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create Event</Text>

                        {isSuperAdmin && (
                            <View style={{ marginBottom: 15 }}>
                                <Text style={styles.label}>Select College *</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                                    {colleges.map((c) => (
                                        <TouchableOpacity
                                            key={c._id}
                                            style={[styles.chip, selectedCollegeId === c._id && styles.selectedChip]}
                                            onPress={() => {
                                                setSelectedCollegeId(c._id);
                                                fetchCollegeData(c._id);
                                            }}
                                        >
                                            <Text style={{ color: selectedCollegeId === c._id ? '#fff' : '#000' }}>{c.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        <TextInput style={styles.input} placeholder="Event Name" value={name} onChangeText={setName} />
                        <TextInput style={[styles.input, { height: 60 }]} placeholder="Description" value={description} onChangeText={setDescription} multiline />
                        <TextInput style={styles.input} placeholder="Venue" value={venue} onChangeText={setVenue} />

                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                            <Text>{date.toDateString()}</Text>
                            <Ionicons name="calendar-outline" size={20} />
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />
                        )}

                        <TextInput style={styles.input} placeholder="Fee" keyboardType="numeric" value={fee} onChangeText={setFee} />
                        <TextInput style={styles.input} placeholder="Max Participants" keyboardType="numeric" value={maxParticipants} onChangeText={setMaxParticipants} />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 15 }}>
                                <Text style={{ color: 'red' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleCreate} style={{ backgroundColor: '#00E676', padding: 15, borderRadius: 10 }}>
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create Event</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Dark BG
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#121212',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        marginLeft: 15
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        paddingHorizontal: 10,
        backgroundColor: '#1E1E1E',
        borderRadius: 8,
        height: 40,
        marginRight: 10
    },
    filterBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 230, 118, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 10,
        marginTop: -10,
        borderWidth: 1,
        borderColor: 'rgba(0, 230, 118, 0.3)'
    },
    filterBadgeText: {
        color: '#00E676',
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 6
    },
    logoBox: {
        width: 40,
        height: 40,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconBtn: {
        width: 40,
        height: 40,
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10
    },
    list: {
        padding: 20,
        paddingBottom: 100
    },
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 20,
        padding: 20,
        marginBottom: 15,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#333',
        position: 'relative'
    },
    cardHeader: {
        marginBottom: 10
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row',
        alignItems: 'center'
    },
    badgeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    cardContent: {
        paddingRight: 0,
        marginTop: 10
    },
    eventName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4
    },
    details: {
        fontSize: 13,
        color: '#90A4AE',
    },
    deleteBtn: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#F44336',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#F44336',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        marginLeft: 10
    },
    completeBtn: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#00E676',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#00E676',
        shadowOpacity: 0.4,
        shadowRadius: 8
    },
    actionButtons: {
        position: 'absolute',
        right: 20,
        top: 20,
        flexDirection: 'row'
    },
    empty: {
        textAlign: 'center',
        color: '#546E7A',
        marginTop: 20,
    },

    fab: {
        position: 'absolute',
        bottom: 25,
        right: 25,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#00E676',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#00E676',
        shadowOpacity: 0.4,
        shadowRadius: 10
    },
    modalContent: { padding: 20 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15, backgroundColor: '#fff', color: '#000' },
    label: { marginBottom: 8, fontWeight: '600', color: '#333' },
    chip: { padding: 8, backgroundColor: '#eee', borderRadius: 20, marginRight: 8, marginBottom: 8 },
    selectedChip: { backgroundColor: '#2196F3' },
    dateButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15, backgroundColor: '#fff' }
});
