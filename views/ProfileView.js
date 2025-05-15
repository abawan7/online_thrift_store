import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';  
import axios from 'axios';  // Import axios for HTTP requests
// For storing JWT token
import Header from './Header';
import Constants from 'expo-constants';
import Footer from './FooterView';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Import AsyncStorage
import { useNavigation, useRoute } from '@react-navigation/native';

const ProfileView = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [isSeller, setIsSeller] = useState(false);
    const [userData, setUserData] = useState(null);  // State to hold the user data
    const [loading, setLoading] = useState(true);  // Loading state while fetching data
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication status
    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userId = await AsyncStorage.getItem('user_id');
            
            if (!token || !userId) {
                console.log('No token or userId found');
                setIsAuthenticated(false);
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
                return false;
            }
            
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Error checking authentication:', error);
            setIsAuthenticated(false);
            return false;
        }
    };

    const handleToggle = async () => {
        if (!isAuthenticated) {
            Alert.alert(
                "Authentication Required",
                "Please log in to access this feature.",
                [{ text: "OK", onPress: () => navigation.navigate('Login') }]
            );
            return;
        }

        try {
            // Get current access level
            const accessLevel = userData?.access_level;
            
            // If trying to switch to seller mode
            if (!isSeller) {
                if (accessLevel === 1) {
                    // User with access level 1 needs to add location first
                    navigation.navigate('AddLocation');
                    return;
                } else if (accessLevel === 2) {
                    // User with access level 2 can freely switch to seller
                    setIsSeller(true);
                    await AsyncStorage.setItem('role', 'seller');
                }
            } else {
                // Switching back to buyer mode is always allowed
                setIsSeller(false);
                await AsyncStorage.setItem('role', 'buyer');
            }
        } catch (error) {
            console.error('Error updating role:', error);
            Alert.alert(
                "Error",
                "Failed to update role. Please try again.",
                [{ text: "OK" }]
            );
        }
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError(null);

                // Check authentication first
                const isAuthed = await checkAuth();
                if (!isAuthed) {
                    setError('Authentication required');
                    return;
                }

                // Get token and user ID
                const token = await AsyncStorage.getItem('userToken');
                const userId = await AsyncStorage.getItem('user_id');

                // Get profile data from navigation params or fetch it
                let data = route.params?.profileData;
                if (!data) {
                    try {
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
                        data = response.data;
                    } catch (error) {
                        console.error('Error fetching profile data:', error);
                        if (error.response?.status === 401) {
                            setError('Authentication required');
                            navigation.navigate('Login');
                            return;
                        }
                        throw error;
                    }
                }

                console.log('Profile data received:', data);
                setUserData(data.user);
                
                // Store user data in AsyncStorage for edit profile
                await AsyncStorage.setItem('userData', JSON.stringify({
                    firstName: data.user.name.split(' ')[0],
                    lastName: data.user.name.split(' ').slice(1).join(' '),
                    username: data.user.name,
                    email: data.user.email,
                    phone: data.user.phone
                }));

                // Check access level
                if (data.user.access_level < 1) {
                    setError('Insufficient access rights');
                    Alert.alert(
                        "Access Denied",
                        "You don't have sufficient permissions to view this profile.",
                        [{ text: "OK", onPress: () => navigation.goBack() }]
                    );
                    return;
                }

            } catch (error) {
                console.error('Error loading profile:', error);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();

        // Add focus listener to reload profile when screen is focused
        const unsubscribe = navigation.addListener('focus', loadProfile);
        return unsubscribe;
    }, [route.params, navigation]);

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00494D" />
                <Text>Loading profile...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header title="Online Thrift Store" />
            <ScrollView style={styles.content}>
                <View style={styles.profileContainer}>
                    <View style={styles.profileRow}>
                        {/* Profile Image Section */}
                        <View style={styles.profilePicContainer}>
                            <Image 
                                source={{ uri: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg' }} 
                                style={styles.profilePic} 
                            />
                            <TouchableOpacity style={styles.cameraIcon}>
                                <Ionicons name="camera" size={16} color="white" />
                            </TouchableOpacity>
                        </View>

                        {/* Name and Email Section */}
                        <View style={styles.profileDetails}>
                            <Text style={styles.userName}>{userData?.name || 'User'}</Text>
                            <Text style={styles.email}>{userData?.email || 'No email available'}</Text>
                            <Text style={styles.phone}>{userData?.phone || 'No phone available'}</Text>
                        </View>
                    </View>

                    <View style={styles.ButtonRow}>
                        <TouchableOpacity style={styles.editProfileBtn} onPress={() => navigation.navigate('editprofile', { profileData: userData })}>
                            <Text style={styles.editText}>Edit Profile</Text>
                        </TouchableOpacity>

                        {/* Button That Toggles Seller/Buyer Mode */}
                        <TouchableOpacity 
                            style={styles.switchProfileBtn} 
                            onPress={handleToggle} // Toggle function
                        >
                            <Text style={styles.switchLabel}>
                                Switch to {isSeller ? 'Buyer' : 'Seller'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* The rest of the menu items... */}
                <View style={styles.menuItems}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="heart-outline" size={24} color="black" />
                        <Text style={styles.menuItemText}>Favourites</Text>
                    </TouchableOpacity>
                    <View style={styles.separator}></View>
                    
                    {/* Conditionally Render Wishlist or Inventory */}
                    <TouchableOpacity 
                        style={styles.menuItem}  
                        onPress={() => navigation.navigate(isSeller ? 'Inventory' : 'Wishlist')}
                    >
                        <Ionicons 
                            name={isSeller ? "layers-outline" : "bag-outline"} 
                            size={24} 
                            color="black" 
                        />
                        <Text style={styles.menuItemText}>
                            {isSeller ? 'Inventory' : 'Wishlist Items'}
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="notifications-outline" size={24} color="black" />
                        <Text style={styles.menuItemText}>Notification Setting</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="settings-outline" size={24} color="black" />
                        <Text style={styles.menuItemText}>Settings</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.separator}></View>
                    
                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="black" />
                        <Text style={styles.menuItemText}>Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <Footer isSeller={isSeller} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 15,
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileRow: {
        flexDirection: 'row', 
        alignItems: 'center',
        width: '100%',
    },
    profilePicContainer: {
        position: 'relative',
        marginRight: 15, 
    },
    ButtonRow: {
        flexDirection: 'row', 
        alignItems: 'center',
        width: '100%',
    },
    profilePic: {
        width: 70, 
        height: 70,
        borderRadius: 35,
        alignSelf: 'flex-start', 
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        borderRadius: 20,
        padding: 4,
    },
    profileDetails: {
        justifyContent: 'center',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 14,
        color: '#888',
    },
    phone: {
        fontSize: 14,
        color: '#888',
    },
    editProfileBtn: {
        marginTop: 10,
        paddingVertical: 5,
        paddingHorizontal: 20,
        backgroundColor: '#4F9BFF',
        borderRadius: 20,
        alignSelf: 'flex-start', 
        marginLeft: 80,
    },
    editText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    switchProfileBtn: {
        marginLeft: 10,
        marginTop: 10,
        paddingVertical: 5, 
        paddingHorizontal: 20, 
        backgroundColor: '#1A434E',
        borderRadius: 20,
        alignSelf: 'flex-start', 
    },
    switchLabel: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    menuItems: {
        marginTop: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    menuItemText: {
        fontSize: 16,
        marginLeft: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#ccc', 
        marginVertical: 10, 
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#4F9BFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ProfileView;
