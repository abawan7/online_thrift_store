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
import { View, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import eventEmitter from './utils/EventEmitter';

const Stack = createStackNavigator();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Helper function to calculate distance using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Helper function to extract keywords from text
const extractKeywordsFromText = (text) => {
  if (!text) return [];
  const words = text.toLowerCase().split(/\s+/);
  const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'about', 'want', 'one', 'need'];
  return words.filter(word => word.length > 3 && !commonWords.includes(word));
};

// Helper function to geocode location
const geocodeLocation = async (locationText) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationText)}`
    );
    if (response.data && response.data.length > 0) {
      return {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Error geocoding location:', error);
    return null;
  }
};

// Helper function to show welcome notification
const showWelcomeNotification = async (userName) => {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Welcome Back! 👋',
                body: `Great to see you, ${userName}! We'll notify you when matching items are nearby.`,
                data: { type: 'welcome' },
            },
            trigger: null, // Show immediately
        });
        console.log('Welcome notification sent successfully');
    } catch (error) {
        console.error('Error sending welcome notification:', error);
    }
};

// Function to fetch user profile data
const fetchUserProfile = async (userId, token) => {
    try {
        console.log('Fetching user profile data...');
        console.log('User ID:', userId);
        console.log('Token:', token ? 'Present' : 'Missing');

        const response = await axios.get(
            `${Constants.expoConfig.extra.API_URL}/api/getUserProfile`, 
            {
                params: { user_id: userId },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Profile data fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
        throw error;
    }
};

export default function AppNavigator() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [userToken, setUserToken] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [notifiedSellers, setNotifiedSellers] = useState(new Set());
    const [lastNotificationLocation, setLastNotificationLocation] = useState(null);
    const locationSubscriptionRef = React.useRef(null);

    // Function to check if user is authenticated
    const isAuthenticated = async () => {
        const token = await AsyncStorage.getItem('userToken');
        return !!token;
    };

    // Function to handle unauthorized access
    const handleUnauthorizedAccess = (navigation) => {
        Alert.alert(
            "Authentication Required",
            "Please log in to access this feature.",
            [
                { 
                    text: "Login", 
                    onPress: () => navigation.navigate('Login')
                }
            ]
        );
    };

    // Notification handler setup
    useEffect(() => {
        const notificationHandler = async () => {
            const subscription = Notifications.addNotificationReceivedListener(async notification => {
                const isLoggedIn = await isAuthenticated();
                if (!isLoggedIn) {
                    console.log('Notification received but user not logged in, ignoring');
                    return;
                }

                const currentUserId = await AsyncStorage.getItem('user_id');
                const notificationData = notification.request.content.data;

                // Only process notifications intended for the current user
                if (notificationData.targetUserId === currentUserId) {
                    console.log('Processing notification for current user:', currentUserId);
                    // Process the notification
                } else {
                    console.log('Notification not intended for current user, ignoring');
                }
            });

            return () => subscription.remove();
        };

        notificationHandler();
    }, []);

    // Function to check if location has changed significantly (more than 100 meters)
    const hasLocationChangedSignificantly = (oldLocation, newLocation) => {
        if (!oldLocation) return true;
        
        const distance = calculateDistance(
            oldLocation.latitude,
            oldLocation.longitude,
            newLocation.latitude,
            newLocation.longitude
        );
        
        // Return true if moved more than 0.1 km (100 meters)
        return distance > 0.1;
    };

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

    // Function to match wishlist items with listings
    const matchWishlistWithListings = async (wishlistItems, listings) => {
        console.log('\n=== WISHLIST MATCHING RESULTS ===');
        console.log('Wishlist Items:', wishlistItems);
        console.log('Matched Listings:', listings.filter(listing => 
            wishlistItems.some(item => {
                const keywords = extractKeywordsFromText(item);
                return keywords.some(keyword => 
                    listing.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    listing.description.toLowerCase().includes(keyword.toLowerCase())
                );
            })
        ));

        const matchedListings = [];
        const processedSellers = new Set();

        // Process each wishlist item
        for (const wishlistItem of wishlistItems) {
            const keywords = extractKeywordsFromText(wishlistItem);

            // Check each listing for matches
            for (const listing of listings) {
                // Skip if seller already processed
                if (processedSellers.has(listing.user_email)) continue;

                // Check if the listing matches any of the keywords
                const hasMatch = keywords.some(keyword => 
                    listing.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    listing.description.toLowerCase().includes(keyword.toLowerCase())
                );

                if (hasMatch) {
                    // Geocode the listing's location
                    const coordinates = await geocodeLocation(listing.location);

                    if (coordinates) {
                        matchedListings.push({
                            ...listing,
                            coordinates,
                            matchedKeywords: keywords.filter(keyword => 
                                listing.name.toLowerCase().includes(keyword.toLowerCase()) ||
                                listing.description.toLowerCase().includes(keyword.toLowerCase())
                            )
                        });
                        processedSellers.add(listing.user_email);
                    }
                }
            }
        }

        // Store matched listings in AsyncStorage
        await AsyncStorage.setItem('matchedListings', JSON.stringify(matchedListings));
        
        return matchedListings;
    };

    // Modified checkNearbyMatches function
    const checkNearbyMatches = async (coords) => {
        try {
            const currentUserId = await AsyncStorage.getItem('user_id');
            if (!currentUserId) return;

            if (hasLocationChangedSignificantly(lastNotificationLocation, coords)) {
                setNotifiedSellers(new Set());
                setLastNotificationLocation(coords);
            }
            
            const storedMatches = await AsyncStorage.getItem('matchedListings');
            if (!storedMatches) return;

            const matches = JSON.parse(storedMatches);
            console.log('\n=== NEARBY MATCHES ===');
            console.log('Current Location:', coords);
            console.log('Matched Items:', matches);
            
            const nearbySellers = matches.filter(match => {
                if (!match.coordinates) return false;
                if (match.seller_id?.toString() === currentUserId) return false;

                const distance = calculateDistance(
                    coords.latitude,
                    coords.longitude,
                    match.coordinates.latitude,
                    match.coordinates.longitude
                );
                
                return distance <= 5;
            });

            for (const seller of nearbySellers) {
                const distance = calculateDistance(
                    coords.latitude,
                    coords.longitude,
                    seller.coordinates.latitude,
                    seller.coordinates.longitude
                );

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: 'Matching Seller Nearby!',
                        body: `${seller.user_name} is ${distance.toFixed(1)} km away. They have ${seller.name} matching your wishlist!`,
                        data: { 
                            sellerId: seller.user_email,
                            listingId: seller.listing_id,
                            sellerUserId: seller.seller_id,
                            targetUserId: currentUserId
                        },
                    },
                    trigger: null,
                });
                
                setNotifiedSellers(prev => new Set([...prev, seller.user_email]));
            }
        } catch (error) {
            console.error('Error in checkNearbyMatches:', error);
        }
    };

    // Initialize location tracking
    const initializeLocationTracking = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Location permission denied');
                return;
            }

            // Get initial location
            const initialLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High
            });
            
            setUserLocation(initialLocation.coords);
            setLastNotificationLocation(initialLocation.coords);

            // Start watching position with more frequent updates
            const subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000, // Check every 5 seconds
                    distanceInterval: 50, // Or when moved 50 meters
                },
                (location) => {
                    setUserLocation(location.coords);
                    checkNearbyMatches(location.coords);
                }
            );

            locationSubscriptionRef.current = subscription;
        } catch (error) {
            console.error('Error initializing location tracking:', error);
        }
    };

    // Initialize app
    useEffect(() => {
        const initialize = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');

                const loginListener = async (event) => {
                    const newToken = await AsyncStorage.getItem('userToken');
                    
                    if (newToken) {
                        setUserToken(newToken);

                        try {
                            const userName = await AsyncStorage.getItem('user_name');
                            await showWelcomeNotification(userName || 'there');

                            try {
                                const userId = await AsyncStorage.getItem('user_id');
                                
                                const wishlistResponse = await axios.get(
                                    `${Constants.expoConfig.extra.API_URL}/wishlist/${userId}`,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${newToken}`,
                                            'Content-Type': 'application/json'
                                        }
                                    }
                                );

                                const listingsResponse = await axios.get(
                                    `${Constants.expoConfig.extra.API_URL}/listings`,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${newToken}`,
                                            'Content-Type': 'application/json'
                                        }
                                    }
                                );

                                if (wishlistResponse.data && listingsResponse.data) {
                                    await matchWishlistWithListings(wishlistResponse.data.products || [], listingsResponse.data);
                                }
                            } catch (error) {
                                console.error('Error fetching data:', error.response?.data || error.message);
                            }

                            await initializeLocationTracking();
                        } catch (error) {
                            console.error('Error during post-login initialization:', error);
                        }
                    }
                };

                const subscription = eventEmitter.addListener('LOGIN_SUCCESS', loginListener);

                if (token) {
                    setUserToken(token);

                    try {
                        const userId = await AsyncStorage.getItem('user_id');
                        
                        const wishlistResponse = await axios.get(
                            `${Constants.expoConfig.extra.API_URL}/wishlist/${userId}`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        const listingsResponse = await axios.get(
                            `${Constants.expoConfig.extra.API_URL}/listings`,
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        if (wishlistResponse.data && listingsResponse.data) {
                            await matchWishlistWithListings(wishlistResponse.data.products || [], listingsResponse.data);
                        }

                        await initializeLocationTracking();
                    } catch (error) {
                        console.error('Error during initialization with existing token:', error);
                    }
                }

                return () => {
                    subscription.remove();
                };
            } catch (error) {
                console.error('Error during initialization:', error);
            }
        };

        initialize();

        return () => {
            if (locationSubscriptionRef.current) {
                locationSubscriptionRef.current.remove();
            }
        };
    }, []);

    useEffect(() => {
        // Fetch data whenever refreshTrigger changes
        fetchData();
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
                
                {/* Protected Routes */}
                <Stack.Screen
                    name="Home"
                    component={HomeView}
                    options={{
                        headerShown: false
                    }}
                    listeners={({ navigation }) => ({
                        beforeRemove: async (e) => {
                            if (!(await isAuthenticated())) {
                                e.preventDefault();
                                handleUnauthorizedAccess(navigation);
                            }
                        }
                    })}
                    initialParams={{ 
                        data: data, 
                        loading: loading,
                        onRefresh: () => refreshData() 
                    }}
                />

                <Stack.Screen 
                    name="NotificationScreen"
                    component={Notification}
                    options={{ headerTitle: 'Notifications' }}
                    listeners={({ navigation }) => ({
                        beforeRemove: async (e) => {
                            if (!(await isAuthenticated())) {
                                e.preventDefault();
                                handleUnauthorizedAccess(navigation);
                            }
                        }
                    })}
                />

                {/* Other protected screens with similar authentication checks */}
                <Stack.Screen 
                    name="ViewProduct" 
                    component={ViewProductScreen}
                    listeners={({ navigation }) => ({
                        beforeRemove: async (e) => {
                            if (!(await isAuthenticated())) {
                                e.preventDefault();
                                handleUnauthorizedAccess(navigation);
                            }
                        }
                    })}
                />
                
                {/* Add similar authentication checks for other protected routes */}
                <Stack.Screen name="SellerProfile" component={SellerProfileView} />
                <Stack.Screen name="Wishlist" component={WishtListView} />
                <Stack.Screen name="Inventory" component={InventoryView} />
                <Stack.Screen name="chatbot" component={ChatbotView} />
                <Stack.Screen 
                    name="Profile" 
                    component={ProfileView}
                    listeners={({ navigation }) => ({
                        beforeRemove: async (e) => {
                            if (!(await isAuthenticated())) {
                                e.preventDefault();
                                handleUnauthorizedAccess(navigation);
                            }
                        },
                        focus: async () => {
                            try {
                                const token = await AsyncStorage.getItem('userToken');
                                const userId = await AsyncStorage.getItem('user_id');
                                
                                if (!token || !userId) {
                                    handleUnauthorizedAccess(navigation);
                                    return;
                                }

                                const profileData = await fetchUserProfile(userId, token);
                                // Pass the fetched profile data to the screen
                                navigation.setParams({ profileData });
                            } catch (error) {
                                console.error('Error loading profile:', error);
                                Alert.alert(
                                    "Error",
                                    "Unable to load profile data. Please try again.",
                                    [
                                        {
                                            text: "Retry",
                                            onPress: () => navigation.navigate('Profile')
                                        },
                                        {
                                            text: "Go Back",
                                            onPress: () => navigation.goBack()
                                        }
                                    ]
                                );
                            }
                        }
                    })}
                />
                <Stack.Screen name="editprofile" component={EditProfileView} />
                <Stack.Screen name="UploadItem" component={UploadItemView} />
                <Stack.Screen name="EditItem" component={EditItemView} />
                <Stack.Screen name="AddLocation" component={AddLocation} />
                <Stack.Screen name="Chats" component={ChatsView} />
                <Stack.Screen name="Chat" component={ChatView} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    noItemsText: {
        textAlign: 'center',
        padding: 20,
        color: '#666',
        fontStyle: 'italic',
    },
});
