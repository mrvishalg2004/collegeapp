
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
                await CollegeService.createCollege({ name: newCollegeName, email: newCollegeEmail, password: newCollegePassword });
                Alert.alert("Success", "College Created");
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
        const newStatus = college.status === 'active' ? 'inactive' : 'active';
        Alert.alert(
            "Confirm Status Change",
            `Change status to ${newStatus}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    onPress: async () => {
                        try {
                            await CollegeService.updateCollege(college._id, { status: newStatus });
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
            "Are you sure? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete", style: 'destructive', onPress: async () => {
                        try {
                            await CollegeService.deleteCollege(id);
                            fetchColleges(); // Refresh list
                            Alert.alert("Success", "College deleted");
                        } catch (error: any) {
                            console.error("Delete failed:", error);
                            Alert.alert("Error", error.response?.data?.message || error.message || "Failed to delete college");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: ICollege }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.collegeName}>{item.name}</Text>
                <Text style={styles.collegeEmail}>{item.email}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <TouchableOpacity onPress={() => handleToggleStatus(item)} style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#E8F5E9' : '#FFEBEE' }]}>
                    <Text style={[styles.statusText, { color: item.status === 'active' ? '#2E7D32' : '#C62828' }]}>{item.status}</Text>
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={{ marginRight: 15 }}>
                        <Ionicons name="pencil-outline" size={20} color="#2196F3" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteCollege(item._id)}>
                        <Ionicons name="trash-outline" size={20} color="#F44336" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => { /* Navigation back handled by stack */ }}>
                    {/* Back button if not using header title */}
                </TouchableOpacity>
                <Text style={styles.title}>Colleges</Text>
                <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
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
                />
            )}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingCollege ? 'Edit College' : 'Add New College'}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="College Name"
                            value={newCollegeName}
                            onChangeText={setNewCollegeName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Admin Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={newCollegeEmail}
                            onChangeText={setNewCollegeEmail}
                        />
                        {!editingCollege && (
                            <TextInput
                                style={styles.input}
                                placeholder="Admin Password"
                                secureTextEntry
                                value={newCollegePassword}
                                onChangeText={setNewCollegePassword}
                            />
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeModal}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveCollege}>
                                <Text style={styles.saveText}>Save</Text>
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
        backgroundColor: '#f0f2f5',
    },
    header: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: '#2196F3',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
    },
    cardContent: {
        flex: 1,
    },
    collegeName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    collegeEmail: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    statusBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: '#2E7D32',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    saveButton: {
        backgroundColor: '#3b5998',
    },
    cancelText: {
        color: '#333',
        fontWeight: '600',
    },
    saveText: {
        color: '#fff',
        fontWeight: '600',
    },
});
