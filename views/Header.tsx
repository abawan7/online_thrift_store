import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

interface HeaderProps {
    title: string;
    onMenuPress: () => void;
    onNotificationsPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuPress, onNotificationsPress }) => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    
    const handleNotificationsPress = () => {
        if (onNotificationsPress) {
            onNotificationsPress();
        } else {
            navigation.navigate('NotificationScreen');
        }
    };

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={onMenuPress}>
                <View style={styles.iconWrapper}>
                    <Ionicons name="menu" size={25} color="#1A434E" />
                </View>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={handleNotificationsPress}>
                <View style={styles.iconWrapper}>
                    <Ionicons name="notifications" size={25} color="#1A434E" />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'ios' ? (StatusBar.currentHeight || 44) + 20 : 25,
        backgroundColor: '#1A434E',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        flex: 1,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        backgroundColor: '#fff',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'black',
    },
});

export default Header;