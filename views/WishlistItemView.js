import React, {useEffect, useRef, useState} from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Header from './Header'; // Import Header component
import Ionicons from 'react-native-vector-icons/Ionicons';
import SideMenu from './SideMenu';
import Footer from './FooterView';
import useLocation from '../hooks/userLocation'; // Import useLocation hook


const screenWidth = Dimensions.get('window').width;
const menuWidth = screenWidth * 0.7;

const WishlistView = ({ navigation }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(-menuWidth)).current;

    const { getUserLocation, latitude, longitude, address, errorMsg } = useLocation();

    useEffect(() => {
        getUserLocation(); // Automatically fetch location when the component mounts
    }, []);

    const toggleMenu = () => {
        if (isMenuOpen) {
            Animated.timing(slideAnim, {
                toValue: -menuWidth,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setIsMenuOpen(false));
        } else {
            setIsMenuOpen(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };

    const wishlistItems = [
        'Vintage Leather Backpack',
        'Wireless Headphones',
        'Smart Fitness Watch',
        'Handmade Ceramic Vase',
        'Electric Mountain Bike',
        'Premium Espresso Machine',
        'Custom Wooden Bookshelf',
    ];

    const renderWishlistItem = ({ item, index }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemText}>{`${index + 1}. ${item}`}</Text>
            <View style={styles.itemActions}>
                <TouchableOpacity>
                    <Ionicons name="create-outline" size={20} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Ionicons name="trash-outline" size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Use Header Component */}
            <Header
                title="Online Thrift Store"
                onMenuPress={toggleMenu}
                onNotificationsPress={() => console.log('Notifications Pressed')}
            />

            {/* Side Menu */}
            <SideMenu slideAnim={slideAnim} toggleMenu={toggleMenu} />

            {/* Overlay */}
            {isMenuOpen && (
                <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
            )}

            <View style={styles.mainContent}>
                {/* Wishlist Icon and Title */}
                <View style={styles.titleContainer}>
                    <Ionicons name="bag-outline" size={75} color="#1A434E" />
                    <Text style={styles.wishlistTitle}>Wishlist Items</Text>
                    <View style={styles.underline} />
                </View>

                {/* Item Count and Filter Icon */}
                <View style={styles.itemCountContainer}>
                    <Text style={styles.itemCountText}>{`${wishlistItems.length} Items`}</Text>
                    <TouchableOpacity>
                        <Ionicons name="filter-outline" size={25} color="black" />
                    </TouchableOpacity>
                </View>

                {/* Wishlist Items */}
                <View style={styles.listContainer}>
                    <FlatList
                        data={wishlistItems}
                        renderItem={renderWishlistItem}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
            </View>
            {/* Display Current Location and Address */}
            <View style={styles.locationContainer}>
                <Text style={styles.locationTitle}>Your Current Location:</Text>
                {latitude && longitude ? (
                    <>
                        <Text style={styles.locationText}>
                            Latitude: {latitude}, Longitude: {longitude}
                        </Text>
                        <Text style={styles.locationText}>
                            Address: {address || "Fetching address..."}
                        </Text>
                    </>
                ) : (
                    <Text style={styles.locationText}>
                        {errorMsg || "Fetching location..."}
                    </Text>
                )}
            </View>
            {/* Footer */}
            <Footer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    mainContent: {
        flex: 1,
        padding: 16,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    wishlistTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#1A434E',
        marginTop: 8,
    },
    locationContainer: {
        marginBottom: 16,
        padding: 10,
        borderRadius: 8,
        backgroundColor: "#E6F7FF",
    },
    locationTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    locationText: {
        fontSize: 14,
        color: "#555",
    },
    underline: {
        width: 150,
        height: 2,
        backgroundColor: '#1A434E',
        marginTop: 4,
    },
    itemCountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    itemCountText: {
        fontSize: 14,
        color: '#333',
    },
    listContainer: {
        backgroundColor: 'rgba(183, 202, 174, 0.44)', // 44% transparency
        borderRadius: 12,
        padding: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    itemActions: {
        flexDirection: 'row',
        gap: 12,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 182,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 500,
    },
});

export default WishlistView;
