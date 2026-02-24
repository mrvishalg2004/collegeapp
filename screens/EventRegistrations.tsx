import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { CertificateService } from '../services/certificate.service';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function EventRegistrations() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { eventId, eventName } = route.params;

    const [registrations, setRegistrations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/events/${eventId}/registrations`);
            setRegistrations(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch registrations");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateCertificate = async (registrationId: string) => {
        try {
            await CertificateService.generateCertificate(registrationId);
            Alert.alert("Success", "Certificate Authorized & Generated");
            fetchRegistrations();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Generation failed");
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.neoCard}>
            <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                style={styles.cardInner}
            >
                <View style={styles.cardContent}>
                    <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>{item.studentId?.name || 'Unknown Subject'}</Text>
                        <Text style={styles.studentEmail}>{item.studentId?.email}</Text>

                        <View style={styles.statusRow}>
                            <View style={[styles.statusBadge, { backgroundColor: item.paymentStatus === 'paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
                                <Text style={[styles.statusText, { color: item.paymentStatus === 'paid' ? '#10B981' : '#F59E0B' }]}>
                                    {item.paymentStatus.toUpperCase()}
                                </Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: item.attendance ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255, 255, 255, 0.05)' }]}>
                                <Text style={[styles.statusText, { color: item.attendance ? '#A855F7' : 'rgba(255,255,255,0.4)' }]}>
                                    {item.attendance ? "MARKED" : "PENDING"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {item.paymentStatus === 'paid' && (
                        <TouchableOpacity
                            style={[styles.certBtn, item.certificateGenerated && styles.certBtnDisabled]}
                            onPress={() => !item.certificateGenerated && handleGenerateCertificate(item._id)}
                            disabled={item.certificateGenerated}
                        >
                            <LinearGradient
                                colors={item.certificateGenerated ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)'] : ['#06B6D4', '#0891B2']}
                                style={styles.certBtnInner}
                            >
                                <Ionicons name={item.certificateGenerated ? "checkmark-circle" : "ribbon"} size={20} color={item.certificateGenerated ? "#10B981" : "#fff"} />
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />
            <View style={styles.meshContainer}>
                <LinearGradient colors={['#A855F7', 'transparent']} style={[styles.orb, styles.orb1]} />
                <LinearGradient colors={['#06B6D4', 'transparent']} style={[styles.orb, styles.orb2]} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.brandSubtitle}>REGISTRY DATA</Text>
                        <Text style={styles.brandTitle} numberOfLines={1}>{eventName?.toUpperCase()}</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color="#A855F7" size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={registrations}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={<Text style={styles.emptyText}>No registered personnel detected.</Text>}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#020617' },
    meshContainer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
    orb: { position: 'absolute', width: width, height: width, borderRadius: width / 2, opacity: 0.1 },
    orb1: { top: -100, left: -100 },
    orb2: { bottom: -100, right: -100 },
    safeArea: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 25, paddingVertical: 20, flexDirection: 'row', alignItems: 'center' },
    backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 20 },
    headerTitleContainer: { flex: 1 },
    brandSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
    brandTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
    list: { padding: 25, paddingBottom: 50 },
    neoCard: { borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 15 },
    cardInner: { padding: 20 },
    cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    studentInfo: { flex: 1 },
    studentName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    studentEmail: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12 },
    statusRow: { flexDirection: 'row', gap: 10 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 9, fontWeight: '900' },
    certBtn: { borderRadius: 14, overflow: 'hidden' },
    certBtnInner: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    certBtnDisabled: { opacity: 0.8 },
    emptyText: { color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 40, fontWeight: 'bold' }
});
