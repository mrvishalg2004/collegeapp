import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Switch, TextInput, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { IRegistration } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Random avatar helper
const getAvatar = (id: string) => `https://ui-avatars.com/api/?name=${id}&background=random&color=fff&size=128`;

export default function EventAttendance() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { eventId, eventName } = route.params;
    const [registrations, setRegistrations] = useState<IRegistration[]>([]);
    const [filteredRegs, setFilteredRegs] = useState<IRegistration[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'present' | 'absent'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterData();
    }, [registrations, searchQuery, filterType]);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/events/${eventId}/registrations`);
            setRegistrations(res.data);
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not fetch registrations");
        } finally {
            setLoading(false);
        }
    };

    const filterData = () => {
        let data = registrations;

        // Search
        if (searchQuery) {
            data = data.filter(r =>
                r.studentId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.studentId._id.includes(searchQuery)
            );
        }

        // Filter Type
        if (filterType === 'present') data = data.filter(r => r.attendance);
        if (filterType === 'absent') data = data.filter(r => !r.attendance);

        setFilteredRegs(data);
    };

    const toggleAttendance = async (id: string, currentStatus: boolean) => {
        // Optimistic update
        const updatedRegs = registrations.map(r => r._id === id ? { ...r, attendance: !currentStatus } : r);
        setRegistrations(updatedRegs);

        try {
            await api.put(`/registrations/${id}/attendance`, { status: !currentStatus });
        } catch (e) {
            Alert.alert("Error", "Failed to update");
            // Revert
            const revertedRegs = registrations.map(r => r._id === id ? { ...r, attendance: currentStatus } : r);
            setRegistrations(revertedRegs);
        }
    };

    const markCompleted = async () => {
        Alert.alert(
            "Finish Event",
            "Are you sure you want to close this event? Certificates will be generated for present students.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Finish",
                    onPress: async () => {
                        try {
                            await api.put(`/events/${eventId}/complete`);
                            Alert.alert("Success", "Event marked as completed.");
                            navigation.goBack();
                        } catch (e) {
                            Alert.alert("Error", "Failed to mark complete");
                        }
                    }
                }
            ]
        );
    };

    // Stats
    const total = registrations.length;
    const present = registrations.filter(r => r.attendance).length;
    const absent = total - present;

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <Image source={{ uri: getAvatar(item.studentId.name) }} style={styles.avatar} />

            <View style={styles.info}>
                <Text style={styles.name}>{item.studentId.name}</Text>
                <Text style={styles.idText}>ID: {item.studentId.collegeId || 'N/A'} • {item.studentId.departmentId?.name || 'Dept'}</Text>
            </View>

            <TouchableOpacity
                style={[styles.toggleBtn, item.attendance ? styles.togglePresent : styles.toggleAbsent]}
                onPress={() => toggleAttendance(item._id, item.attendance)}
            >
                <View style={[styles.toggleCircle, item.attendance ? { right: 2 } : { left: 2 }]} />
                <Text style={[styles.toggleText, item.attendance ? { left: 8, color: '#fff' } : { right: 8, color: '#999' }]}>
                    {item.attendance ? 'P' : 'A'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{eventName}</Text>
                <TouchableOpacity style={styles.finishBtn} onPress={markCompleted}>
                    <Ionicons name="checkmark-done" size={18} color="#fff" />
                    <Text style={styles.finishBtnText}>FINISH</Text>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search student name or ID"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Chips */}
            <View style={styles.chipsContainer}>
                <TouchableOpacity
                    style={[styles.chip, filterType === 'all' && styles.chipActive]}
                    onPress={() => setFilterType('all')}
                >
                    <Text style={[styles.chipText, filterType === 'all' && styles.chipTextActive]}>All ({total})</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.chip, filterType === 'present' && styles.chipActive]}
                    onPress={() => setFilterType('present')}
                >
                    <Text style={[styles.chipText, filterType === 'present' && styles.chipTextActive]}>Present ({present})</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.chip, filterType === 'absent' && styles.chipActive]}
                    onPress={() => setFilterType('absent')}
                >
                    <Text style={[styles.chipText, filterType === 'absent' && styles.chipTextActive]}>Absent ({absent})</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>RECENT ATTENDANCE</Text>

            <FlatList
                data={filteredRegs}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text style={styles.empty}>No students found</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    backBtn: { marginRight: 15 },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111'
    },
    finishBtn: {
        flexDirection: 'row',
        backgroundColor: '#FFA000',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center'
    },
    finishBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        marginLeft: 5
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 20,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderRadius: 12,
        height: 50,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },

    // Chips
    chipsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#fff',
        marginRight: 10
    },
    chipActive: {
        backgroundColor: '#FFA000',
        borderColor: '#FFA000'
    },
    chipText: { color: '#555', fontWeight: '600' },
    chipTextActive: { color: '#fff' },

    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#9E9E9E',
        marginLeft: 20,
        marginBottom: 10,
        letterSpacing: 1
    },

    list: { paddingHorizontal: 20, paddingBottom: 50 },
    empty: { textAlign: 'center', marginTop: 30, color: '#aaa' },

    // Card
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginBottom: 12,
        padding: 15,
        borderRadius: 15,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.03
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#eee'
    },
    info: {
        flex: 1,
        marginLeft: 15
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    idText: {
        fontSize: 12,
        color: '#8D6E63',
        marginTop: 2
    },

    // Toggle
    toggleBtn: {
        width: 60,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        position: 'relative'
    },
    togglePresent: { backgroundColor: '#FFA000' },
    toggleAbsent: { backgroundColor: '#ECEFF1' },
    toggleCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        position: 'absolute',
        top: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2
    },
    toggleText: {
        position: 'absolute',
        fontSize: 12,
        fontWeight: 'bold'
    }
});
