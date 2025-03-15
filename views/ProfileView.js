import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Header from './Header';
import Footer from './FooterView';
import { Ionicons } from '@expo/vector-icons';  
import { useNavigation } from '@react-navigation/native';  

const ProfileView = () => {
    const [isSeller, setIsSeller] = useState(false);  
    const navigation = useNavigation();
    
    const handleToggle = () => {
        setIsSeller(!isSeller); // Toggle between seller and buyer mode
    };

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
                            <Text style={styles.userName}>Ifra Ejaz</Text>
                            <Text style={styles.email}>ifraeajz07@gmail.com</Text>
                        </View>
                    </View>

                    <View style={styles.ButtonRow}>
                        <TouchableOpacity style={styles.editProfileBtn}>
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
