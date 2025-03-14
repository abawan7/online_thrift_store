import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Switch } from 'react-native';
import Header from './Header';
import Footer from './FooterView';
import { Ionicons } from '@expo/vector-icons';  // For icons
import Wishlistcontroller from '../controllers/WishlistController';  // Import the AuthController
import AuthController from '../controllers/AuthController';  // Import the AuthController
import { useNavigation } from '@react-navigation/native';  // Impor

const ProfileView = () => {
    const [isSeller, setIsSeller] = useState(false);
    const navigation = useNavigation();  // Initialize navigation 
    
    const handleToggle = (value) => {
      setIsSeller(value);
    };

    return (
        <View style={styles.container}>
            <Header title="Online Thrift Store" />
            <ScrollView style={styles.content}>
                <View style={styles.profileContainer}>
                    <View style={styles.profileInfo}>
                        <View style={styles.profilePicContainer}>
                            <Image 
                                source={{ uri: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg' }} // Use real image URL
                                style={styles.profilePic} 
                            />
                            <TouchableOpacity style={styles.cameraIcon}>
                                <Ionicons name="camera" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>Ifra Ejaz</Text>
                        <Text style={styles.email}>ifraeajz07@gmail.com</Text>
                        
                        {/* Edit Profile Button */}
                        <TouchableOpacity style={styles.editProfileBtn}>
                            <Text style={styles.editText}>Edit Profile</Text>
                        </TouchableOpacity>

                         {/* Toggle Switch instead of "Switch to Seller" Button */}
                         <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>Switch to {isSeller ? 'Buyer' : 'Seller'}</Text>
                            <Switch 
                                value={isSeller} 
                                onValueChange={handleToggle} 
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.menuItems}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="heart-outline" size={24} color="black" />
                        <Text style={styles.menuItemText}>Favourites</Text>
                    </TouchableOpacity>
                    <View style={styles.separator}></View>
                    
                    <TouchableOpacity style={styles.menuItem}  onPress={() => navigation.navigate('Wishlist')}>
                        <Ionicons name="bag-outline" size={24} color="black" />
                        <Text style={styles.menuItemText}>Wishlist Items</Text>
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
            <Footer />
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
    profileInfo: {
        alignItems: 'center',
        marginBottom: 20,
        width: '100%', // Ensure the profile section spans the full width
        paddingLeft: 15, // Add some padding for better spacing
    },
    profilePicContainer: {
        position: 'relative', // To position the camera icon over the profile picture
        marginBottom: 15,
        
    },
    profilePic: {
        width: 70, // Adjust the size to match the new design
        height: 70,
        borderRadius: 35,
        alignSelf: 'flex-start', // Align the profile picture to the left
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent dark background
        borderRadius: 50,
        padding: 5,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
    },
    editProfileBtn: {
        marginTop: 10,
        paddingVertical: 5,
        paddingHorizontal: 30,
        backgroundColor: '#4F9BFF',  // Light blue color for Edit Profile
        borderRadius: 25,            // Rounded corners
        width: '40%',
        alignItems: 'center',
        marginBottom: 15,
    },
    editText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    switchLabel: {
        fontSize: 14,
        marginRight: 10,
    },
    menuItems: {
        marginTop: 20,
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
      backgroundColor: '#ccc', // The color of the divider line
      marginVertical: 10, // Adds space between menu items and the line
    }
});

export default ProfileView;
