import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Linking, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CertificateService } from '../services/certificate.service';
import { Ionicons } from '@expo/vector-icons';
import { ICertificate } from '../types';

export default function MyCertificates() {
    const [certs, setCerts] = useState<ICertificate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

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

    const handleDownload = (url: string) => {
        if (url) {
            Linking.openURL(url).catch(() => Alert.alert("Error", "Cannot open URL"));
        } else {
            Alert.alert("Info", "Certificate URL unavailable");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>My Certificates</Text>

            {loading ? <ActivityIndicator /> : (
                <FlatList
                    data={certs}
                    keyExtractor={item => item._id}
                    renderItem={({ item }: { item: any }) => (
                        <View style={styles.card}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.eventName}>{item.eventId?.name || 'Event'}</Text>
                                <Text style={styles.date}>Issued: {new Date(item.issuedAt).toDateString()}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDownload(item.pdfUrl)}>
                                <Ionicons name="download-outline" size={30} color="#2196F3" />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No certificates yet.</Text>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    card: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
    eventName: { fontSize: 18, fontWeight: 'bold' },
    date: { color: '#666', marginTop: 5 },
    empty: { textAlign: 'center', marginTop: 20, color: '#999' }
});
