import React, { useState, useEffect } from 'react';
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
import AddLocation from './views/AddLocationView';
import Constants from 'expo-constants';
import { initializeLocationTracking } from './services/AppLocationManager';
import ViewProductScreen from './views/ViewProductScreen';
import SellerProfileView from './views/SellerProfileView';
import InventoryView from './views/InventoryView';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch data
        const fetchData = async () => {
            try {
                const response = await fetch(`${Constants.expoConfig.extra.API_URL}/listings_with_user_and_images`);
                const result = await response.json();
                console.log("result : ", result);
                setData(result);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchData();
        
        // Initialize location tracking when app starts
        initializeLocationTracking().then(success => {
            if (success) {
                console.log('Location tracking initialized successfully');
            } else {
                console.warn('Failed to initialize location tracking');
            }
        });
    }, []);

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
                
                {/* Pass loading state and data as params */}
                <Stack.Screen
                    name="Home"
                    component={HomeView}
                    initialParams={{ data: data, loading: loading }} // Ensure this is passed correctly
                />

                <Stack.Screen name="ViewProduct" component={ViewProductScreen} />
                <Stack.Screen name="SellerProfile" component={SellerProfileView} />
                <Stack.Screen name="Wishlist" component={WishtListView} />
                <Stack.Screen name="Inventory" component={InventoryView} />
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
