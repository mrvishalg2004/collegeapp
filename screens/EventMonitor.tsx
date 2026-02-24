import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput, Dimensions, Modal, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EventService } from '../services/event.service';
import { CollegeService } from '../services/college.service';
import { AuthService } from '../services/auth.service';
import { IEvent, IDepartment, ICollege } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

export default function EventMonitor() {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [loading, setLoading] = useState(true);

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

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const user = await AuthService.getCurrentUser();
            setIsSuperAdmin(!user.collegeId);

            if (user.collegeId) {
                setSelectedCollegeId(user.collegeId);
                fetchCollegeData(user.collegeId);
                const data = await EventService.getEvents({ collegeId: user.collegeId });
                setEvents(data as IEvent[]);
            } else {
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
        try {
            const depts = await CollegeService.getDepartments(cId);
            setDepartments(depts as IDepartment[]);
            const coords = await CollegeService.getCoordinators();
            setAvailableCoordinators(coords as any[]);
        } catch (e) {
            console.log("Secondary data fetch error");
        }
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
            setName(''); setDescription(''); setFee(''); setVenue(''); setMaxParticipants('100'); setSelectedCoordinators([]);
            loadData();
            Alert.alert("Success", "Mission Commenced: Event Created");
        } catch (e: any) {
            Alert.alert("Error", e.response?.data?.message || "Deployment failed");
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) setDate(selectedDate);
    };

    const confirmDelete = (id: string) => {
        Alert.alert("Terminate Event", "Are you sure you want to cease this operation?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Terminate", style: "destructive", onPress: async () => {
                    await EventService.deleteEvent(id);
                    loadData();
                }
            }
        ]);
    };

    const confirmComplete = (id: string) => {
        Alert.alert("Conclude Operation", "Mark this event as fulfilled?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Conclude", onPress: async () => {
                    await EventService.completeEvent(id);
                    loadData();
                }
            }
        ]);
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.venue.toLowerCase().includes(searchQuery.toLowerCase());
        if (filterStatus === 'all') return matchesSearch;
        return matchesSearch && (filterStatus === 'active' ? !event.completed : event.completed);
    });

    const renderItem = ({ item }: { item: IEvent }) => (
        <View style={styles.neoFeedItem}>
            <View style={styles.timelineContainer}>
                <View style={[styles.timelineDot, { backgroundColor: item.completed ? 'rgba(255,255,255,0.2)' : '#06B6D4' }]} />
                <View style={styles.timelineLine} />
            </View>

            <View style={styles.cardContainer}>
                <LinearGradient
                    colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                    style={styles.cardInner}
                >
                    <View style={styles.cardHeader}>
                        <View style={[styles.neoStatus, { borderColor: item.completed ? 'rgba(255,255,255,0.1)' : '#06B6D420' }]}>
                            <View style={[styles.glowDot, { backgroundColor: item.completed ? '#64748b' : '#06B6D4', shadowColor: item.completed ? 'transparent' : '#06B6D4' }]} />
                            <Text style={[styles.statusText, { color: item.completed ? 'rgba(255,255,255,0.4)' : '#06B6D4' }]}>
                                {item.completed ? 'ARCHIVED' : 'LIVE'}
                            </Text>
                        </View>
                        <Text style={styles.timeTag}>{new Date(item.date).toLocaleDateString()}</Text>
                    </View>

                    <Text style={styles.eventName}>{item.name}</Text>

                    <View style={styles.metaInfo}>
                        <View style={styles.metaRow}>
                            <Ionicons name="location" size={12} color="rgba(255,255,255,0.4)" />
                            <Text style={styles.metaValue}>{item.venue}</Text>
                        </View>
                        <View style={styles.metaRow}>
                            <Ionicons name="people" size={12} color="rgba(255,255,255,0.4)" />
                            <Text style={styles.metaValue}>{item.maxParticipants} slots</Text>
                        </View>
                    </View>

                    <View style={styles.actionRow}>
                        {!item.completed && (
                            <TouchableOpacity onPress={() => confirmComplete(item._id)} style={styles.completeBtn}>
                                <Ionicons name="checkmark-done" size={20} color="#10B981" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => confirmDelete(item._id)} style={styles.deleteBtn}>
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />
            <View style={styles.meshContainer}>
                <LinearGradient colors={['#A855F7', 'transparent']} style={[styles.orb, styles.orb1]} />
                <LinearGradient colors={['#F59E0B', 'transparent']} style={[styles.orb, styles.orb2]} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brandSubtitle}>SYSTEM FEED</Text>
                        <Text style={styles.brandTitle}>EVENT MONITOR</Text>
                    </View>
                    <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterStatus(filterStatus === 'all' ? 'active' : filterStatus === 'active' ? 'completed' : 'all')}>
                        <Ionicons name="filter" size={20} color={filterStatus === 'all' ? '#fff' : '#A855F7'} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color="rgba(255,255,255,0.3)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Intercepting events..."
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                    )}
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color="#A855F7" size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={filteredEvents}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={<Text style={styles.emptyText}>Feed is clear. No active events.</Text>}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {!isSuperAdmin && (
                    <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                        <LinearGradient colors={['#06B6D4', '#0891B2']} style={styles.fabInner}>
                            <Ionicons name="add" size={32} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                <Modal visible={modalVisible} animationType="fade" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>COMMENCE EVENT</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={styles.inputLabel}>Event Designation</Text>
                                <TextInput style={styles.neoInput} placeholder="e.g. Code Hackathon 2.0" placeholderTextColor="rgba(255,255,255,0.2)" value={name} onChangeText={setName} />

                                <Text style={styles.inputLabel}>Objective Details</Text>
                                <TextInput style={[styles.neoInput, { height: 100 }]} placeholder="Enter mission scope..." placeholderTextColor="rgba(255,255,255,0.2)" value={description} onChangeText={setDescription} multiline />

                                <View style={styles.row}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>Venue</Text>
                                        <TextInput style={styles.neoInput} placeholder="Hall 4" placeholderTextColor="rgba(255,255,255,0.2)" value={venue} onChangeText={setVenue} />
                                    </View>
                                    <View style={{ width: 15 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>Entry Fee</Text>
                                        <TextInput style={styles.neoInput} keyboardType="numeric" value={fee} onChangeText={setFee} />
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
                                    <Ionicons name="calendar-outline" size={20} color="#06B6D4" />
                                    <Text style={styles.dateText}>{date.toDateString().toUpperCase()}</Text>
                                </TouchableOpacity>

                                {showDatePicker && (
                                    <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />
                                )}

                                <TouchableOpacity style={styles.launchBtn} onPress={handleCreate}>
                                    <LinearGradient colors={['#06B6D4', '#0891B2']} style={styles.launchBtnInner}>
                                        <Text style={styles.launchText}>AUTHORIZE DEPLOYMENT</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </ScrollView>
                        </LinearGradient>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#020617' },
    meshContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    orb: { position: 'absolute', width: width, height: width, borderRadius: width / 2, opacity: 0.1 },
    orb1: { top: -100, right: -100 },
    orb2: { bottom: -100, left: -100 },
    safeArea: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 25, paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    brandSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 'bold', letterSpacing: 3 },
    brandTitle: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    filterBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 25, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    searchInput: { flex: 1, color: '#fff', fontSize: 16, marginLeft: 12 },
    list: { paddingLeft: 25, paddingRight: 25, paddingBottom: 100 },
    neoFeedItem: { flexDirection: 'row', marginBottom: 25 },
    timelineContainer: { alignItems: 'center', width: 20, marginRight: 15 },
    timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 10, zIndex: 2 },
    timelineLine: { position: 'absolute', top: 20, bottom: -30, width: 2, backgroundColor: 'rgba(255,255,255,0.05)' },
    cardContainer: { flex: 1, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    cardInner: { padding: 20 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    neoStatus: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
    glowDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8, shadowRadius: 6, shadowOpacity: 1 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    timeTag: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 'bold' },
    eventName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    metaInfo: { flexDirection: 'row', gap: 15 },
    metaRow: { flexDirection: 'row', alignItems: 'center' },
    metaValue: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginLeft: 6 },
    actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 15 },
    completeBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' },
    deleteBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center' },
    fab: { position: 'absolute', bottom: 40, right: 25, borderRadius: 33, elevation: 20, shadowColor: '#06B6D4', shadowOpacity: 0.5, shadowRadius: 15 },
    fabInner: { width: 66, height: 66, borderRadius: 33, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 40, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 32, padding: 30, borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.2)' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
    closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    inputLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
    neoInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
    row: { flexDirection: 'row' },
    dateSelector: { flexDirection: 'row', alignItems: 'center', padding: 18, backgroundColor: 'rgba(6, 182, 212, 0.05)', borderRadius: 18, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.2)' },
    dateText: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginLeft: 12, letterSpacing: 1 },
    launchBtn: { marginBottom: 10 },
    launchBtnInner: { padding: 20, borderRadius: 20, alignItems: 'center' },
    launchText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 2 }
});
