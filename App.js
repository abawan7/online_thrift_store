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
import EditItemView from './views/EditItem';
import ChatView from './views/ChatView';
import ChatsView from './views/ChatsView';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Function to fetch data that can be called from other components
    const fetchData = async () => {
        try {
            setLoading(true);
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

    // Function to trigger a refresh from other components
    const refreshData = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    useEffect(() => {
        // Fetch data whenever refreshTrigger changes
        fetchData();
        
        // Initialize location tracking when app starts
        initializeLocationTracking().then(success => {
            if (success) {
                console.log('Location tracking initialized successfully');
            } else {
                console.warn('Failed to initialize location tracking');
            }
        });
    }, [refreshTrigger]);

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
                
                {/* Pass loading state, data, and refresh function as params */}
                <Stack.Screen
                    name="Home"
                    component={HomeView}
                    initialParams={{ data: data, loading: loading, refreshData: refreshData }}
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
                <Stack.Screen 
                    name="UploadItem" 
                    component={UploadItemView} 
                    initialParams={{ refreshData: refreshData }}
                />
                <Stack.Screen 
                    name="EditItem" 
                    component={EditItemView} 
                    initialParams={{ refreshData: refreshData }}
                />
                <Stack.Screen name="AddLocation" component={AddLocation} />
                <Stack.Screen name="Chats" component={ChatsView} />
                <Stack.Screen name="Chat" component={ChatView} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
