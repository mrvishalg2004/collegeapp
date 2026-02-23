
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CollegeService } from '../services/college.service';
import { ICollege } from '../types';

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
                // Update
                await CollegeService.updateCollege(editingCollege._id, {
                    name: newCollegeName,
                    email: newCollegeEmail
                    // Password update not supported in this simple view mainly to avoid complexity
                });
                Alert.alert("Success", "College Updated");
            } else {
                // Create
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
        setNewCollegePassword(''); // Don't show password
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
                ? "Blocking this college will immediately prevent all associated admins, coordinators, and students from logging into the system."
                : "Unblock this college to restore access for all its users.",
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
            "Delete College",
            "Are you sure you want to PERMANENTLY remove this college? This will delete the institution record, but associated data may persist in reports. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove Permanently", style: 'destructive', onPress: async () => {
                        try {
                            await CollegeService.deleteCollege(id);
                            fetchColleges(); // Refresh list
                            Alert.alert("Success", "College removed from system.");
                        } catch (error: any) {
                            console.error("Delete failed:", error);
                            Alert.alert("Error", error.response?.data?.message || error.message || "Failed to remove college");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: ICollege }) => (
        <View style={styles.card}>
            {/* Logo Placeholder */}
            <View style={styles.logoContainer}>
                <Ionicons name="school" size={24} color="#546E7A" />
            </View>

            <View style={styles.cardContent}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={styles.collegeName}>{item.name}</Text>
                    <TouchableOpacity onPress={() => handleToggleStatus(item)} style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#E8F5E9' : '#FFEBEE' }]}>
                        <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? '#4CAF50' : '#F44336' }]} />
                        <Text style={[styles.statusText, { color: item.status === 'active' ? '#4CAF50' : '#F44336' }]}>
                            {item.status === 'active' ? 'ACTIVE' : 'BLOCKED'}
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.collegeEmail}>{item.email}</Text>

                <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
                    <View style={styles.infoBadge}>
                        <Text style={styles.infoText}>₹{item.subscriptionPrice}</Text>
                    </View>
                    <View style={[styles.infoBadge, { backgroundColor: item.subscriptionStatus === 'paid' ? '#E8F5E9' : '#FFF3E0' }]}>
                        <Text style={[styles.infoText, { color: item.subscriptionStatus === 'paid' ? '#2E7D32' : '#EF6C00' }]}>
                            {item.subscriptionStatus?.toUpperCase() || 'PENDING'}
                        </Text>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconBtn}>
                        <Ionicons name="pencil-outline" size={18} color="#546E7A" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteCollege(item._id)} style={styles.iconBtn}>
                        <Ionicons name="trash-outline" size={18} color="#546E7A" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.superTitle}>SUPER ADMIN</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.title}>Manage Colleges</Text>
                    <TouchableOpacity style={styles.searchBtn}>
                        <Ionicons name="search" size={20} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={colleges}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No colleges found</Text>}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Floating Action Button for Add */}
            <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={styles.modalIconBox}>
                                    <Ionicons name="school" size={20} color="#000" />
                                </View>
                                <Text style={styles.modalTitle}>{editingCollege ? 'Edit College' : 'Add New College'}</Text>
                            </View>
                            <TouchableOpacity onPress={closeModal}>
                                <Ionicons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>Enter the institutional credentials to register a new campus.</Text>

                        <Text style={styles.label}>College Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Stanford University"
                            value={newCollegeName}
                            onChangeText={setNewCollegeName}
                        />

                        <Text style={styles.label}>Admin Email</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={[styles.input, { marginBottom: 0, borderWidth: 0, flex: 1 }]}
                                placeholder="admin@college.edu"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={newCollegeEmail}
                                onChangeText={setNewCollegeEmail}
                            />
                            <Ionicons name="at" size={20} color="#999" />
                        </View>

                        {!editingCollege && (
                            <>
                                <Text style={styles.label}>Access Password</Text>
                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        style={[styles.input, { marginBottom: 0, borderWidth: 0, flex: 1 }]}
                                        placeholder="••••••••"
                                        secureTextEntry
                                        value={newCollegePassword}
                                        onChangeText={setNewCollegePassword}
                                    />
                                    <Ionicons name="eye" size={20} color="#999" />
                                </View>
                            </>
                        )}

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Sub. Price (₹)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="5000"
                                    keyboardType="numeric"
                                    value={subPrice}
                                    onChangeText={setSubPrice}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>Duration (Mon)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="12"
                                    keyboardType="numeric"
                                    value={subDuration}
                                    onChangeText={setSubDuration}
                                />
                            </View>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveCollege}>
                                <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 5 }} />
                                <Text style={styles.saveText}>Save College</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
    },
    superTitle: {
        color: '#26C6DA',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 5
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#263238',
    },
    searchBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center', alignItems: 'center'
    },
    list: {
        padding: 20,
        paddingBottom: 100 // Space for bottom bar
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginBottom: 15,
        flexDirection: 'row',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        alignItems: 'flex-start'
    },
    logoContainer: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#ECEFF1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    cardContent: {
        flex: 1,
    },
    collegeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#263238',
        flex: 1,
        marginRight: 10
    },
    collegeEmail: {
        fontSize: 14,
        color: '#78909C',
        marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 5
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold'
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
        gap: 10
    },
    iconBtn: {
        width: 35,
        height: 35,
        borderRadius: 10,
        backgroundColor: '#F5F7FA',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 85,
        right: 25,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#009688',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#009688',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 }
    },


    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 30,
        minHeight: 500
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    modalIconBox: {
        marginRight: 10
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#263238'
    },
    modalSubtitle: {
        color: '#78909C',
        marginBottom: 25,
        fontSize: 14
    },
    label: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#37474F',
        marginBottom: 8
    },
    input: {
        backgroundColor: '#F5F7FA',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        fontSize: 16,
        color: '#333'
    },
    inputWrapper: {
        backgroundColor: '#F5F7FA',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        height: 52
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
        marginRight: 10
    },
    saveButton: {
        flex: 1.5,
        backgroundColor: '#26C6DA',
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    cancelText: {
        color: '#546E7A',
        fontWeight: 'bold',
        fontSize: 16,
    },
    saveText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    infoBadge: {
        backgroundColor: '#F0F2F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    infoText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#546E7A',
    }
});
