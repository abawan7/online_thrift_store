import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import ForgetPasswordView from './views/ForgetpasswordView';
import ProximityCheckView from './views/ProximityCheckView'; // Import the new Proximity Check screen

const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    gestureEnabled: true,
                    animation: 'slide_from_right',
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Login" component={LoginView} />
                <Stack.Screen name="Signup" component={SignupView} />
                <Stack.Screen name="Forgetpassword" component={ForgetPasswordView} />
                <Stack.Screen name="ProximityCheck" component={ProximityCheckView} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
