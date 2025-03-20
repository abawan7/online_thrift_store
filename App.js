import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import ForgetPasswordView from './views/ForgetPasswordView';
import ChangePasswordView from "./views/ChangePasswordView";
import HomeView from "./views/HomeView";
import WishtListView from "./views/WishlistItemView";
import Notification from './views/NotificationView';
import ChatbotView from './views/ChatbotView';
import ProfileView from './views/ProfileView';
import EditProfileView from './views/EditProfileView';
import UploadItemView from './views/UploadItem';
import AddLocation from './views/AddLocationView';  // Correct import path for AddLocationView.js

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
                <Stack.Screen name="ChangePassword" component={ChangePasswordView} />
                <Stack.Screen name="Home" component={HomeView} />
                <Stack.Screen name="Wishlist" component={WishtListView} />
                <Stack.Screen name="chatbot" component={ChatbotView} />
                <Stack.Screen
                    name="NotificationScreen"
                    component={Notification}
                    options={{ headerTitle: 'Notifications' }}
                />
                <Stack.Screen name="Profile" component={ProfileView} />
                <Stack.Screen name="editprofile" component={EditProfileView} />
                <Stack.Screen name="UploadItem" component={UploadItemView} />
                <Stack.Screen name="AddLocation" component={AddLocation} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
