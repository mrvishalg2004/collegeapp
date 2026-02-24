import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CollegeService } from '../services/college.service';
import { ICollege } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function CollegeList() {
    const [colleges, setColleges] = useState<ICollege[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newCollegeName, setNewCollegeName] = useState('');
    const [newCollegeEmail, setNewCollegeEmail] = useState('');
    const [newCollegePassword, setNewCollegePassword] = useState('');

    const [editingCollege, setEditingCollege] = useState<ICollege | null>(null);
    const [subPrice, setSubPrice] = useState('0');
    const [subDuration, setSubDuration] = useState('12');

    useEffect(() => {
        fetchColleges();
    }, []);

    const fetchColleges = async () => {
        try {
            setLoading(true);
            const data = await CollegeService.getColleges();
            setColleges(data as ICollege[]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCollege = async () => {
        if (!newCollegeName || !newCollegeEmail) {
            Alert.alert("Error", "Please fill name and email");
            return;
        }

        try {
            if (editingCollege) {
                await CollegeService.updateCollege(editingCollege._id, {
                    name: newCollegeName,
                    email: newCollegeEmail
                });
                Alert.alert("Success", "College Updated");
            } else {
                await CollegeService.createCollege({
                    name: newCollegeName,
                    email: newCollegeEmail,
                    password: newCollegePassword,
                    subscriptionPrice: parseFloat(subPrice) || 0,
                    subscriptionDuration: parseInt(subDuration) || 12
                });
                Alert.alert("Success", "College Created with Subscription");
            }
            closeModal();
            fetchColleges();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to save college");
        }
    };

    const openCreateModal = () => {
        setEditingCollege(null);
        setNewCollegeName('');
        setNewCollegeEmail('');
        setNewCollegePassword('');
        setSubPrice('0');
        setSubDuration('12');
        setModalVisible(true);
    };

    const openEditModal = (college: ICollege) => {
        setEditingCollege(college);
        setNewCollegeName(college.name);
        setNewCollegeEmail(college.email);
        setNewCollegePassword('');
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingCollege(null);
    };

    const handleToggleStatus = (college: ICollege) => {
        const isBlocking = college.status === 'active';
        Alert.alert(
            isBlocking ? "Block College" : "Unblock College",
            isBlocking
                ? "Blocking will prevent all associated users from accessing the system."
                : "Unblock to restore system access.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: isBlocking ? "Block" : "Unblock",
                    style: isBlocking ? "destructive" : "default",
                    onPress: async () => {
                        try {
                            await CollegeService.updateCollege(college._id, { status: isBlocking ? 'inactive' : 'active' });
                            fetchColleges();
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteCollege = (id: string) => {
        Alert.alert(
            "Delete Institutional Record",
            "This action is permanent and will remove all primary access for this institution.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove Permanently", style: 'destructive', onPress: async () => {
                        try {
                            await CollegeService.deleteCollege(id);
                            fetchColleges();
                            Alert.alert("Success", "Record Purged.");
                        } catch (error: any) {
                            Alert.alert("Error", "Failed to remove college");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: ICollege }) => (
        <View style={styles.neoCard}>
            <LinearGradient
                colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
                style={styles.cardInner}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.institutionIcon}>
                        <Ionicons name="business" size={24} color="#A855F7" />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.collegeName}>{item.name}</Text>
                        <Text style={styles.collegeEmail}>{item.email}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleToggleStatus(item)} style={[styles.statusTab, { backgroundColor: item.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                        <Text style={[styles.statusLabel, { color: item.status === 'active' ? '#10B981' : '#EF4444' }]}>
                            {item.status.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.metaInfo}>
                        <View style={styles.metaRow}>
                            <Ionicons name="card-outline" size={14} color="rgba(255,255,255,0.4)" />
                            <Text style={styles.metaText}>₹{item.subscriptionPrice}</Text>
                        </View>
                        <View style={[styles.subBadge, { backgroundColor: item.subscriptionStatus === 'paid' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
                            <Text style={[styles.subLabel, { color: item.subscriptionStatus === 'paid' ? '#06B6D4' : '#F59E0B' }]}>
                                {item.subscriptionStatus?.toUpperCase() || 'PENDING'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
                            <Ionicons name="pencil" size={18} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteCollege(item._id)} style={[styles.actionBtn, { borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
                            <Ionicons name="trash" size={18} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />

            {/* Mesh Background */}
            <View style={styles.meshContainer}>
                <LinearGradient colors={['#A855F7', 'transparent']} style={[styles.orb, styles.orb1]} />
                <LinearGradient colors={['#06B6D4', 'transparent']} style={[styles.orb, styles.orb2]} />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.brandSubtitle}>INSTITUTIONAL</Text>
                    <Text style={styles.brandTitle}>DIRECTORY</Text>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color="#A855F7" size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={colleges}
                        renderItem={renderItem}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={<Text style={styles.emptyText}>No records found</Text>}
                        showsVerticalScrollIndicator={false}
                    />
                )}

                <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
                    <LinearGradient colors={['#A855F7', '#7E22CE']} style={styles.fabInner}>
                        <Ionicons name="add" size={32} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>

                <Modal
                    visible={modalVisible}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={closeModal}
                >
                    <View style={styles.modalOverlay}>
                        <LinearGradient
                            colors={['#0F172A', '#1E293B']}
                            style={styles.modalContent}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{editingCollege ? 'Update Campus' : 'New Registration'}</Text>
                                <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                                    <Ionicons name="close" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={styles.inputLabel}>Campus Name</Text>
                                <TextInput
                                    style={styles.neoInput}
                                    placeholder="e.g. Neo Tech University"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    value={newCollegeName}
                                    onChangeText={setNewCollegeName}
                                />

                                <Text style={styles.inputLabel}>Administration Email</Text>
                                <TextInput
                                    style={styles.neoInput}
                                    placeholder="admin@campus.edu"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={newCollegeEmail}
                                    onChangeText={setNewCollegeEmail}
                                />

                                {!editingCollege && (
                                    <>
                                        <Text style={styles.inputLabel}>Master Key (Password)</Text>
                                        <TextInput
                                            style={styles.neoInput}
                                            placeholder="Min. 8 characters"
                                            placeholderTextColor="rgba(255,255,255,0.2)"
                                            secureTextEntry
                                            value={newCollegePassword}
                                            onChangeText={setNewCollegePassword}
                                        />
                                    </>
                                )}

                                <View style={styles.row}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>Sub. Price (₹)</Text>
                                        <TextInput
                                            style={styles.neoInput}
                                            keyboardType="numeric"
                                            value={subPrice}
                                            onChangeText={setSubPrice}
                                        />
                                    </View>
                                    <View style={{ width: 15 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.inputLabel}>Duration (Mon)</Text>
                                        <TextInput
                                            style={styles.neoInput}
                                            keyboardType="numeric"
                                            value={subDuration}
                                            onChangeText={setSubDuration}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveCollege}>
                                    <LinearGradient colors={['#A855F7', '#7E22CE']} style={styles.saveBtnInner}>
                                        <Text style={styles.saveBtnText}>{editingCollege ? 'SYNC RECORD' : 'AUTHORIZE REGISTRATION'}</Text>
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
    header: { paddingHorizontal: 25, paddingVertical: 20 },
    brandSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 'bold', letterSpacing: 3 },
    brandTitle: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    list: { padding: 25, paddingBottom: 100 },
    neoCard: { borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
    cardInner: { padding: 20 },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    institutionIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: 'rgba(168, 85, 247, 0.1)', justifyContent: 'center', alignItems: 'center' },
    headerInfo: { flex: 1, marginLeft: 16 },
    collegeName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    collegeEmail: { color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 2 },
    statusTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    statusLabel: { fontSize: 10, fontWeight: 'bold' },
    cardFooter: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    metaInfo: { flexDirection: 'row', alignItems: 'center' },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
    metaText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 'bold', marginLeft: 6 },
    subBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    subLabel: { fontSize: 10, fontWeight: 'bold' },
    actions: { flexDirection: 'row', gap: 10 },
    actionBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)' },
    fab: { position: 'absolute', bottom: 40, right: 25, borderRadius: 30, elevation: 20, shadowColor: '#A855F7', shadowOpacity: 0.5, shadowRadius: 15 },
    fabInner: { width: 66, height: 66, borderRadius: 33, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 40, fontWeight: 'bold', letterSpacing: 1 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 32, padding: 30, borderWidth: 1, borderColor: 'rgba(168, 85, 247, 0.2)' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    modalTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    inputLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
    neoInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
    row: { flexDirection: 'row' },
    saveBtn: { marginTop: 10 },
    saveBtnInner: { padding: 20, borderRadius: 20, alignItems: 'center' },
    saveBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 }
});
