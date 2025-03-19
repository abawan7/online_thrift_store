import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';  
import axios from 'axios';  // Import axios for HTTP requests
import AsyncStorage from '@react-native-async-storage/async-storage';  // For storing JWT token
import Header from './Header';
import Footer from './FooterView';

const ProfileView = ({ navigation }) => {
    const [isSeller, setIsSeller] = useState(false);
    const [userData, setUserData] = useState(null);  // State to hold the user data
    const [loading, setLoading] = useState(true);  // Loading state while fetching data

    const handleToggle = () => {
        setIsSeller(!isSeller);
    };

    useEffect(() => {
        // Function to fetch user data from API
        const fetchUserData = async () => {
            try {
                // Get the token from AsyncStorage
                const token = await AsyncStorage.getItem('token');

                if (token) {
                    // Make API call to fetch user profile data
                    const response = await axios.get('http://localhost:3000/getUserProfile', {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    // Set user data after the response
                    setUserData(response.data.user);
                    setLoading(false);  // Set loading to false after data is fetched
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                setLoading(false);  // Set loading to false even if there's an error
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <Text>Loading...</Text>;  // Show loading text while fetching data
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
                            <Text style={styles.userName}>{userData.name}</Text>
                            <Text style={styles.email}>{userData.email}</Text>
                        </View>
                    </View>

                    <View style={styles.ButtonRow}>
                        <TouchableOpacity style={styles.editProfileBtn} onPress={() => navigation.navigate('editprofile')}>
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
                    
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Login')}>
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
    }
});

export default ProfileView;
