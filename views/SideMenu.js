import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; // Import the useNavigation hook
import AuthController from '../controllers/AuthController';  // Import the AuthController

const SideMenu = ({ slideAnim, toggleMenu, menuWidth }) => {
    const navigation = useNavigation(); // Get the navigation object
    return (
        <Animated.View
            style={[
                styles.sideMenu,
                { transform: [{ translateX: slideAnim }], width: menuWidth },
            ]}
        >
            <TouchableOpacity onPress={toggleMenu}>
                <View style={{ flexDirection: 'row'}}>
                    <Ionicons style={styles.circle} name="menu-outline" size={28} color="Black"/>
                    <Text style={styles.menuTitle}>Hi, Ifra</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="home-outline" size={20} color="white" />
                <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="notifications-outline" size={20} color="white" />
                <Text style={styles.menuText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => AuthController.handleLogout(navigation)} style={styles.menuItem}>
                <Ionicons name="log-out-outline" size={20} color="white" />
                <Text style={styles.menuText}>Log Out</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    sideMenu: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        backgroundColor: '#1A434E',
        padding: 20,
        zIndex: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'ios' ? (StatusBar.currentHeight || 44) + 20 : 25, // Added extra padding for iOS and Android
    },
    menuTitle: {
        marginTop: 5,
        marginLeft: 75,
        marginBottom: 35,
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    menuText: {
        marginLeft: 10,
        fontSize: 16,
        color: 'white',
    },
});

export default SideMenu;