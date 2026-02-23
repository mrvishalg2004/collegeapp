import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function SystemReports() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await api.get('/admin/reports');
            setData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>System Reports</Text>

                {/* Revenue Card */}
                <LinearGradient colors={['#43A047', '#2E7D32']} style={styles.revenueCard}>
                    <Text style={styles.cardLabel}>Total Subscription Revenue</Text>
                    <Text style={styles.revenueText}>₹{data?.totalRevenue?.toLocaleString()}</Text>
                </LinearGradient>

                {/* Top Colleges */}
                <Text style={styles.sectionTitle}>Top Performing Colleges</Text>
                {data?.topColleges?.map((college: any, index: number) => (
                    <View key={index} style={styles.listItem}>
                        <Text style={styles.listText}>{college.collegeName}</Text>
                        <Text style={styles.countBadge}>{college.eventCount} Events</Text>
                    </View>
                ))}

                {/* Recent Subscriptions */}
                <Text style={styles.sectionTitle}>Recent College Subscriptions</Text>
                {data?.recentSubscriptions?.map((sub: any, index: number) => (
                    <View key={index} style={styles.listItem}>
                        <View>
                            <Text style={styles.listText}>{sub.name}</Text>
                            <Text style={styles.subText}>Price: ₹{sub.subscriptionPrice}</Text>
                        </View>
                        <Text style={styles.date}>{sub.paidAt ? new Date(sub.paidAt).toLocaleDateString() : 'N/A'}</Text>
                    </View>
                ))}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    revenueCard: { padding: 25, borderRadius: 15, marginBottom: 30, elevation: 4 },
    cardLabel: { color: '#fff', fontSize: 16, opacity: 0.9 },
    revenueText: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 15, color: '#444' },
    listItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 1
    },
    listText: { fontSize: 16, fontWeight: '600', color: '#333' },
    subText: { fontSize: 14, color: '#666', marginTop: 2 },
    countBadge: { backgroundColor: '#E3F2FD', color: '#1976D2', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
    date: { fontSize: 12, color: '#888' }
});
