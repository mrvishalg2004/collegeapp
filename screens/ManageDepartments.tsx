import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CollegeService } from '../services/college.service';
import { AuthService } from '../services/auth.service';
import { IDepartment } from '../types';

export default function ManageDepartments() {
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
                {/* Back handled by stack/header if default */}
                <Text style={styles.title}>Departments</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={departments}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No departments found</Text>}
                />
            )}

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
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    header: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: { fontSize: 22, fontWeight: 'bold' },
    addButton: {
        backgroundColor: '#4CAF50',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: { padding: 20 },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    deptName: { fontSize: 18, fontWeight: '500' },
    emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 30,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 20 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
    btn: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8, marginHorizontal: 5 },
    cancelBtn: { backgroundColor: '#eee' },
    saveBtn: { backgroundColor: '#4CAF50' },
});
