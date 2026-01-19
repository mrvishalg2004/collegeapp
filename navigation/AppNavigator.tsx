import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { AuthService } from '../services/auth.service';

// Admin Screens
import AdminDashboard from '../screens/AdminDashboard';
import CollegeList from '../screens/CollegeList';
import EventMonitor from '../screens/EventMonitor';
import SystemReports from '../screens/SystemReports';

// College Screens
import CollegeDashboard from '../screens/CollegeDashboard';
import ManageDepartments from '../screens/ManageDepartments';
import ManageEvents from '../screens/ManageEvents';
import ManageCoordinators from '../screens/ManageCoordinators';
import VerifyPayments from '../screens/VerifyPayments';
import PaymentHistory from '../screens/PaymentHistory';
import EventRegistrations from '../screens/EventRegistrations';

// Coordinator Screens
import CoordDashboard from '../screens/CoordDashboard';
import EventAttendance from '../screens/EventAttendance';

// Student Screens
import StudentDashboard from '../screens/StudentDashboard';
import EventDetails from '../screens/EventDetails';
import MyCertificates from '../screens/MyCertificates';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

import { useAuth } from '../context/AuthContext';

// ... (imports remain)

export default function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Define screen groups based on role/auth status could be done here.
    // For simplicity, we'll put all in one stack and navigate. 
    // Ideally, use conditional rendering: { user ? <AppStack /> : <AuthStack /> }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    // Authenticated Stacks (Placeholder for now, redirect logic needed)
                    <Stack.Screen name="Main" component={
                        user.role === 'admin' ? AdminStack :
                            user.role === 'college' ? CollegeStack :
                                user.role === 'coordinator' ? CoordStack :
                                    StudentStack
                    } />
                ) : (
                    // Auth Stack
                    <Stack.Group>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </Stack.Group>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

// Stacks
const AdminStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="CollegeList" component={CollegeList} />
        <Stack.Screen name="EventMonitor" component={EventMonitor} />
        <Stack.Screen name="SystemReports" component={SystemReports} />
    </Stack.Navigator>
);

const CollegeStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CollegeDashboard" component={CollegeDashboard} />
        <Stack.Screen name="ManageDepartments" component={ManageDepartments} />
        <Stack.Screen name="ManageEvents" component={ManageEvents} />
        <Stack.Screen name="ManageCoordinators" component={ManageCoordinators} />
        <Stack.Screen name="VerifyPayments" component={VerifyPayments} />
        <Stack.Screen name="PaymentHistory" component={PaymentHistory} />
        <Stack.Screen name="EventRegistrations" component={EventRegistrations} />
    </Stack.Navigator>
);

const CoordStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CoordDashboard" component={CoordDashboard} />
        <Stack.Screen name="EventAttendance" component={EventAttendance} />
        <Stack.Screen name="VerifyPayments" component={VerifyPayments} />
    </Stack.Navigator>
);

const StudentStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
        <Stack.Screen name="EventDetails" component={EventDetails} />
        <Stack.Screen name="MyCertificates" component={MyCertificates} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
);

// Temporary Placeholders
// const AdminPlaceholder = () => <View><ActivityIndicator /></View>;
// const CollegePlaceholder = () => <View><ActivityIndicator /></View>;
// const CoordPlaceholder = () => <View><ActivityIndicator /></View>;
// const StudentPlaceholder = () => <View><ActivityIndicator /></View>;
