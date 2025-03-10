import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, Animated } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface SideMenuProps {
    slideAnim: Animated.Value;
    toggleMenu: () => void;
    menuWidth: number;
}

const SideMenu: React.FC<SideMenuProps> = ({ slideAnim, toggleMenu, menuWidth }) => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    
    return (
        <Animated.View
            style={[
                styles.sideMenu,
                { transform: [{ translateX: slideAnim }], width: menuWidth },
            ]}
        >
            <TouchableOpacity onPress={toggleMenu}>
                <View style={{ flexDirection: 'row' }}>
                    <Ionicons style={styles.circle} name="menu-outline" size={28} color="Black" />
                    <Text style={styles.menuTitle}>Hi, Ifra</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Home')}>
                <Ionicons name="home-outline" size={20} color="white" />
                <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Notifications')}>
                <Ionicons name="notifications-outline" size={20} color="white" />
                <Text style={styles.menuText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.menuItem}>
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
    circle: {
        width: 35,
        height: 35,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6.27,
        elevation: 10,
        borderWidth: 2,
        borderColor: '#000000',
    },
    
});

export default SideMenu;