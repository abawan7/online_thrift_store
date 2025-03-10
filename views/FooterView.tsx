import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const Footer: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    return (
        <View style={styles.footer}>
            <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Home')}>
                <Ionicons name="home-outline" size={25} color="#1A434E" />
                <Text style={styles.footerText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Wishlist')}>
                <Ionicons name="bag-outline" size={25} color="#1A434E" />
                <Text style={styles.footerText}>WishList</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Chatbot')}>
                <MaterialIcons name="smart-toy" size={24} color="#1A434E" />
                <Text style={styles.footerText}>Chatbot</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Profile')}>
                <Ionicons name="person-outline" size={25} color="#1A434E" />
                <Text style={styles.footerText}>Profile</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: '#ffffff',
    },
    footerItem: {
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'black',
        marginTop: 5,
    },
});

export default Footer;