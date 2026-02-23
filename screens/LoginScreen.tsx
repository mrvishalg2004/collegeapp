import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthService } from '../services/auth.service';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('student');
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const navigation = useNavigation<any>();

    const roles = [
        { id: 'student', title: 'Student', icon: 'school', color: '#4CAF50' },
        { id: 'college', title: 'College', icon: 'business', color: '#2196F3' },
        { id: 'coordinator', title: 'Coord', icon: 'people', color: '#FF9800' },
        { id: 'admin', title: 'Super', icon: 'shield-checkmark', color: '#E91E63' }
    ];

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            const user = await AuthService.getCurrentUser();
            if (user && user.role !== selectedRole) {
                Alert.alert('Role Mismatch', `You are logged in as ${user.role}, which is different from your selection (${selectedRole}).`);
            }
        } catch (error) {
            Alert.alert('Login Failed', (error as any).response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.card}>
                    {/* Icon Placeholder */}
                    <View style={styles.iconContainer}>
                        <Ionicons name="school" size={40} color="#1E88E5" />
                    </View>

                    <Text style={styles.title}>EventCraft</Text>
                    <Text style={styles.subtitle}>Choose your role and sign in</Text>

                    {/* Role Selection */}
                    <View style={styles.roleContainer}>
                        {roles.map((role) => (
                            <TouchableOpacity
                                key={role.id}
                                style={[
                                    styles.roleCard,
                                    selectedRole === role.id && { borderColor: role.color, backgroundColor: role.color + '10' }
                                ]}
                                onPress={() => setSelectedRole(role.id)}
                            >
                                <Ionicons
                                    name={role.icon as any}
                                    size={24}
                                    color={selectedRole === role.id ? role.color : '#999'}
                                />
                                <Text style={[
                                    styles.roleText,
                                    selectedRole === role.id && { color: role.color, fontWeight: 'bold' }
                                ]}>
                                    {role.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.form}>
                        {/* Email Input */}
                        <Text style={styles.label}>College Email</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="college.email@edu"
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                            <Ionicons name="at" size={20} color="#999" style={styles.inputIconRight} />
                        </View>

                        {/* Password Input */}
                        <View style={styles.passwordHeader}>
                            <Text style={styles.label}>Password</Text>
                            <TouchableOpacity>
                                <Text style={styles.forgotText}>FORGOT?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#999"
                                secureTextEntry={!isPasswordVisible}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                <Ionicons name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} size={20} color="#999" style={styles.inputIconRight} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <View style={styles.btnContent}>
                                    <Text style={styles.loginButtonText}>Login as {roles.find(r => r.id === selectedRole)?.title}</Text>
                                    <Ionicons name="arrow-forward-circle-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
                                </View>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footerLink}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.signupText}>Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.secureBadge}>
                        <Ionicons name="shield-checkmark" size={14} color="#999" />
                        <Text style={styles.secureText}> Secure SSL</Text>
                    </View>
                    <View style={styles.secureBadge}>
                        <Ionicons name="school-outline" size={14} color="#999" />
                        <Text style={styles.secureText}> Edu Portal</Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA', // Light gray/blueish background
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 30,
        // 3D Shadow Effect
        shadowColor: '#1E88E5',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        alignItems: 'center',
    },
    iconContainer: {
        width: 70,
        height: 70,
        backgroundColor: '#F0F7FF',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1565C0', // Strong Blue
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#78909C',
        marginBottom: 30,
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#455A64',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F4F6F8',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginBottom: 20,
        paddingHorizontal: 15,
        height: 55,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    inputIconRight: {
        marginLeft: 10,
    },
    passwordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    forgotText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#26C6DA', // Teal
        textTransform: 'uppercase',
    },
    loginButton: {
        backgroundColor: '#1976D2', // Darker Blue
        borderRadius: 15,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#1976D2',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    footerText: {
        color: '#78909C',
        fontSize: 14,
    },
    signupText: {
        color: '#26C6DA',
        fontWeight: 'bold',
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
        gap: 20
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        opacity: 0.6
    },
    secureText: {
        color: '#999',
        fontSize: 12,
        fontWeight: '500'
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
        gap: 8
    },
    roleCard: {
        flex: 1,
        backgroundColor: '#F8F9FB',
        borderRadius: 15,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    roleText: {
        fontSize: 10,
        color: '#999',
        marginTop: 5,
    }
});
