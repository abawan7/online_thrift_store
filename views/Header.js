import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar, TextInput } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; // Import

const Header = ({ title, onMenuPress, onNotificationsPress, onSearch, showSearch = false }) => {
    const navigation = useNavigation(); // Initialize navigation
    const [showSearchInput, setShowSearchInput] = useState(false);
    const [searchText, setSearchText] = useState('');

    const handleNotificationsPress = () => {
        navigation.navigate('NotificationScreen', {});
    };

    const toggleSearch = () => {
        setShowSearchInput(!showSearchInput);
        if (showSearchInput) {
            // Reset search when closing
            setSearchText('');
            onSearch && onSearch('');
        }
    };

    const handleSearch = (text) => {
        setSearchText(text);
        onSearch && onSearch(text);
    };

    return (
        <View style={styles.header}>
            {/* Menu Icon */}
            <TouchableOpacity onPress={onMenuPress} style={styles.iconContainer}>
                <View style={styles.iconWrapper}>
                    <Ionicons name="menu" size={25} color="#1A434E" />
                </View>
            </TouchableOpacity>

            {/* Title or Search Input */}
            {showSearchInput ? (
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        placeholderTextColor="#888"
                        value={searchText}
                        onChangeText={handleSearch}
                        autoFocus
                    />
                </View>
            ) : (
                <View style={styles.titleContainer}>
                    <Text style={styles.headerTitle}>{title}</Text>
                </View>
            )}

            {/* Right Icons Container */}
            <View style={styles.rightIconsContainer}>
                {/* Search/Close Icon - Only show if showSearch prop is true */}
                {showSearch && (
                    <TouchableOpacity onPress={toggleSearch} style={styles.iconButton}>
                        <View style={styles.iconWrapper}>
                            <Ionicons name={showSearchInput ? "close" : "search"} size={25} color="#1A434E" />
                        </View>
                    </TouchableOpacity>
                )}

                {/* Notifications Icon */}
                <TouchableOpacity onPress={handleNotificationsPress} style={styles.iconButton}>
                    <View style={styles.iconWrapper}>
                        <Ionicons name="notifications" size={25} color="#1A434E" />
                    </View>
                </TouchableOpacity>
            </View>
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
    iconContainer: {
        width: 36,
    },
    rightIconsContainer: {
        flexDirection: 'row',
        width: 90,
        justifyContent: 'flex-end',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        paddingRight: 10, // Add padding to shift the title slightly to the right
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginLeft: 10, // Add left margin to shift the title to the right
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
    searchContainer: {
        flex: 1,
        marginHorizontal: 10, 
    },
    searchInput: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 16,
        color: '#333',
    },
    iconButton: {
        marginLeft: 10,
    },
});

export default Header;
