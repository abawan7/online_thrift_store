import React, {useRef, useState, useEffect} from 'react';
import Header from './Header';
import SideMenu from './SideMenu';
import Footer from './FooterView';
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect from react-navigation
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar, Platform } from 'react-native';


const screenWidth = Dimensions.get('window').width;
const menuWidth = screenWidth * 0.5;

const categories = [
    { id: '1', name: 'Decoration', image: require('../assets/Decoration.png') },
    { id: '2', name: 'Fashion', image: require('../assets/Fashion.png') },
    { id: '3', name: 'Appliance', image: require('../assets/Appliance.png') },
    { id: '4', name: 'Game', image: require('../assets/Games.webp') },
    { id: '5', name: 'Gadgets', image: require('../assets/Gadgets.png') },
];


const products = [
    {
        id: '1',
        name: 'Handball Spezial Shoes',
        location: 'J2 Johar Town, Lahore Pakistan',
        price: 'PKR 10,000',
        image: 'https://assets.adidas.com/images/w_1880,f_auto,q_auto/237264d18bb14f108f80e83ba4644ffb_9366/IF7086_01_standard.jpg',
    },
    {
        id: '2',
        name: 'GUCCI BAG',
        location: 'J2 Johar Town, Lahore Pakistan',
        price: 'PKR 30,000',
        image: 'https://media.gucci.com/style/White_South_0_160_540x540/1725898525/815103_FAD6L_9758_001_093_0000_Light-GG-Emblem-small-shoulder-bag.jpg',
    },
    {
        id: '3',
        name: 'Xbox Series X 1TB',
        location: 'J2 Johar Town, Lahore Pakistan',
        price: 'PKR 10,000',
        image: 'https://gamestoppakistan.com/cdn/shop/products/2_f079828d-5804-4a55-81d8-ba4f9e03f167.jpg?v=1734508868&width=1946',
    },
    {
        id: '4',
        name: 'IPHONE 12 Pro 256gb',
        location: 'J2 Johar Town, Lahore Pakistan',
        price: 'PKR 150,000',
        image: 'https://regen.pk/cdn/shop/products/iphone-12-pro-451726_e0de9640-4bd6-4ba1-bbfa-f9729b57c376.jpg?v=1674907298',
    },
    {
        id: '5',
        name: 'Macbook 2021 16”',
        location: 'J2 Johar Town, Lahore Pakistan',
        price: 'PKR 250,000',
        image: 'https://www.notebookcheck.net/fileadmin/_processed_/8/5/csm_Unbenannt_1_394618d40b.jpg',
    },
    {
        id: '6',
        name: 'Iphone 16 Pro”',
        location: 'J2 Johar Town, Lahore Pakistan',
        price: 'PKR 650,000',
        image: 'https://regen.pk/cdn/shop/products/iphone-12-pro-451726_e0de9640-4bd6-4ba1-bbfa-f9729b57c376.jpg?v=1674907298',
    },
];




