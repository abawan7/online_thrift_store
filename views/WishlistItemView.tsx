import React, { useEffect, useRef, useState } from 'react';
import { 
    View, 
    StyleSheet, 
    FlatList, 
    Text, 
    TouchableOpacity, 
    Dimensions, 
    Animated 
} from 'react-native';
import Header from './Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SideMenu from './SideMenu';
import Footer from './FooterView';
import useLocation from '../hooks/userLocation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define types for navigation props
interface WishlistViewProps {
    navigation: NativeStackNavigationProp<any, any>;
}

// Define types for sellers and items
interface Item {
    name: string;
    price: number;
    image: string;
}

interface Seller {
    name: string;
    address: string;
    lat?: number;
    lon?: number;
    items: Item[];
}

const screenWidth = Dimensions.get('window').width;
const menuWidth = screenWidth * 0.7;

// Function to calculate distance using Haversine formula
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const WishlistView: React.FC<WishlistViewProps> = ({ navigation }) => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const slideAnim = useRef(new Animated.Value(-menuWidth)).current;

    const [showLocation, setShowLocation] = useState<boolean>(false);
    const { getUserLocation, geocodeAddress, latitude, longitude, address, errorMsg } = useLocation();
    const [matchedSellers, setMatchedSellers] = useState<Seller[]>([]);
    const [nearbySellers, setNearbySellers] = useState<Seller[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const handleGetLocation = async () => {
        await getUserLocation();
        setShowLocation(true);
    };

    useEffect(() => {
        const initializePage = async () => {
            await handleGetLocation();
            await matchAndGeocodeSellers();
            setIsLoading(false);
        };

        initializePage();
    }, []);

    const findNearbySellers = () => {
        if (!latitude || !longitude || matchedSellers.length === 0) return;

        // Ensure latitude and longitude are numbers
        const userLat = parseFloat(latitude as unknown as string);
        const userLon = parseFloat(longitude as unknown as string);

        if (isNaN(userLat) || isNaN(userLon)) return;

        const nearby = matchedSellers.filter((seller) => {
            if (!seller.lat || !seller.lon) return false;
            const distance = haversineDistance(userLat, userLon, seller.lat, seller.lon);
            return distance <= 5;
        });

        setNearbySellers(nearby);
    };

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

    const wishlistItems: string[] = [
        "iPhone 16",
        "Macbook 2021",
        "Smart Fitness Watch",
        "Handmade Ceramic Vase",
        "Electric Mountain Bike",
    ];

    const sellers: Seller[] = [
        {
            name: "Abdullah",
            address: "Faisal Town, Lahore",
            items: [
                { name: "Macbook 2021", price: 200000, image: "https://appleshop.com.pk/wp-content/uploads/2021/10/mbp14-spacegray-gallery5.jpg" },
                { name: "iPhone 16", price: 150000, image: "https://mac-center.com.pr/cdn/shop/files/iPhone_16_Pro_Max_Desert_Titanium_PDP_Image_Position_1__en-US.jpg" },
            ],
        }
    ];

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const matchAndGeocodeSellers = async () => {
        const matchingSellers = sellers.filter((seller) =>
            seller.items.some((item) => wishlistItems.includes(item.name))
        );

        const geocodedResults: Seller[] = [];
        for (const seller of matchingSellers) {
            try {
                const result = await geocodeAddress(seller.address);
                if (result) {
                    geocodedResults.push({ ...seller, lat: parseFloat(result.lat as unknown as string), lon: parseFloat(result.lon as unknown as string) });
                }
                await delay(1000);
            } catch (error) {
                console.error(`Error geocoding address for ${seller.name}:`, error);
            }
        }

        setMatchedSellers(geocodedResults);
    };

    return (
        <View style={styles.container}>
            <Header title="Wishlist" onMenuPress={toggleMenu} onNotificationsPress={() => console.log('Notifications Pressed')} />
            <SideMenu slideAnim={slideAnim} toggleMenu={toggleMenu} menuWidth={menuWidth} />

            {isMenuOpen && <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />}

            <FlatList
                data={wishlistItems}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Text style={styles.itemText}>{item}</Text>}
            />

            <TouchableOpacity
                style={styles.button}
                disabled={isLoading}
                onPress={async () => {
                    await findNearbySellers();
                    if (nearbySellers.length > 0) {
                        navigation.navigate('NotificationScreen', {
                            notifications: nearbySellers.map((seller) => ({
                                title: `Seller ${seller.name} is nearby!`,
                                time: 'Just now',
                                items: seller.items.filter((item) => wishlistItems.includes(item.name)),
                                location: seller.address,
                            })),
                        });
                    }
                }}
            >
                <Text style={styles.buttonText}>{isLoading ? "Matching..." : "Check Proximity"}</Text>
            </TouchableOpacity>

            <Footer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    overlay: { position: 'absolute', top: 0, bottom: 0, left: 182, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 500 },
    button: { padding: 15, backgroundColor: '#00494D', alignItems: 'center', marginTop: 10, borderRadius: 10 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    itemText: { fontSize: 16, color: '#333', padding: 10 },
});

export default WishlistView;
