import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PaymentService } from '../services/payment.service';
import { Ionicons } from '@expo/vector-icons';

export default function EventDetails() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { event } = route.params;
    const [loading, setLoading] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<any>(null);

    const handleRegisterOffline = async () => {
        setLoading(true);
        try {
            await PaymentService.registerOffline(event._id);
            Alert.alert("Success", "Registered successfully. Please pay offline at college.");
            navigation.goBack();
        } catch (e: any) {
            Alert.alert("Error", e.response?.data?.message || "Failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePayOnline = async () => {
        setLoading(true);
        try {
            // 1. Create Order
            const order = await PaymentService.createOrder(event._id);
            setCurrentOrder(order);
            setPaymentModalVisible(true);
        } catch (e: any) {
            Alert.alert("Error", e.response?.data?.message || "Failed to initiate payment");
        } finally {
            setLoading(false);
        }
    };

    const processMockPayment = async () => {
        if (!currentOrder) return;
        setProcessingPayment(true);

        // Simulate network delay for realism
        setTimeout(async () => {
            try {
                // 3. Verify (Simulate success with Mock Signature)
                const mockResponse = {
                    eventId: event._id,
                    razorpayOrderId: currentOrder.id,
                    razorpayPaymentId: "pay_test_" + Date.now(),
                    razorpaySignature: "s3cR3t_M0ck_S1gn4tur3"
                };

                await PaymentService.verifyPayment(mockResponse);
                setPaymentModalVisible(false);
                Alert.alert("Success", "Payment Verified & Registered!");
                navigation.goBack();
            } catch (err: any) {
                console.error("Payment Verify Error:", err);
                Alert.alert("Error", err.response?.data?.message || "Payment verification failed");
            } finally {
                setProcessingPayment(false);
            }
        }, 2000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Text style={styles.title}>{event.name}</Text>
                <Text style={styles.prop}>Venue: {event.venue}</Text>
                <Text style={styles.prop}>Date: {new Date(event.date).toDateString()}</Text>
                <Text style={styles.prop}>Fee: {event.fee > 0 ? `₹${event.fee}` : 'Free'}</Text>
                <Text style={styles.desc}>{event.description || 'No description provided.'}</Text>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Register</Text>

                {event.fee > 0 ? (
                    <View>
                        <TouchableOpacity style={[styles.btn, styles.onlineBtn]} onPress={handlePayOnline} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Pay Online (Razorpay)</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.offlineBtn]} onPress={handleRegisterOffline} disabled={loading}>
                            <Text style={[styles.btnText, { color: '#333' }]}>Pay Offline (Cash)</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={[styles.btn, styles.onlineBtn]} onPress={handleRegisterOffline} disabled={loading}>
                        <Text style={styles.btnText}>Register for Free</Text>
                    </TouchableOpacity>
                )}

            </ScrollView>

            {/* MOCK PAYMENT MODAL */}
            <Modal
                visible={paymentModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setPaymentModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Razorpay Trusted Business</Text>
                            <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.amountContainer}>
                            <Text style={styles.amountLabel}>Amount to Pay</Text>
                            <Text style={styles.amountValue}>₹{event.fee}.00</Text>
                        </View>

                        <Text style={styles.paymentLabel}>Card Details</Text>
                        <View style={styles.cardInputContainer}>
                            <TextInput style={styles.cardInput} placeholder="Card Number" placeholderTextColor="#999" value="4111 1111 1111 1111" editable={false} />
                            <View style={styles.cardRow}>
                                <TextInput style={[styles.cardInput, { flex: 1, marginRight: 10 }]} placeholder="MM/YY" value="12/29" editable={false} />
                                <TextInput style={[styles.cardInput, { flex: 1 }]} placeholder="CVV" value="123" editable={false} />
                            </View>
                        </View>

                        <Text style={styles.infoText}>* This is a TEST MODE payment simulation.</Text>

                        <TouchableOpacity style={styles.payNowBtn} onPress={processMockPayment} disabled={processingPayment}>
                            {processingPayment ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.payNowText}>Pay ₹{event.fee}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5', padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    prop: { fontSize: 16, marginBottom: 5, color: '#555' },
    desc: { marginTop: 15, fontSize: 16, color: '#444', lineHeight: 22 },
    divider: { height: 1, backgroundColor: '#ddd', marginVertical: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    btn: { padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10, height: 50, justifyContent: 'center' },
    onlineBtn: { backgroundColor: '#2196F3' },
    offlineBtn: { backgroundColor: '#e0e0e0' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, minHeight: 400 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a237e' },
    amountContainer: { alignItems: 'center', marginBottom: 30 },
    amountLabel: { fontSize: 14, color: '#666' },
    amountValue: { fontSize: 32, fontWeight: 'bold', color: '#333' },
    paymentLabel: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
    cardInputContainer: { marginBottom: 20 },
    cardInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 12, marginBottom: 10, backgroundColor: '#f9f9f9', color: '#333' },
    cardRow: { flexDirection: 'row' },
    infoText: { fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 20, fontStyle: 'italic' },
    payNowBtn: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 5, alignItems: 'center' },
    payNowText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});
