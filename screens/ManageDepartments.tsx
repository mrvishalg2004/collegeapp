import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CollegeService } from '../services/college.service';
import { AuthService } from '../services/auth.service';
import { IDepartment } from '../types';

export default function ManageDepartments({ navigation }: any) {
    const [departments, setDepartments] = useState<IDepartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newDeptName, setNewDeptName] = useState('');
    const [user, setUser] = useState<any>(null);

    const [editingDept, setEditingDept] = useState<IDepartment | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const u = await AuthService.getCurrentUser();
            setUser(u);
            if (u?.collegeId) {
                const data = await CollegeService.getDepartments(u.collegeId);
                setDepartments(data as IDepartment[]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    const handleSaveDept = async () => {
        if (!newDeptName) return;

        try {
            if (editingDept) {
                await CollegeService.updateDepartment(editingDept._id, newDeptName);
                Alert.alert("Success", "Department Updated");
            } else {
                await CollegeService.addDepartment({ name: newDeptName });
                Alert.alert("Success", "Department Added");
            }
            closeModal();
            loadData();
        } catch (error) {
            Alert.alert("Error", (error as any).response?.data?.message || "Failed");
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert("Confirm Delete", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await CollegeService.deleteDepartment(id);
                        loadData();
                    } catch (e) { Alert.alert("Error", "Failed to delete"); }
                }
            }
        ]);
    };

    const openEdit = (dept: IDepartment) => {
        setEditingDept(dept);
        setNewDeptName(dept.name);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingDept(null);
        setNewDeptName('');
    };

    const renderItem = ({ item }: { item: IDepartment }) => (
        <View style={styles.card}>
            <Text style={styles.deptName}>{item.name}</Text>
            <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => openEdit(item)} style={{ marginRight: 15 }}>
                    <Ionicons name="pencil-outline" size={20} color="#2196F3" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)}>
                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="chevron-back" size={24} color="#007AFF" />
                    <Text style={{ fontSize: 17, color: '#007AFF', marginLeft: 5 }}>Admin</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Departments</Text>
                <TouchableOpacity>
                    <Ionicons name="search" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Top Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>TOTAL DEPTS</Text>
                        <Text style={styles.statValue}>{departments.length}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>ACTIVE STAFF</Text>
                        <Text style={styles.statValue}>248</Text>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>DEPARTMENT LIST</Text>
                    <Text style={styles.sortText}>Sort by Name</Text>
                </View>

                {loading ? (
                    <ActivityIndicator style={{ marginTop: 20 }} color="#007AFF" />
                ) : (
                    <View>
                        {departments.map((item) => (
                            <View key={item._id} style={styles.card}>
                                <View style={styles.cardIcon}>
                                    <Ionicons name="business" size={24} color="#00796B" />
                                </View>
                                <View style={styles.cardInfo}>
                                    <Text style={styles.deptName}>{item.name}</Text>
                                    <Text style={styles.deptMeta}>Dr. Sarah Miller • 142 Students</Text>
                                </View>
                                <View style={styles.cardActions}>
                                    <TouchableOpacity onPress={() => openEdit(item)} style={styles.actionBtn}>
                                        <Ionicons name="pencil" size={20} color="#90A4AE" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionBtn}>
                                        <Ionicons name="trash" size={20} color="#90A4AE" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                        {departments.length === 0 && <Text style={styles.emptyText}>No departments found</Text>}
                    </View>
                )}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingDept ? 'Edit' : 'Add'} Department</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Department Name"
                            value={newDeptName}
                            onChangeText={setNewDeptName}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={closeModal}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSaveDept}>
                                <Text style={{ color: '#fff' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        paddingTop: 10,
        paddingBottom: 15,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    content: { padding: 20, paddingBottom: 100 },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#90A4AE',
        marginBottom: 8,
        letterSpacing: 1,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#263238',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#90A4AE',
        letterSpacing: 1,
    },
    sortText: {
        fontSize: 13,
        color: '#00B0FF',
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 5,
        elevation: 1,
    },
    cardIcon: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: '#E0F2F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    cardInfo: {
        flex: 1,
    },
    deptName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#263238',
        marginBottom: 4,
    },
    deptMeta: {
        fontSize: 13,
        color: '#78909C',
    },
    cardActions: {
        flexDirection: 'row',
    },
    actionBtn: {
        padding: 8,
        marginLeft: 5,
    },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#00B0FF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00B0FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 30,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 16 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
    btn: { flex: 1, padding: 15, alignItems: 'center', borderRadius: 10, marginHorizontal: 5 },
    cancelBtn: { backgroundColor: '#F5F5F5' },
    saveBtn: { backgroundColor: '#00B0FF' },
});
