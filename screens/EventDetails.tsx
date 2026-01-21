import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, TextInput, ActivityIndicator, Image, Dimensions, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PaymentService } from '../services/payment.service';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Helper for deterministic image (same as dashboard)
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
    return { uri: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' };
};

// Success Animation Component
const SuccessAnimation = ({ onFinish }: { onFinish: () => void }) => {
    const scaleValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(scaleValue, {
                toValue: 1.2,
                duration: 400,
                useNativeDriver: true,
                easing: Easing.elastic(1.5)
            }),
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true
            })
        ]).start(() => {
            setTimeout(onFinish, 1000); // Wait a bit before closing
        });
    }, []);

    return (
        <View style={styles.successContainer}>
            <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleValue }] }]}>
                <Ionicons name="checkmark" size={50} color="#fff" />
            </Animated.View>
            <Text style={styles.successText}>Payment Successful!</Text>
        </View>
    );
};

export default function EventDetails() {
    const route = useRoute<any>();
    const navigation = useNavigation();
    const { event } = route.params;
    const [loading, setLoading] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [currentOrder, setCurrentOrder] = useState<any>(null);

    const deptName = event.departmentId?.name || 'College Event';
    const imageSource = getEventImage(deptName);

    const handleRegisterOffline = async () => {
        console.log("Initiating Offline Registration for event:", event._id);
        setLoading(true);
        try {
            await PaymentService.registerOffline(event._id);
            console.log("Offline Registration Successful");
            Alert.alert(
                "Registration Successful",
                "You have been registered. Please complete the payment offline at the college counter.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        } catch (e: any) {
            console.error("Offline Registration Error:", e);
            const msg = e.response?.data?.message || e.message || "Failed";
            Alert.alert("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const handlePayOnline = async () => {
        console.log("Initiating Online Payment for event:", event._id);
        setLoading(true);
        try {
            const order = await PaymentService.createOrder(event._id);
            console.log("Order created successfully:", (order as any).id);
            setCurrentOrder(order);
            setPaymentSuccess(false); // Reset
            setPaymentModalVisible(true);
        } catch (e: any) {
            console.error("Create Order Error:", e);
            const msg = e.response?.data?.message || e.message || "Failed to initiate payment";
            Alert.alert("Payment Error", msg);
        } finally {
            setLoading(false);
        }
    };

    const processMockPayment = async () => {
        if (!currentOrder) return;
        setProcessingPayment(true);

        // Simulate network delay
        setTimeout(async () => {
            try {
                const mockResponse = {
                    eventId: event._id,
                    razorpayOrderId: currentOrder.id,
                    razorpayPaymentId: "pay_test_" + Date.now(),
                    razorpaySignature: "s3cR3t_M0ck_S1gn4tur3"
                };

                await PaymentService.verifyPayment(mockResponse);
                setPaymentSuccess(true); // Trigger animation
            } catch (err: any) {
                console.error("Payment Verify Error:", err);
                Alert.alert("Error", err.response?.data?.message || "Payment verification failed");
                setProcessingPayment(false); // Only stop if failed, otherwise success anim handles it
            }
        }, 2000);
    };

    const handleAnimationFinish = () => {
        setPaymentModalVisible(false);
        setProcessingPayment(false);
        setPaymentSuccess(false);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Event Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image source={imageSource} style={styles.heroImage} resizeMode="cover" />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.gradientOverlay}
                    />
                    <View style={styles.titleContainer}>
                        <Text style={styles.categoryBadge}>{deptName}</Text>
                        <Text style={styles.title}>{event.name}</Text>
                    </View>
                </View>

                {/* Info Grid */}
                <View style={styles.contentContainer}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <View style={styles.iconBox}>
                                <Ionicons name="calendar" size={20} color="#009688" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Date</Text>
                                <Text style={styles.infoValue}>{new Date(event.date).toDateString()}</Text>
                            </View>
                        </View>
                        <View style={styles.infoItem}>
                            <View style={styles.iconBox}>
                                <Ionicons name="location" size={20} color="#009688" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Venue</Text>
                                <Text style={styles.infoValue}>{event.venue}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <View style={styles.iconBox}>
                                <Ionicons name="wallet" size={20} color="#009688" />
                            </View>
                            <View>
                                <Text style={styles.infoLabel}>Entry Fee</Text>
                                <Text style={[styles.infoValue, { color: '#4CAF50', fontWeight: 'bold' }]}>
                                    {event.fee > 0 ? `₹${event.fee}` : 'Free'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>About Event</Text>
                    <Text style={styles.description}>
                        {event.description || 'No description provided for this event.'}
                    </Text>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.footer}>
                {event.fee > 0 ? (
                    <View style={styles.footerRow}>
                        <TouchableOpacity style={styles.offlineBtn} onPress={handleRegisterOffline} disabled={loading}>
                            <Text style={styles.offlineBtnText}>Pay Offline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.onlineBtn} onPress={handlePayOnline} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : (
                                <>
                                    <Text style={styles.onlineBtnText}>Pay Online</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 5 }} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={[styles.onlineBtn, { width: '100%' }]} onPress={handleRegisterOffline} disabled={loading}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.onlineBtnText}>Register for Free</Text>}
                    </TouchableOpacity>
                )}
            </View>

            {/* PAYMENT MODAL */}
            <Modal
                visible={paymentModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => !processingPayment && !paymentSuccess && setPaymentModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    {paymentSuccess ? (
                        <View style={[styles.modalContent, styles.successModal]}>
                            <SuccessAnimation onFinish={handleAnimationFinish} />
                        </View>
                    ) : (
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Secure Payment</Text>
                                <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.amountBox}>
                                <Text style={styles.amountLabel}>Total Amount</Text>
                                <Text style={styles.amountValue}>₹{event.fee}.00</Text>
                            </View>

                            <View style={styles.cardForm}>
                                <Text style={styles.inputLabel}>Card Number</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="card-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                                    <TextInput style={styles.input} value="4242 4242 4242 4242" editable={false} />
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ width: '48%' }}>
                                        <Text style={styles.inputLabel}>Expiry</Text>
                                        <TextInput style={styles.input} value="12/28" editable={false} />
                                    </View>
                                    <View style={{ width: '48%' }}>
                                        <Text style={styles.inputLabel}>CVV</Text>
                                        <TextInput style={styles.input} value="123" editable={false} secureTextEntry />
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.payNowBtn, processingPayment && { opacity: 0.7 }]}
                                onPress={processMockPayment}
                                disabled={processingPayment}
                            >
                                {processingPayment ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.payNowBtnText}>Pay ₹{event.fee}</Text>
                                )}
                            </TouchableOpacity>

                            <View style={styles.secureBadge}>
                                <Ionicons name="lock-closed" size={12} color="#888" />
                                <Text style={styles.secureText}>Secured by Razorpay (Test Mode)</Text>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#1A2E35',
    },
    headerTitle: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
    backBtn: { padding: 5 },

    // Hero 
    imageContainer: {
        height: 250,
        width: '100%',
        position: 'relative'
    },
    heroImage: { width: '100%', height: '100%' },
    gradientOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0
    },
    titleContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20
    },
    categoryBadge: {
        color: '#00E676',
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 5
    },

    // Content
    contentContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        marginTop: -20, // Overlap
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 20
    },
    infoItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#E0F2F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10
    },
    infoLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600'
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 10,
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10
    },
    description: {
        fontSize: 15,
        color: '#666',
        lineHeight: 24
    },

    // Footer Actions
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        elevation: 10
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    offlineBtn: {
        flex: 1,
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    offlineBtnText: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 16
    },
    onlineBtn: {
        flex: 1.5,
        padding: 15,
        borderRadius: 12,
        backgroundColor: '#009688',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    onlineBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 25,
        minHeight: 450
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
    },
    amountBox: {
        alignItems: 'center',
        marginVertical: 20
    },
    amountLabel: { fontSize: 14, color: '#888' },
    amountValue: { fontSize: 36, fontWeight: 'bold', color: '#000' },
    cardForm: {
        marginBottom: 20
    },
    inputLabel: {
        fontSize: 12,
        color: '#555',
        marginBottom: 5,
        fontWeight: '600'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        color: '#333',
        fontSize: 16
    },
    payNowBtn: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15
    },
    payNowBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    secureText: {
        fontSize: 12,
        color: '#888',
        marginLeft: 5
    },

    // Success Animation
    successModal: {
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300
    },
    successContainer: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    successCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#4CAF50',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 10,
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    successText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333'
    }
});