const OnlineThriftStore = ({ route, navigation }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(-menuWidth)).current;
    const { data, loading } = route.params || {};
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Initialize filtered data with all data
        setFilteredData(data || []);
    }, [data]);

    const handleSearch = (text) => {
        setSearchQuery(text);
        
        if (!text.trim()) {
            // If search is empty, show all products
            setFilteredData(data || []);
            return;
        }
        
        // Filter products based on search text
        const filtered = data.filter(item => {
            const itemName = item.name ? item.name.toLowerCase() : '';
            const itemDescription = item.description ? item.description.toLowerCase() : '';
            const searchText = text.toLowerCase();
            
            return itemName.includes(searchText) || itemDescription.includes(searchText);
        });
        
        setFilteredData(filtered);
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
    const renderProduct = ({ item }) => (
        <TouchableOpacity 
            style={styles.productCard} 
            key={item.id}
            onPress={() => navigation.navigate('ViewProduct', { product: item })}
        >
            <Image source={{ uri: item.image_url }} style={styles.productImage} />
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productLocation}>
                    <Ionicons name="location-outline" size={12} color="gray" /> {item.location}
                </Text>
                <View style={styles.productActions}>
                    <View style={styles.circleicon}>
                    <Ionicons name="cart-outline" size={16} color="black" />
                    </View>
                    <View style={styles.circleicon}>
                    <Ionicons name="heart-outline" size={16} color="black" />
                    </View>
                </View>
                <Text style={styles.productPrice}>{"PKR "}{item.price}</Text>
            </View>
        </TouchableOpacity>
    );




    return (
        <View style={styles.container}>
            <Header
                title="Online Thrift Store"
                onMenuPress={toggleMenu}
                onNotificationsPress={() => console.log('Notifications Pressed')}
                onSearch={handleSearch}
            />

            {/* Side Menu */}
            <SideMenu slideAnim={slideAnim} toggleMenu={toggleMenu} menuWidth={menuWidth}/>

            {/* Overlay */}
            {isMenuOpen && (
                <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
            )}
            <ScrollView>
                <ScrollView horizontal contentContainerStyle={styles.categoryList}>
                    {categories.map((item) => (
                        <TouchableOpacity style={styles.category} key={item.id}>
                            <Image source={item.image} style={styles.categoryImage} />
                            <Text style={styles.categoryText}>{item.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Show search results count if searching */}
                {searchQuery.trim() !== '' && (
                    <Text style={styles.searchResults}>
                        Found {filteredData.length} results for "{searchQuery}"
                    </Text>
                )}

                <Text style={styles.sectionTitle}>For You</Text>
                {/* In the ScrollView section where you render products */}
                <ScrollView 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.productList}
                >
                    {filteredData.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            onPress={() => navigation.navigate('ViewProduct', { product: item })}
                        >
                            {renderProduct({ item })}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                
                {/* Only show Recently Added section if not searching */}
                {searchQuery.trim() === '' && (
                    <>
                        <Text style={styles.sectionTitle}>Recently Added</Text>
                        <ScrollView contentContainerStyle={styles.recentProductList}>
                            {/* Loop through products and render in two columns */}
                            {filteredData.map((item, index) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.recentProductCard, index % 2 === 1 && styles.secondColumn]}
                                    onPress={() => navigation.navigate('ViewProduct', { product: item })}
                                >
                                    <Image source={{ uri: item.image_url }} style={styles.recentProductImage} />
                                    <Text style={styles.recentProductName}>{item.name}</Text>
                                    <Text style={styles.recentProductLocation}>
                                        <Ionicons name="location-outline" size={12} color="gray" /> {item.location}
                                    </Text>
                                    <View style={styles.recentProductActions}>
                                        <View style={styles.circleicon}>
                                            <Ionicons name="cart-outline" size={16} color="black" />
                                        </View>
                                        <View style={styles.circleicon}>
                                            <Ionicons name="heart-outline" size={16} color="black" />
                                        </View>
                                    </View>
                                    <Text style={styles.recentProductPrice}>{"PKR "}{item.price}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </>
                )}
            </ScrollView>
            <Footer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    backgroundContainer: {
        height: '50%',
        width: '112%',
    },
    circleicon: {
        width: 22,
        height: 22,
        marginLeft:8,
        backgroundColor: '#fff',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'Black',
        overflow: 'hidden',
        justifyContent: 'center',  // Center the icon vertically
        alignItems: 'center',      // Center the icon horizontally
        display: 'flex',           // Use flexbox to center the icon inside the circle
    },
    
    categoryImage: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 0,
        padding: 2,
        backgroundColor: 'rgba(183, 202, 174, 0.44)', // 44% transparency
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#B7CAAE',
        overflow: 'hidden',
    },
    categoryText: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5
    },
    categoryList: { marginVertical: 10, paddingHorizontal: 10 },
    category: {
        alignItems: 'center',
        marginHorizontal: 2,
        padding: 10,
    },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 15, marginVertical: 10 },
    productCard: {
        flexDirection: 'row',
        backgroundColor: 'rgba(183, 202, 174, 0.44)', // 44% transparency
        borderRadius: 12,
        margin: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 10,
        backgroundColor: 'White',
        borderWidth: 2,
        borderColor: '#B7CAAE', // 100% B7CAAE color
        overflow: 'hidden',
    },
    productInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    productLocation: {
        fontSize: 12,
        color: 'gray',
        marginVertical: 5,
    },
    productActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2c7a7b',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: '#ffffff',
    },
    recentProductList: {
        flexDirection: 'row', 
        flexWrap: 'wrap',    
        justifyContent: 'space-between', 
        paddingLeft: 15,    
        paddingRight: 15, 
    },
    recentProductCard: {
        width: '48%',     
        backgroundColor: 'rgba(183, 202, 174, 0.44)',
        borderRadius: 12,
        marginBottom: 15,   
        padding: 10,
        alignItems:'center',
    },
    secondColumn: {
        marginLeft: '3%', 
    },
    recentProductImage: {
        width: '100%',     // Ensure the image takes up full width of its container
        height: 158,
        borderRadius: 8,
        backgroundColor: 'White',
        borderWidth: 2,
        borderColor: '#B7CAAE',
        overflow: 'hidden',
    },
    recentProductName: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5,
    },
    recentProductLocation: {
        fontSize: 12,
        color: 'gray',
        textAlign: 'center',
        marginVertical: 5,
    },
    recentProductActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 5,
    },
    recentProductPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2c7a7b',
        marginTop:5,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: screenWidth - menuWidth,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 500,
    },
});

export default OnlineThriftStore;