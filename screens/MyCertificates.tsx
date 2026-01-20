import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking, Alert, ActivityIndicator, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CertificateService } from '../services/certificate.service';
import { Ionicons } from '@expo/vector-icons';
import { ICertificate } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function MyCertificates() {
    const [certs, setCerts] = useState<ICertificate[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await CertificateService.getMyCertificates();
            setCerts(data as ICertificate[]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleDownload = (url: string) => {
        if (url) {
            Linking.openURL(url).catch(() => Alert.alert("Error", "Cannot open URL"));
        } else {
            Alert.alert("Info", "Certificate URL unavailable");
        }
    };

    const renderCertificateCard = ({ item }: { item: any }) => (
        <View style={styles.cardContainer}>
            {/* Golden Frame Gradient */}
            <LinearGradient
                colors={['#FFD700', '#FDB931', '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardBorder}
            >
                <View style={styles.cardInner}>
                    {/* Watermark / Bkg Decoration */}
                    <Ionicons name="ribbon" size={120} color="rgba(0,0,0,0.03)" style={styles.watermark} />

                    {/* Header: Logo & Title */}
                    <View style={styles.headerRow}>
                        <Ionicons name="school" size={32} color="#1A237E" />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.certTitle}>CERTIFICATE</Text>
                            <Text style={styles.certSubtitle}>OF COMPLETION</Text>
                        </View>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        <Text style={styles.presentedTo}>THIS IS PRESENTED TO</Text>
                        <Text style={styles.studentName}>{item.studentId?.name || 'Student Name'}</Text>

                        <View style={styles.divider} />

                        <Text style={styles.description}>For successfully completing the event</Text>
                        <Text style={styles.eventName}>{item.eventId?.name || 'Event Name'}</Text>

                        <Text style={styles.date}>Issued on {new Date(item.issuedAt).toDateString()}</Text>
                    </View>

                    {/* Footer: Medal & Action */}
                    <View style={styles.footer}>
                        <View style={styles.medalContainer}>
                            <Ionicons name="ribbon" size={40} color="#FFD700" />
                            <Text style={styles.verifiedText}>VERIFIED</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.downloadBtn}
                            onPress={() => handleDownload(item.pdfUrl)}
                        >
                            <Text style={styles.downloadText}>Download PDF</Text>
                            <Ionicons name="cloud-download-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.screenHeader}>
                <Text style={styles.screenTitle}>My Achievements</Text>
                <Text style={styles.screenSubtitle}>Your collection of earned certificates</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={certs}
                    keyExtractor={item => item._id}
                    renderItem={renderCertificateCard}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="trophy-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>No certificates earned yet.</Text>
                            <Text style={styles.emptySubText}>Participate in events to earn them!</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212', // Premium Dark Background
    },
    screenHeader: {
        padding: 20,
        backgroundColor: '#1E1E1E',
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFD700',
        letterSpacing: 1
    },
    screenSubtitle: {
        fontSize: 14,
        color: '#aaa',
        marginTop: 4
    },
    listContent: {
        padding: 20,
    },

    // Card Styles
    cardContainer: {
        marginBottom: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6.27,
        elevation: 10,
    },
    cardBorder: {
        borderRadius: 15,
        padding: 3, // Create border effect
    },
    cardInner: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        overflow: 'hidden',
        position: 'relative' // For watermark
    },
    watermark: {
        position: 'absolute',
        bottom: -20,
        right: -20,
        transform: [{ rotate: '-15deg' }]
    },

    // Header
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20
    },
    certTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1A237E',
        letterSpacing: 2
    },
    certSubtitle: {
        fontSize: 10,
        color: '#1A237E',
        letterSpacing: 4
    },

    // Content
    content: {
        alignItems: 'center',
        marginBottom: 20
    },
    presentedTo: {
        fontSize: 10,
        color: '#666',
        letterSpacing: 1,
        marginBottom: 5
    },
    studentName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        fontFamily: 'System', // Use specialized font if available
        textAlign: 'center'
    },
    divider: {
        height: 1,
        width: '60%',
        backgroundColor: '#FFD700',
        marginVertical: 10
    },
    description: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5
    },
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A237E',
        textAlign: 'center',
        marginBottom: 5
    },
    date: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic'
    },

    // Footer
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 10
    },
    medalContainer: {
        alignItems: 'center'
    },
    verifiedText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#FFD700',
        letterSpacing: 1
    },
    downloadBtn: {
        flexDirection: 'row',
        backgroundColor: '#1A237E',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: "#1A237E",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3
    },
    downloadText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12
    },

    // Empty State
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 20
    },
    emptySubText: {
        fontSize: 14,
        color: '#aaa',
        marginTop: 5
    }
});
