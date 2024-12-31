import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginView from "./views/LoginView";
import SignupView from "./views/SignupView";
import ForgetPasswordView from './views/ForgetpasswordView';

const Stack = createStackNavigator();

export default function AppNavigator() {
return (
    <NavigationContainer>
      <Stack.Navigator
          initialRouteName="LoginView"
          screenOptions={{
            gestureEnabled: true, // Swipe gestures
            animation: 'slide_from_right', // Transition animation
            headerShown: false, // Hide headers
          }}
      >
        <Stack.Screen name="Login" component={LoginView} />
        <Stack.Screen name="Signup" component={SignupView} />
        <Stack.Screen name="Forgetpassword" component={ForgetPasswordView} />
      </Stack.Navigator>
    </NavigationContainer>
);
}