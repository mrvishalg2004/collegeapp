import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ScrollView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EventService } from '../services/event.service';
import { CollegeService } from '../services/college.service';
import { AuthService } from '../services/auth.service';
import { IEvent, IDepartment, ICollege } from '../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function ManageEvents({ navigation }: any) {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form State
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
    const [user, setUser] = useState<any>(null);
    const [colleges, setColleges] = useState<ICollege[]>([]);
    const [selectedCollegeId, setSelectedCollegeId] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const u = await AuthService.getCurrentUser();
            setUser(u);
            if (u?.collegeId) {
                setSelectedCollegeId(u.collegeId);
                fetchCollegeData(u.collegeId);
                const evs = await EventService.getEvents({ collegeId: u.collegeId });
                setEvents(evs as IEvent[]);
            } else {
                const allColleges = await CollegeService.getColleges();
                setColleges(allColleges as ICollege[]);
                const evs = await EventService.getEvents();
                setEvents(evs as IEvent[]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollegeData = async (cId: string) => {
        try {
            const depts = await CollegeService.getDepartments(cId);
            setDepartments(depts);
            const coords = await CollegeService.getCoordinators();
            setAvailableCoordinators(coords);
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
                date: date,
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

    const toggleCoordinator = (id: string) => {
        if (selectedCoordinators.includes(id)) {
            setSelectedCoordinators(prev => prev.filter(c => c !== id));
        } else {
            setSelectedCoordinators(prev => [...prev, id]);
        }
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

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) setDate(selectedDate);
    };

    const renderEventItem = ({ item }: { item: IEvent }) => (
        <View style={styles.neoCard}>
            <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                style={styles.cardInner}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.eventInfo}>
                        <Text style={styles.eventName}>{item.name}</Text>
                        <View style={styles.tagRow}>
                            <View style={[styles.statusTag, { backgroundColor: item.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(6, 182, 212, 0.1)' }]}>
                                <Text style={[styles.statusText, { color: item.completed ? '#10B981' : '#06B6D4' }]}>
                                    {item.completed ? 'COMPLETED' : 'ONGOING'}
                                </Text>
                            </View>
                            <Text style={styles.venueText}>{item.venue}</Text>
                        </View>
                    </View>
                    <View style={styles.actionColumn}>
                        {!item.completed && (
                            <TouchableOpacity onPress={() => confirmComplete(item._id)} style={styles.actionIconBtn}>
                                <Ionicons name="checkmark-done-circle" size={24} color="#10B981" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => navigation.navigate('EventRegistrations', { eventId: item._id, eventName: item.name })} style={styles.actionIconBtn}>
                            <Ionicons name="people" size={24} color="#A855F7" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => confirmDelete(item._id)} style={styles.actionIconBtn}>
                            <Ionicons name="trash" size={24} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.metaBox}>
                        <Ionicons name="calendar" size={12} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.metaText}>{new Date(item.date).toDateString()}</Text>
                    </View>
                    <View style={styles.metaBox}>
                        <Ionicons name="wallet" size={12} color="rgba(255,255,255,0.4)" />
                        <Text style={styles.metaText}>₹{item.fee}</Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />
            <View style={styles.meshContainer}>
                <LinearGradient colors={['#EC4899', 'transparent']} style={[styles.orb, styles.orb1]} />
                <LinearGradient colors={['#3B82F6', 'transparent']} style={[styles.orb, styles.orb2]} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.brandSubtitle}>EVENT CONTROL</Text>
                        <Text style={styles.brandTitle}>OPERATIONS</Text>
                    </View>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
                        <LinearGradient colors={['#06B6D4', '#0891B2']} style={styles.addBtnInner}>
                            <Ionicons name="add" size={28} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color="#06B6D4" size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={events}
                        keyExtractor={item => item._id}
                        renderItem={renderEventItem}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={<Text style={styles.emptyText}>No active operations detectred.</Text>}
                    />
                )}

                <Modal visible={modalVisible} animationType="fade" transparent={true}>
                    <View style={styles.modalOverlay}>
                        <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>NEW OPERATION</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {!user?.collegeId && (
                                    <View style={{ marginBottom: 20 }}>
                                        <Text style={styles.inputLabel}>SELECT INSTITUTION</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {colleges.map((c) => (
                                                <TouchableOpacity
                                                    key={c._id}
                                                    style={[styles.chip, selectedCollegeId === c._id && styles.selectedChip]}
                                                    onPress={() => {
                                                        setSelectedCollegeId(c._id);
                                                        fetchCollegeData(c._id);
                                                    }}
                                                >
                                                    <Text style={[styles.chipText, selectedCollegeId === c._id && { color: '#fff' }]}>{c.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                <Text style={styles.inputLabel}>OPERATIONAL NAME</Text>
                                <TextInput style={styles.neoInput} placeholder="Mission Designation" placeholderTextColor="rgba(255,255,255,0.2)" value={name} onChangeText={setName} />

                                <Text style={styles.inputLabel}>SCOPE DETAILS</Text>
                                <TextInput style={[styles.neoInput, { height: 100 }]} placeholder="Operational objectives..." placeholderTextColor="rgba(255,255,255,0.2)" value={description} onChangeText={setDescription} multiline />

                                <View style={styles.row}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>VENUE</Text>
                                        <TextInput style={styles.neoInput} placeholder="Loc: Area 51" placeholderTextColor="rgba(255,255,255,0.2)" value={venue} onChangeText={setVenue} />
                                    </View>
                                    <View style={{ width: 15 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>FEE (INR)</Text>
                                        <TextInput style={styles.neoInput} keyboardType="numeric" value={fee} onChangeText={setFee} />
                                    </View>
                                </View>

                                <Text style={styles.inputLabel}>SCHEDULED DATE</Text>
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
                                <View style={{ height: 30 }} />
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
    orb1: { top: -200, right: -100 },
    orb2: { bottom: -200, left: -100 },
    safeArea: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 25, paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    brandSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 'bold', letterSpacing: 3 },
    brandTitle: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    addBtn: { borderRadius: 18, overflow: 'hidden', elevation: 10, shadowColor: '#06B6D4', shadowOpacity: 0.3, shadowRadius: 10 },
    addBtnInner: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 25, paddingBottom: 100 },
    neoCard: { borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
    cardInner: { padding: 24 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    eventInfo: { flex: 1 },
    eventName: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    tagRow: { flexDirection: 'row', alignItems: 'center' },
    statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 10 },
    statusText: { fontSize: 10, fontWeight: '900' },
    venueText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 'bold' },
    actionColumn: { gap: 12 },
    actionIconBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
    cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 15, gap: 20 },
    metaBox: { flexDirection: 'row', alignItems: 'center' },
    metaText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginLeft: 8, fontWeight: 'bold' },
    emptyText: { color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 40, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 32, padding: 30, borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.2)', maxHeight: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
    closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    inputLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
    neoInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
    row: { flexDirection: 'row' },
    dateSelector: { flexDirection: 'row', alignItems: 'center', padding: 18, backgroundColor: 'rgba(6, 182, 212, 0.05)', borderRadius: 18, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.2)' },
    dateText: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginLeft: 12, letterSpacing: 1 },
    launchBtn: { marginTop: 10 },
    launchBtnInner: { padding: 20, borderRadius: 20, alignItems: 'center' },
    launchText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    selectedChip: { backgroundColor: '#06B6D4', borderColor: '#06B6D4' },
    chipText: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 'bold' }
});
