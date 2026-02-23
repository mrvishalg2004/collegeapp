import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Dimensions, RefreshControl, ScrollView, Platform, TextInput, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { EventService } from '../services/event.service';
import { CertificateService } from '../services/certificate.service';
import { Ionicons } from '@expo/vector-icons';
import { IEvent, ICertificate } from '../types';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Placeholder Images based on Department
const getEventImage = (deptName: string = '') => {
    const name = deptName.toLowerCase();
    if (name.includes('computer') || name.includes('cs') || name.includes('it')) {
        return { uri: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' };
    } else if (name.includes('mech') || name.includes('civil') || name.includes('arch')) {
        return { uri: 'https://images.unsplash.com/photo-1581094794329-cd11965d152a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' };
    } else if (name.includes('electr')) {
        return { uri: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' };
    } else if (name.includes('business') || name.includes('management')) {
        return { uri: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' };
    }
    // Default Abstract
    return { uri: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' };
};

export default function StudentDashboard() {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<IEvent[]>([]); // For Home filter
    const [exploreEvents, setExploreEvents] = useState<IEvent[]>([]); // For Explore search
    const [certificates, setCertificates] = useState<ICertificate[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation<any>();
    const { logout, user } = useAuth();

    // Departments for Filter
    const [departments, setDepartments] = useState<any[]>([]);
    const [selectedDept, setSelectedDept] = useState('All');

    // Search for Explore
    const [searchQuery, setSearchQuery] = useState('');

    // Bottom Tab State
    const [activeTab, setActiveTab] = useState<'Home' | 'Explore' | 'Certificates'>('Home');

    const loadData = async () => {
        try {
            setLoading(true);
            // Fetch Events
            const eventData = await EventService.getEvents();
            const allEvents = (eventData as IEvent[]).sort((a, b) => {
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });
            setEvents(allEvents);
            setExploreEvents(allEvents); // Init explore with all
            applyFilter(selectedDept, allEvents);

            // Fetch Certificates
            const certData = await CertificateService.getMyCertificates();
            setCertificates(certData as ICertificate[]);

            // Extract unique departments
            const uniqueDeptsMap = new Map();
            allEvents.forEach(e => {
                if (e.departmentId && typeof e.departmentId === 'object') {
                    uniqueDeptsMap.set(e.departmentId._id, e.departmentId.name);
                }
            });
            const deptList = Array.from(uniqueDeptsMap, ([_id, name]) => ({ _id, name }));
            setDepartments([{ _id: 'All', name: 'All' }, ...deptList]);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadData();
    }, []);

    const applyFilter = (deptId: string, eventList = events) => {
        setSelectedDept(deptId);
        if (deptId === 'All') {
            setFilteredEvents(eventList);
        } else {
            setFilteredEvents(eventList.filter(e =>
                (e.departmentId && typeof e.departmentId === 'object' && e.departmentId._id === deptId)
            ));
        }
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setExploreEvents(events);
        } else {
            const lower = text.toLowerCase();
            setExploreEvents(events.filter(e =>
                e.name.toLowerCase().includes(lower) ||
                (e.departmentId as any)?.name?.toLowerCase().includes(lower)
            ));
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    const handleDownloadCert = (url: string) => {
        if (url) {
            // Open the URL directly
            Linking.openURL(url).catch((err) => {
                console.error("Download Error:", err);
                Alert.alert("Error", "Cannot open URL");
            });
        } else {
            Alert.alert("Info", "Certificate URL unavailable");
        }
    };

    // --- Render Items ---

    const renderEventCard = ({ item }: { item: any }) => {
        const isCompleted = item.completed;
        const deptName = item.departmentId?.name || 'Open Event';
        const imageSource = getEventImage(deptName);
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.card, isCompleted && styles.cardDisabled]}
                onPress={() => !isCompleted && navigation.navigate('EventDetails', { event: item })}
                disabled={isCompleted}
            >
                <View style={styles.imageContainer}>
                    <Image source={imageSource} style={[styles.cardImage, isCompleted && { opacity: 0.5 }]} resizeMode="cover" />
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>{item.fee > 0 ? `₹${item.fee}` : 'FREE'}</Text>
                    </View>
                    {isCompleted && (
                        <View style={styles.closedOverlay}>
                            <Text style={styles.closedText}>CLOSED</Text>
                        </View>
                    )}
                </View>
                <View style={styles.cardContent}>
                    <Text style={[styles.eventTitle, isCompleted && { color: '#999' }]} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="school-outline" size={14} color="#666" style={{ marginRight: 4 }} />
                            <Text style={styles.metaText}>{deptName}</Text>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={14} color="#666" style={{ marginRight: 4 }} />
                            <Text style={styles.metaText}>{new Date(item.date).toDateString()}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderCertificateCard = ({ item }: { item: ICertificate }) => (
        <View style={styles.certCardContainer}>
            <LinearGradient
                colors={['#FFD700', '#FDB931', '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.certCardBorder}
            >
                <View style={styles.certCardInner}>
                    <Ionicons name="ribbon" size={80} color="rgba(0,0,0,0.03)" style={styles.watermark} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Ionicons name="school" size={24} color="#1A237E" />
                        <Text style={styles.certHeader}>CERTIFICATE</Text>
                    </View>
                    <Text style={styles.certEventName} numberOfLines={2}>{item.eventId?.name}</Text>
                    <Text style={styles.certDate}>Issued: {new Date(item.issuedAt).toDateString()}</Text>

                    <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownloadCert(item.pdfUrl)}>
                        <Text style={styles.downloadText}>Download PDF</Text>
                        <Ionicons name="cloud-download-outline" size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );

    // --- Sub Views ---

    const HomeView = () => (
        <View style={{ flex: 1 }}>
            {/* Horizontal Filters */}
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {departments.map((dept) => (
                        <TouchableOpacity
                            key={dept._id}
                            style={[styles.filterChip, selectedDept === dept._id && styles.filterChipActive]}
                            onPress={() => applyFilter(dept._id)}
                        >
                            <Text style={[styles.filterText, selectedDept === dept._id && styles.filterTextActive]}>
                                {dept.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredEvents}
                renderItem={renderEventCard}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={60} color="#ddd" />
                        <Text style={styles.emptyText}>No events found</Text>
                    </View>
                }
                showsVerticalScrollIndicator={false}
            />
        </View>
    );

    const ExploreView = () => (
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}>
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search events, workshops..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>
            <Text style={styles.sectionTitle}>All Events</Text>
            <FlatList
                data={exploreEvents}
                renderItem={renderEventCard}
                keyExtractor={(item) => item._id}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No matches found</Text>
                    </View>
                }
            />
        </View>
    );

    const CertificatesView = () => (
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 10 }}>
            <Text style={styles.sectionTitle}>Your Achievements</Text>
            {certificates.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="trophy-outline" size={60} color="#ddd" />
                    <Text style={styles.emptyText}>No certificates yet.</Text>
                    <Text style={{ color: '#aaa', marginTop: 5 }}>Complete events to earn them!</Text>
                </View>
            ) : (
                <FlatList
                    data={certificates}
                    renderItem={renderCertificateCard}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );


    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.subtitle}>Campus Life</Text>
                    <Text style={styles.title}>Student Dashboard</Text>
                </View>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ProfileScreen')}>
                    <Ionicons name="person" size={22} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Content Area */}
            <View style={{ flex: 1 }}>
                {loading ? (
                    <ActivityIndicator size="large" color="#009688" style={{ marginTop: 50 }} />
                ) : (
                    <>
                        {activeTab === 'Home' && <HomeView />}
                        {activeTab === 'Explore' && <ExploreView />}
                        {activeTab === 'Certificates' && <CertificatesView />}
                    </>
                )}
            </View>

            {/* Bottom Navigation Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.paramountTab} onPress={() => setActiveTab('Home')}>
                    <Ionicons name={activeTab === 'Home' ? "home" : "home-outline"} size={24} color={activeTab === 'Home' ? "#009688" : "#999"} />
                    <Text style={[styles.tabText, activeTab === 'Home' && styles.activeTabText]}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.paramountTab} onPress={() => setActiveTab('Explore')}>
                    <Ionicons name={activeTab === 'Explore' ? "compass" : "compass-outline"} size={24} color={activeTab === 'Explore' ? "#009688" : "#999"} />
                    <Text style={[styles.tabText, activeTab === 'Explore' && styles.activeTabText]}>Explore</Text>
                </TouchableOpacity>

                {/* Replaced Ticket with Certificate */}
                <TouchableOpacity style={styles.paramountTab} onPress={() => setActiveTab('Certificates')}>
                    <Ionicons name={activeTab === 'Certificates' ? "ribbon" : "ribbon-outline"} size={24} color={activeTab === 'Certificates' ? "#009688" : "#999"} />
                    <Text style={[styles.tabText, activeTab === 'Certificates' && styles.activeTabText]}>Certificates</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.paramountTab} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#F44336" />
                    <Text style={[styles.tabText, { color: '#F44336' }]}>Logout</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FC' },

    // Header
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    subtitle: { fontSize: 12, color: '#009688', fontWeight: 'bold', textTransform: 'uppercase' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1A2E35' },
    iconButton: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5',
        justifyContent: 'center', alignItems: 'center', marginLeft: 10
    },

    // Filters
    filterContainer: { backgroundColor: '#fff', paddingBottom: 20 },
    filterChip: {
        paddingVertical: 8, paddingHorizontal: 16, borderRadius: 25,
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', marginRight: 10
    },
    filterChipActive: { backgroundColor: '#009688', borderColor: '#009688' },
    filterText: { fontSize: 14, color: '#666', fontWeight: '500' },
    filterTextActive: { color: '#fff', fontWeight: 'bold' },

    // List
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },

    // Search Bar
    searchBar: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
        paddingHorizontal: 15, borderRadius: 12, height: 50, marginBottom: 20,
        borderWidth: 1, borderColor: '#eee'
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },

    // Event Card
    card: {
        backgroundColor: '#fff', borderRadius: 20, marginBottom: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
        borderWidth: 1, borderColor: '#f0f0f0', overflow: 'hidden'
    },
    cardDisabled: { opacity: 0.9 },
    imageContainer: { height: 160, width: '100%', position: 'relative' },
    cardImage: { width: '100%', height: '100%' },
    priceBadge: {
        position: 'absolute', top: 15, right: 15, backgroundColor: '#fff',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, elevation: 3
    },
    priceText: { fontSize: 12, fontWeight: 'bold', color: '#009688' },
    closedOverlay: {
        ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center'
    },
    closedText: {
        color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 2,
        borderWidth: 2, borderColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8
    },
    cardContent: { padding: 16 },
    eventTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A2E35', marginBottom: 10, lineHeight: 24 },
    metaRow: { flexDirection: 'row', marginBottom: 5 },
    metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
    metaText: { fontSize: 12, color: '#78909C' },

    // Certificate Card
    certCardContainer: { marginBottom: 20 },
    certCardBorder: { borderRadius: 15, padding: 2 },
    certCardInner: { backgroundColor: '#fff', borderRadius: 13, padding: 15, overflow: 'hidden' },
    certHeader: { fontSize: 12, fontWeight: 'bold', color: '#1A237E', marginLeft: 8, letterSpacing: 2 },
    certEventName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    certDate: { fontSize: 12, color: '#888', marginBottom: 15 },
    watermark: { position: 'absolute', bottom: -10, right: -10, opacity: 0.1 },
    downloadBtn: {
        flexDirection: 'row', backgroundColor: '#1A237E', paddingVertical: 8,
        paddingHorizontal: 15, borderRadius: 20, alignSelf: 'flex-start', alignItems: 'center'
    },
    downloadText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginRight: 5 },

    // Empty
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 50 },
    emptyText: { marginTop: 10, color: '#90A4AE', fontSize: 16 },

    // Bottom Bar
    bottomBar: {
        flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 20,
        justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee',
        paddingBottom: Platform.OS === 'ios' ? 20 : 10
    },
    paramountTab: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    tabText: { fontSize: 10, color: '#999', marginTop: 4 },
    activeTabText: { color: '#009688', fontWeight: 'bold' }
});
