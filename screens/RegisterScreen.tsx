import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthService } from '../services/auth.service';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const navigation = useNavigation();

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            // Defaulting to 'student' role
            await AuthService.register({ name, email, password, role: 'student' });
            Alert.alert('Success', 'Account created!');
            // Again, needs context update to auto-login or redirect
        } catch (error: any) {
            console.error('Registration Error:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : 'Something went wrong');
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header Back Button */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join Campus Connect</Text>
                </View>

                <View style={styles.card}>
                    {/* Decorative Circle (Simulated) */}
                    <View style={styles.decorativeCircle} />

                    {/* Name Input */}
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="person" size={20} color="#26C6DA" style={styles.inputIconLeft} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your full name"
                            placeholderTextColor="#ccc"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Email Input */}
                    <Text style={styles.label}>College Email</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail" size={20} color="#26C6DA" style={styles.inputIconLeft} />
                        <TextInput
                            style={styles.input}
                            placeholder="name@college.edu"
                            placeholderTextColor="#ccc"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    {/* Password Input */}
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed" size={20} color="#26C6DA" style={styles.inputIconLeft} />
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="#ccc"
                            secureTextEntry={!isPasswordVisible}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                            <Ionicons name={isPasswordVisible ? "eye" : "eye-off"} size={20} color="#26C6DA" style={styles.inputIconRight} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.registerButtonText}>Sign Up</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.footerLink}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginText}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Pagination Dots (Decorative) */}
                <View style={styles.pagination}>
                    <View style={[styles.dot, styles.activeDot]} />
                    <View style={[styles.dot, styles.inactiveDot]} />
                    <View style={[styles.dot, styles.inactiveDot]} />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#00695C', // Dark Cyan
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#536DFE', // Accent Blue
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 25,
        elevation: 10,
        shadowColor: '#26C6DA',
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        position: 'relative',
        overflow: 'hidden',
    },
    decorativeCircle: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#E0F7FA', // Very light cyan
        opacity: 0.5,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#006064',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4F8',
        borderRadius: 15,
        marginBottom: 20,
        paddingHorizontal: 15,
        height: 55,
        borderWidth: 1,
        borderColor: '#ECEFF1'
    },
    inputIconLeft: {
        marginRight: 10,
    },
    inputIconRight: {
        marginLeft: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    registerButton: {
        backgroundColor: '#26C6DA', // Cyan/Teal
        borderRadius: 15,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#26C6DA',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    registerButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
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
    loginText: {
        color: '#006064',
        fontWeight: 'bold',
        fontSize: 14,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
        gap: 8
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        backgroundColor: '#26C6DA',
        width: 20,
    },
    inactiveDot: {
        backgroundColor: '#CFD8DC',
    }
});
