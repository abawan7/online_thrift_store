import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Header from './Header'; // Import Header component
import Ionicons from 'react-native-vector-icons/Ionicons';
import SideMenu from './SideMenu';
import Footer from './FooterView';
import useLocation from '../hooks/userLocation'; // Import useLocation hook
import axios from "axios";


const screenWidth = Dimensions.get('window').width;
const menuWidth = screenWidth * 0.7;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const WishlistView = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-menuWidth)).current;

  const [showLocation, setShowLocation] = useState(false); // Control visibility
  const { getUserLocation, geocodeAddress, latitude, longitude, address, errorMsg } = useLocation();
  const [matchedSellers, setMatchedSellers] = useState([]);
  const [nearbySellers, setNearbySellers] = useState([]); // Sellers within proximity
  const [isLoading, setIsLoading] = useState(true); // Loading state for button

  const handleGetLocation = async () => {
    await getUserLocation(); // Fetch location
    setShowLocation(true);   // Show location view
  };

  useEffect(() => {
    const initializePage = async () => {
      await handleGetLocation(); // Get user's current location
      await matchAndGeocodeSellers(); // Match sellers and geocode addresses
      setIsLoading(false); // Enable the button after loading
    };

    initializePage(); // Call the initialization function
  }, []); // Empty dependency array ensures this runs only once on mount

  const findNearbySellers = () => {
    if (!latitude || !longitude || matchedSellers.length === 0) return;

    const nearby = matchedSellers.filter((seller) => {
      const distance = haversineDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        seller.lat,
        seller.lon
      );
      return distance <= 5; // Check if within 5km
    });

    setNearbySellers(nearby); // Update nearby sellers
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
  const [keywords, setKeywords] = useState({});
  const wishlistItems = [
    "I want a coffee table",
    "iPhone 16",
    "A Macbook 2021",
    "One Smart Fitness Watch",
    "Handmade Ceramic Vase",
    "An Electric Mountain Bike",
  ];

  useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const API_URL = "http://192.168.10.7:3000/extract-keywords"; // Use for Android Emulator
        // Use "http://192.168.1.10:3000/extract-keywords" for a real device

        console.log("Sending request to:", API_URL);

        const response = await axios.post(API_URL, { wishlistItems });

        console.log("Response received:", response.data);
        setKeywords(response.data.keywords);
      } catch (error) {
        console.error("Error fetching keywords:", error);
        if (error.response) {
          console.error("Response Error:", error.response.data);
        } else if (error.request) {
          console.error("Request Error: No response received", error.request);
        } else {
          console.error("General Error:", error.message);
        }
      }
    };

    fetchKeywords();
  }, []);
  
  const renderWishlistItem2 = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item}</Text>
      <Text style={styles.keywordText}>
        Keywords: {keywords[item] ? keywords[item].join(", ") : "Extracting..."}
      </Text>
    </View>
  );





  const sellers = [
    {
      name: "Abdullah",
      address: "Faisal Town, Lahore",
      items: [
        {
          name: "Macbook 2021",
          price: 200000,
          image: "https://appleshop.com.pk/wp-content/uploads/2021/10/mbp14-spacegray-gallery5.jpg",
        },
        {
          name: "iPhone 16",
          price: 150000,
          image: "https://mac-center.com.pr/cdn/shop/files/iPhone_16_Pro_Max_Desert_Titanium_PDP_Image_Position_1__en-US_d5e2a09b-4a28-4e79-a2f6-92ae40158896.jpg?v=1726226760&width=823",
        },
      ],
    },
    {
      name: "Hamza",
      address: "Valencia, Lahore",
      items: [
        {
          name: "iPhone 16",
          price: 145000,
          image: "https://mac-center.com.pr/cdn/shop/files/iPhone_16_Pro_Max_Desert_Titanium_PDP_Image_Position_1__en-US_d5e2a09b-4a28-4e79-a2f6-92ae40158896.jpg?v=1726226760&width=823",
        },
        {
          name: "Macbook 2021",
          price: 198000,
          image: "https://appleshop.com.pk/wp-content/uploads/2021/10/mbp14-spacegray-gallery5.jpg",
        },
      ],
    },
    {
      name: "Ifra",
      address: "DHA Phase 5, Lahore",
      items: [
        {
          name: "iPhone 16",
          price: 148000,
          image: "https://mac-center.com.pr/cdn/shop/files/iPhone_16_Pro_Max_Desert_Titanium_PDP_Image_Position_1__en-US_d5e2a09b-4a28-4e79-a2f6-92ae40158896.jpg?v=1726226760&width=823",
        },
        {
          name: "Electric Mountain Bike",
          price: 50000,
          image: "https://via.placeholder.com/150/mountainbike",
        },
      ],
    },
    {
      name: "Saba",
      address: "Lake city, Lahore",
      items: [
        {
          name: "Smart Fitness Watch",
          price: 10000,
          image: "https://via.placeholder.com/150/fitnesswatch",
        },
        {
          name: "Macbook 2021",
          price: 199000,
          image: "https://appleshop.com.pk/wp-content/uploads/2021/10/mbp14-spacegray-gallery5.jpg",
        },
      ],
    },
  ];

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const matchAndGeocodeSellers = async () => {
    // Filter sellers whose items match any item in the wishlist
    const matchingSellers = sellers.filter((seller) =>
      seller.items.some((item) => wishlistItems.includes(item.name)) // Compare item names
    );

    const geocodedResults = [];
    for (const seller of matchingSellers) {
      try {
        const result = await geocodeAddress(seller.address); // Call geocodeAddress
        if (result) {
          // Add latitude and longitude to the seller object
          geocodedResults.push({ ...seller, lat: result.lat, lon: result.lon });
        }
        await delay(1000); // Add a 1-second delay between requests
      } catch (error) {
        console.error(`Error geocoding address for ${seller.name}:`, error);
      }
    }

    setMatchedSellers(geocodedResults); // Set the state with geocoded results
  };

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
      
      <View>
        {showLocation && (
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
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        disabled={isLoading}
        onPress={async () => {
          // Call findNearbySellers and wait for it to complete
          await findNearbySellers();

          // Ensure that the nearbySellers array is populated before navigating
          if (nearbySellers.length > 0) {
            navigation.navigate('NotificationScreen', {
              notifications: nearbySellers.map((seller) => ({
                title: `Seller ${seller.name} is nearby! In ${seller.address}`,
                time: 'Just now',
                items: seller.items.filter((item) => wishlistItems.includes(item.name)), // Filter only items in the wishlist
                location: seller.address,
                sellerImage: 'https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg', // Placeholder image for the seller
              })),
            });
          }
        }}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Matching..." : "Check Proximity"}
        </Text>
      </TouchableOpacity>
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
  button: {
    width: '60%',
    backgroundColor: '#00494D',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
    marginLeft: 80,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WishlistView;
