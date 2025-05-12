import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AuthController from '../controllers/AuthController';
import HomeController from '../controllers/HomeController';
import WishlistController from '../controllers/WishlistController';
import NotificationController from '../controllers/NotificationController';

const SideMenu = ({ slideAnim, toggleMenu, menuWidth }) => {
    const navigation = useNavigation();
    return (
        <Animated.View
            style={[
                styles.sideMenu,
                { transform: [{ translateX: slideAnim }], width: menuWidth },
            ]}
        >
            <TouchableOpacity onPress={toggleMenu}>
                <View style={styles.menuHeader}>
                    <Ionicons style={styles.menuIcon} name="menu-outline" size={28} color="white"/>
                    <Text style={styles.menuTitle}>Hi, IFRA</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => HomeController.renderHomePage(navigation)}>
                <Ionicons name="home-outline" size={20} color="white" />
                <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => NotificationController.renderNotificationPage(navigation)}>
                <Ionicons name="notifications-outline" size={20} color="white" />
                <Text style={styles.menuText}>Notification</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => {
                    navigation.navigate('Wishlist');
                    toggleMenu();
                }}
            >
                <Ionicons name="heart-outline" size={24} color="#fff" />
                <Text style={styles.menuItemText}>Wishlist</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => {
                    navigation.navigate('Chats');
                    toggleMenu();
                }}
            >
                <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
                <Text style={styles.menuItemText}>Messages</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="help-circle-outline" size={20} color="white" />
                <Text style={styles.menuText}>Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
                <Ionicons name="settings-outline" size={20} color="white" />
                <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => AuthController.handleLogout(navigation)}>
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
        paddingTop: Platform.OS === 'ios' ? (StatusBar.currentHeight || 44) + 20 : 25,
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 35,
    },
    menuIcon: {
        color: 'white',
    },
    menuTitle: {
        marginLeft: 75,
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    menuText: {
        marginLeft: 10,
        fontSize: 16,
        color: 'white',
    },
    menuItemText: {
        marginLeft: 10,
        fontSize: 16,
        color: 'white',
    },
});

export default SideMenu;