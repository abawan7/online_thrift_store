import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Dimensions, Animated, Alert, Image } from 'react-native';
import Header from './Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SideMenu from './SideMenu';
import Footer from './FooterView';
import useLocation from '../hooks/userLocation';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { startLocationTracking, stopLocationTracking, isLocationTrackingEnabled, getCurrentLocationAndLog } from '../services/LocationService';

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
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [keywords, setKeywords] = useState({});
  const [showLocation, setShowLocation] = useState(false);
  const { getUserLocation, geocodeAddress, latitude, longitude, address, errorMsg } = useLocation();
  const [matchedSellers, setMatchedSellers] = useState([]);
  const [nearbySellers, setNearbySellers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);

  // Toggle menu function
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

  // Check if tracking is enabled on component mount
  useEffect(() => {
    const checkTrackingStatus = async () => {
      const trackingEnabled = await isLocationTrackingEnabled();
      setIsTracking(trackingEnabled);
      
      // Get and log the current location when component mounts
      await getCurrentLocationAndLog();
    };
    
    checkTrackingStatus();
  }, []);

  // Toggle location tracking
  const toggleLocationTracking = async (value) => {
    if (value) {
      const started = await startLocationTracking();
      setIsTracking(started);
    } else {
      await stopLocationTracking();
      setIsTracking(false);
    }
  };

  // Fetch wishlist items from the database
  useEffect(() => {
    const fetchWishlistItems = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        setUserId(storedUserId);
        
        if (storedUserId) {
          const token = await AsyncStorage.getItem('token');
          
          const response = await axios.get(
            `${Constants.expoConfig.extra.API_URL}/wishlist/${storedUserId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          // Check the structure of the response data
          console.log('Wishlist response:', response.data);
          
          // Handle different response formats
          let wishlistData = [];
          if (response.data.products) {
            // If the response has a products array, use it
            wishlistData = response.data.products.map((item, index) => ({
              wishlist_id: index + 1,
              item_description: item,
              created_at: new Date().toISOString()
            }));
          } else if (response.data.wishlist) {
            // If the response has a wishlist array, use it
            wishlistData = response.data.wishlist;
          } else if (Array.isArray(response.data)) {
            // If the response is an array, use it directly
            wishlistData = response.data;
          }
          
          setWishlistItems(wishlistData);
          setLoading(false);
          
          // Extract keywords for each wishlist item
          if (wishlistData.length > 0) {
            extractKeywords(wishlistData.map(item => item.item_description));
          }
        }
      } catch (error) {
        console.error('Error fetching wishlist items:', error);
        setLoading(false);
        
        // For demo purposes, set some dummy data if API fails
        const dummyWishlist = [
          { wishlist_id: 1, item_description: "I want a coffee table", created_at: new Date().toISOString() },
          { wishlist_id: 2, item_description: "iPhone 16", created_at: new Date().toISOString() },
          { wishlist_id: 3, item_description: "A Macbook 2021", created_at: new Date().toISOString() },
          { wishlist_id: 4, item_description: "One Smart Fitness Watch", created_at: new Date().toISOString() },
          { wishlist_id: 5, item_description: "Handmade Ceramic Vase", created_at: new Date().toISOString() },
          { wishlist_id: 6, item_description: "An Electric Mountain Bike", created_at: new Date().toISOString() },
        ];
        
        setWishlistItems(dummyWishlist);
        extractKeywords(dummyWishlist.map(item => item.item_description));
      }
    };
    
    fetchWishlistItems();
  }, []);

  // Extract keywords from wishlist items
  const extractKeywords = async (items) => {
    try {
      const API_URL = `${Constants.expoConfig.extra.API_URL}/extract-keywords`;
      
      const response = await axios.post(API_URL, { wishlistItems: items });
      
      setKeywords(response.data.keywords);
    } catch (error) {
      console.error("Error extracting keywords:", error);
      
      // Enhanced fallback keyword extraction if API fails
      const fallbackKeywords = {};
      items.forEach(item => {
        if (!item) return;
        
        // Split the item description into words
        const words = item.toLowerCase().split(/\s+/);
        
        // Filter out common words and keep meaningful keywords
        const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'about', 'want', 'one'];
        const filteredWords = words.filter(word => 
          word.length > 3 && !commonWords.includes(word)
        );
        
        fallbackKeywords[item] = filteredWords;
      });
      
      setKeywords(fallbackKeywords);
    }
  };

  // Find matching sellers based on wishlist items
  const findMatchingSellers = async () => {
    try {
      setIsLoading(true);
      
      // Get user location from AsyncStorage
      const userLat = await AsyncStorage.getItem('latitude');
      const userLon = await AsyncStorage.getItem('longitude');
      
      // Get all listings data from the Home route params
      const { data } = navigation.getState().routes.find(route => route.name === 'Home').params;
      
      // Group listings by seller
      const sellerMap = {};
      
      data.forEach(listing => {
        if (!sellerMap[listing.user_email]) {
          sellerMap[listing.user_email] = {
            name: listing.user_name,
            email: listing.user_email,
            address: listing.location,
            items: []
          };
        }
        
        sellerMap[listing.user_email].items.push({
          listing_id: listing.listing_id,
          name: listing.name,
          price: listing.price,
          image: listing.image_url,
          description: listing.description,
          location: listing.location
        });
      });
      
      // Convert to array
      const sellers = Object.values(sellerMap);
      
      // Find sellers with matching items based on keywords
      const matched = [];
      const nearby = [];
      
      // Process each seller with for...of loop (supports await)
      for (const seller of sellers) {
        let hasMatch = false;
        
        // Check each wishlist item against seller's items
        wishlistItems.forEach(wishItem => {
          const itemKeywords = keywords[wishItem.item_description] || [];
          
          // Check if any seller item matches the keywords
          seller.items.forEach(sellerItem => {
            const itemName = sellerItem.name.toLowerCase();
            const itemDesc = sellerItem.description ? sellerItem.description.toLowerCase() : '';
            
            const matchesKeyword = itemKeywords.some(keyword => 
              itemName.includes(keyword.toLowerCase()) || 
              itemDesc.includes(keyword.toLowerCase())
            );
            
            if (matchesKeyword) {
              hasMatch = true;
            }
          });
        });
        
        if (hasMatch) {
          matched.push(seller);
        }
        
        // Check if seller is nearby (within 10km)
        if (seller.location && userLat && userLon) {
          try {
            const sellerCoords = await geocodeAddress(seller.location);
            
            if (sellerCoords) {
              const distance = haversineDistance(
                parseFloat(userLat), 
                parseFloat(userLon), 
                sellerCoords.lat, 
                sellerCoords.lon
              );
              
              if (distance <= 10) { // Within 10km
                nearby.push({...seller, distance: distance.toFixed(1)});
              }
            }
          } catch (error) {
            console.error('Error geocoding seller address:', error);
          }
        }
      }
      
      setMatchedSellers(matched);
      setNearbySellers(nearby);
      setIsLoading(false);
      setShowLocation(true);
    } catch (error) {
      console.error('Error finding matching sellers:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to find matching sellers. Please try again.');
    }
  };

  // Add a new wishlist item
  const addWishlistItem = async (description) => {
    try {
      if (!description || description.trim() === '') {
        Alert.alert('Error', 'Please enter a valid item description');
        return;
      }
      
      const token = await AsyncStorage.getItem('token');
      
      // Extract keywords locally first
      const itemWords = description.toLowerCase().split(/\s+/);
      const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'about', 'want', 'one'];
      const extractedKeywords = itemWords.filter(word => 
        word.length > 3 && !commonWords.includes(word)
      );
      
      console.log('Locally extracted keywords:', extractedKeywords);
      
      // Try to add the item to the wishlist
      try {
        await axios.post(
          `${Constants.expoConfig.extra.API_URL}/wishlist`,
          {
            user_id: userId,
            item_description: description,
            keywords: extractedKeywords
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } catch (postError) {
        console.error('Error with POST /wishlist:', postError);
        
        // Try the alternative endpoint if the first one fails
        await axios.post(
          `${Constants.expoConfig.extra.API_URL}/wishlist/${userId}/add`,
          {
            item: description
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
      
      // Add the item locally to the state
      const newItem = {
        wishlist_id: Date.now(), // Temporary ID
        item_description: description,
        created_at: new Date().toISOString()
      };
      
      const updatedItems = [...wishlistItems, newItem];
      setWishlistItems(updatedItems);
      
      // Update keywords
      const updatedKeywords = {...keywords};
      updatedKeywords[description] = extractedKeywords;
      setKeywords(updatedKeywords);
      
      Alert.alert('Success', 'Wishlist item added successfully!');
      
      // Try to refresh the wishlist from the server
      try {
        const response = await axios.get(
          `${Constants.expoConfig.extra.API_URL}/wishlist/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Handle different response formats
        let wishlistData = [];
        if (response.data.products) {
          wishlistData = response.data.products.map((item, index) => ({
            wishlist_id: index + 1,
            item_description: item,
            created_at: new Date().toISOString()
          }));
        } else if (response.data.wishlist) {
          wishlistData = response.data.wishlist;
        } else if (Array.isArray(response.data)) {
          wishlistData = response.data;
        }
        
        setWishlistItems(wishlistData);
      } catch (refreshError) {
        console.error('Error refreshing wishlist:', refreshError);
        // Keep the locally updated state
      }
    } catch (error) {
      console.error('Error adding wishlist item:', error);
      Alert.alert('Error', 'Failed to add wishlist item. Please try again.');
    }
  };

  // Delete a wishlist item
  const deleteWishlistItem = async (wishlistId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      await axios.delete(
        `${Constants.expoConfig.extra.API_URL}/wishlist/${wishlistId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update local state
      setWishlistItems(wishlistItems.filter(item => item.wishlist_id !== wishlistId));
      
      Alert.alert('Success', 'Wishlist item deleted successfully!');
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
      Alert.alert('Error', 'Failed to delete wishlist item. Please try again.');
    }
  };

  // Render a wishlist item
  const renderWishlistItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemText}>{item.item_description}</Text>
        <Text style={styles.keywordText}>
          Keywords: {keywords[item.item_description] ? keywords[item.item_description].join(", ") : "Extracting..."}
        </Text>
        <Text style={styles.dateText}>
          Added on: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteWishlistItem(item.wishlist_id)}
      >
        <Ionicons name="trash-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // Render a seller card
  const renderSellerCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.sellerCard}
      onPress={() => navigation.navigate('SellerProfile', { sellerEmail: item.email, sellerName: item.name })}
    >
      <View style={styles.sellerInfo}>
        <Text style={styles.sellerName}>{item.name}</Text>
        <Text style={styles.sellerAddress}>
          <Ionicons name="location-outline" size={14} color="#666" /> {item.address}
        </Text>
        {item.distance && (
          <Text style={styles.distanceText}>{item.distance} km away</Text>
        )}
      </View>
      <View style={styles.sellerItems}>
        <Text style={styles.itemsTitle}>Matching Items:</Text>
        <FlatList
          data={item.items.slice(0, 2)} // Show only first 2 items
          horizontal
          renderItem={({ item: product }) => (
            <TouchableOpacity 
              style={styles.productCard}
              onPress={() => navigation.navigate('ViewProduct', { product })}
            >
              <Image source={{ uri: product.image }} style={styles.productImage} />
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>PKR {product.price}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(product) => product.listing_id.toString()}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Online Thrift Store"
        onMenuPress={toggleMenu}
        onNotificationsPress={() => console.log('Notifications Pressed')}
      />

      {/* Side Menu */}
      <SideMenu slideAnim={slideAnim} toggleMenu={toggleMenu} menuWidth={menuWidth} />

      {/* Overlay */}
      {isMenuOpen && (
        <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
      )}

      <View style={styles.content}>
        {/* Wishlist Icon and Title */}
        <View style={styles.titleContainer}>
          <Ionicons name="heart-outline" size={40} color="#fff" style={styles.titleIcon} />
          <Text style={styles.title}>Wishlist</Text>
        </View>

        {/* Location Tracking Toggle */}
        <View style={styles.trackingContainer}>
          <Text style={styles.trackingText}>
            Enable location tracking to find items near you
          </Text>
          <TouchableOpacity
            style={[styles.trackingButton, isTracking ? styles.trackingEnabled : styles.trackingDisabled]}
            onPress={() => toggleLocationTracking(!isTracking)}
          >
            <Text style={styles.trackingButtonText}>
              {isTracking ? 'Tracking Enabled' : 'Enable Tracking'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Wishlist Items */}
        <View style={styles.wishlistContainer}>
          <Text style={styles.sectionTitle}>Your Wishlist Items</Text>
          
          {loading ? (
            <Text style={styles.loadingText}>Loading wishlist items...</Text>
          ) : wishlistItems.length === 0 ? (
            <Text style={styles.emptyText}>Your wishlist is empty. Add items you're looking for!</Text>
          ) : (
            <FlatList
              data={wishlistItems}
              renderItem={renderWishlistItem}
              keyExtractor={(item) => item.wishlist_id.toString()}
              style={styles.wishlistList}
            />
          )}
          
          {/* Add Wishlist Item Button */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              Alert.prompt(
                'Add Wishlist Item',
                'What item are you looking for?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Add', onPress: (text) => addWishlistItem(text) }
                ]
              );
            }}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Find Matching Sellers Button */}
        <TouchableOpacity 
          style={styles.findButton}
          onPress={findMatchingSellers}
          disabled={isLoading}
        >
          <Text style={styles.findButtonText}>
            {isLoading ? 'Finding Sellers...' : 'Find Matching Sellers'}
          </Text>
        </TouchableOpacity>

        {/* Matching Sellers Section */}
        {showLocation && (
          <View style={styles.sellersContainer}>
            {matchedSellers.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Sellers with Matching Items</Text>
                <FlatList
                  data={matchedSellers}
                  renderItem={renderSellerCard}
                  keyExtractor={(item) => item.email}
                  style={styles.sellersList}
                />
              </>
            ) : (
              <Text style={styles.emptyText}>No sellers found with matching items.</Text>
            )}

            {/* Nearby Sellers Section */}
            {nearbySellers.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Sellers Near You</Text>
                <FlatList
                  data={nearbySellers}
                  renderItem={renderSellerCard}
                  keyExtractor={(item) => item.email}
                  style={styles.sellersList}
                />
              </>
            )}
          </View>
        )}
      </View>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A434E',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  titleIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  trackingContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  trackingButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  trackingEnabled: {
    backgroundColor: '#4CAF50',
  },
  trackingDisabled: {
    backgroundColor: '#F44336',
  },
  trackingButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  wishlistContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  wishlistList: {
    maxHeight: 300,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  keywordText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#1A434E',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  findButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  findButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  sellersContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sellersList: {
    maxHeight: 400,
  },
  sellerCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  sellerInfo: {
    marginBottom: 10,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sellerAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  distanceText: {
    fontSize: 14,
    color: '#1A434E',
    fontWeight: 'bold',
  },
  sellerItems: {
    marginTop: 10,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productCard: {
    width: 120,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 4,
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 12,
    color: '#1A434E',
    fontWeight: 'bold',
  },
});

export default WishlistView;
