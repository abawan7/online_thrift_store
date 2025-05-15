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
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const screenWidth = Dimensions.get('window').width;
const menuWidth = screenWidth * 0.7;

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Number(distance.toFixed(1)); // Round to 1 decimal place
};

const WishlistView = () => {
  const navigation = useNavigation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-menuWidth)).current;
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [keywords, setKeywords] = useState({});
  const [showLocation, setShowLocation] = useState(false);
  const { getUserLocation, geocodeAddress, latitude, longitude, address, errorMsg } = useLocation();
  const [matchedSellers, setMatchedSellers] = useState([]);
  const [nearbySellers, setNearbySellers] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyItems, setNearbyItems] = useState([]);
  const [matchedWishlistListings, setMatchedWishlistListings] = useState([]);
  const locationSubscriptionRef = useRef(null);
  const [notificationToken, setNotificationToken] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [notifiedSellers, setNotifiedSellers] = useState(new Set());
  const [isLocationTracking, setIsLocationTracking] = useState(false);

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

  // Extract keywords from text
  const extractKeywordsFromText = (text) => {
    if (!text) return [];
    console.log('Extracting keywords from:', text);
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'about', 'want', 'one', 'need'];
    const keywords = words.filter(word => word.length > 3 && !commonWords.includes(word));
    console.log('Extracted keywords:', keywords);
    return keywords;
  };

  // Store matched listings in AsyncStorage
  const storeMatchedListings = async (listings) => {
    try {
      await AsyncStorage.setItem('matchedWishlistListings', JSON.stringify(listings));
    } catch (error) {
      console.error('Error storing matched listings:', error);
    }
  };

  // Load matched listings from AsyncStorage
  const loadMatchedListings = async () => {
    try {
      const storedListings = await AsyncStorage.getItem('matchedWishlistListings');
      if (storedListings) {
        setMatchedWishlistListings(JSON.parse(storedListings));
      }
    } catch (error) {
      console.error('Error loading matched listings:', error);
    }
  };

  // Register for push notifications
  const registerForPushNotificationsAsync = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      // Only get token if we're not in Expo Go
      if (!Constants.appOwnership === 'expo') {
        const token = await Notifications.getExpoPushTokenAsync();
        setNotificationToken(token.data);
        await AsyncStorage.setItem('notificationToken', token.data);
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  // Send local notification
  const sendLocalNotification = async (seller) => {
    try {
      console.log('Preparing to send notification for seller:', seller);
      console.log('Current user location:', userLocation);
      
      if (!userLocation) {
        console.log('User location not available, cannot calculate distance');
        return;
      }

      const distance = haversineDistance(
        userLocation.latitude,
        userLocation.longitude,
        seller.latitude,
        seller.longitude
      );
      
      console.log('Calculated distance:', distance, 'km');

      // Check if we're in Expo Go
      if (Constants.appOwnership === 'expo') {
        console.log('Using Alert in Expo Go');
        Alert.alert(
          'Matching Seller Nearby!',
          `${seller.name} is ${distance.toFixed(1)} km away. They have items matching your wishlist!`,
          [
            {
              text: 'View Profile',
              onPress: () => {
                console.log('Navigating to seller profile:', seller.seller_id);
                navigation.navigate('SellerProfile', { sellerId: seller.seller_id });
              }
            },
            {
              text: 'Dismiss',
              style: 'cancel'
            }
          ]
        );
      } else {
        console.log('Using Notifications in development build');
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Matching Seller Nearby!',
            body: `${seller.name} is ${distance.toFixed(1)} km away. They have items matching your wishlist!`,
            data: { sellerId: seller.seller_id },
          },
          trigger: null,
        });
      }
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  // Initialize location tracking
  const initializeLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      setUserLocation(initialLocation.coords);
      console.log('Initial location set:', initialLocation.coords);

      // Start watching position
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (location) => {
          console.log('Location update:', location.coords);
          setUserLocation(location.coords);
          checkNearbyMatches(location.coords);
        }
      );

      locationSubscriptionRef.current = subscription;
      setIsLocationTracking(true);
      console.log('Location tracking started');
    } catch (error) {
      console.error('Error initializing location tracking:', error);
    }
  };

  // Match wishlist items with listings
  const matchWishlistWithListings = async (wishlistItems) => {
    try {
      console.log('Starting wishlist matching process');
      console.log('Wishlist items:', wishlistItems);

      // Get listings data from AsyncStorage
      const listingsData = await AsyncStorage.getItem('listings');
      if (!listingsData) {
        console.log('No listings data available');
        return [];
      }

      const listings = JSON.parse(listingsData);
      console.log('Available listings:', listings);

      const matchedListings = [];
      const processedSellers = new Set();

      // Process each wishlist item
      for (const wishItem of wishlistItems) {
        console.log('Processing wishlist item:', wishItem);
        const itemKeywords = extractKeywordsFromText(wishItem.item_description);
        
        // Match with listings
        for (const listing of listings) {
          const listingName = listing.name?.toLowerCase() || '';
          const listingDesc = listing.description?.toLowerCase() || '';
          
          const hasMatch = itemKeywords.some(keyword => 
            listingName.includes(keyword) || listingDesc.includes(keyword)
          );

          if (hasMatch && !processedSellers.has(listing.user_email)) {
            console.log('Found match:', {
              wishlistItem: wishItem.item_description,
              listing: listing.name,
              keywords: itemKeywords
            });

            try {
              // Geocode the listing location
              const coords = await geocodeLocation(listing.location);
              if (coords) {
                const matchedListing = {
                  ...listing,
                  wishlist_item: wishItem.item_description,
                  matched_keywords: itemKeywords,
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  seller_id: listing.user_email
                };
                matchedListings.push(matchedListing);
                processedSellers.add(listing.user_email);
                console.log('Added matched listing with coordinates:', matchedListing);
              }
            } catch (error) {
              console.error('Error geocoding listing location:', error);
            }
          }
        }
      }

      // Store matched listings
      console.log('Storing matched listings:', matchedListings);
      await AsyncStorage.setItem('matchedListings', JSON.stringify(matchedListings));
      setMatchedWishlistListings(matchedListings);

      return matchedListings;
    } catch (error) {
      console.error('Error matching wishlist with listings:', error);
      return [];
    }
  };

  // Initialize wishlist and location tracking
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize location tracking first
        await initializeLocationTracking();

        // Then fetch wishlist items
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          console.log('No user token found');
          return;
        }

        console.log('Fetching wishlist items...');
        const response = await axios.get(`${Constants.expoConfig.extra.API_URL}/wishlist`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data && Array.isArray(response.data)) {
          console.log('Wishlist items received:', response.data);
          setWishlistItems(response.data);
          
          // Extract keywords for each wishlist item
          const keywordsMap = {};
          response.data.forEach(item => {
            keywordsMap[item.item_description] = extractKeywordsFromText(item.item_description);
          });
          setKeywords(keywordsMap);
          
          // Match with listings
          await matchWishlistWithListings(response.data);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Check for nearby matches
  const checkNearbyMatches = async (coords) => {
    try {
      console.log('Checking for nearby matches with coordinates:', coords);
      const storedMatches = await AsyncStorage.getItem('matchedListings');
      if (!storedMatches) {
        console.log('No stored matches found in AsyncStorage');
        return;
      }

      console.log('Retrieved stored matches:', storedMatches);
      const matches = JSON.parse(storedMatches);
      console.log('Parsed matches:', matches);

      const nearbySellers = matches.filter(match => {
        const distance = haversineDistance(
          coords.latitude,
          coords.longitude,
          match.latitude,
          match.longitude
        );
        console.log(`Checking seller ${match.seller_id}:`, {
          name: match.name,
          distance,
          alreadyNotified: notifiedSellers.has(match.seller_id)
        });
        return distance <= 10 && !notifiedSellers.has(match.seller_id);
      });

      console.log('Found nearby sellers:', nearbySellers);

      if (nearbySellers.length > 0) {
        console.log('Processing nearby sellers for notifications');
        for (const seller of nearbySellers) {
          console.log('Attempting to send notification for seller:', seller);
          try {
            await sendLocalNotification(seller);
            console.log('Successfully sent notification for seller:', seller.name);
            setNotifiedSellers(prev => new Set([...prev, seller.seller_id]));
          } catch (notificationError) {
            console.error('Error sending notification for seller:', seller.name, notificationError);
          }
        }
      } else {
        console.log('No new nearby sellers found to notify');
      }
    } catch (error) {
      console.error('Error checking nearby matches:', error);
    }
  };

  // Initialize notifications and location tracking
  useEffect(() => {
    registerForPushNotificationsAsync();
    
    // Only set up notification handlers if not in Expo Go
    if (Constants.appOwnership !== 'expo') {
      const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

      const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        const { sellerId } = response.notification.request.content.data;
        if (sellerId) {
          navigation.navigate('SellerProfile', { sellerId });
        }
      });

      return () => {
        notificationListener.remove();
        responseListener.remove();
        if (locationSubscriptionRef.current) {
          locationSubscriptionRef.current.remove();
          locationSubscriptionRef.current = null;
        }
      };
    }

    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
        locationSubscriptionRef.current = null;
      }
    };
  }, []);

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

  // Function to convert location text to coordinates
  const geocodeLocation = async (locationText) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationText)}`
      );
      if (response.data && response.data.length > 0) {
        return {
          latitude: parseFloat(response.data[0].lat),
          longitude: parseFloat(response.data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Error geocoding location:', error);
      return null;
    }
  };

  // Function to calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Function to fetch and process wishlist items
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

        // Get user's current location using the hook function
        const userLoc = await getUserLocation();
        setUserLocation(userLoc);

        if (userLoc) {
          // Process wishlist items and check for nearby listings
          const processedItems = await Promise.all(
            response.data.products.map(async (item) => {
              const itemLocation = await geocodeLocation(item.location);
              if (itemLocation) {
                const distance = calculateDistance(
                  userLoc.latitude,
                  userLoc.longitude,
                  itemLocation.latitude,
                  itemLocation.longitude
                );
                return {
                  ...item,
                  distance,
                  isNearby: distance <= 5 // 5km radius
                };
              }
              return {
                ...item,
                distance: null,
                isNearby: false
              };
            })
          );

          setWishlistItems(processedItems);
          setNearbyItems(processedItems.filter(item => item.isNearby));
        } else {
          setWishlistItems(response.data.products);
        }
      }
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      Alert.alert('Error', 'Failed to load wishlist items');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => navigation.navigate('ViewProduct', { product: item })}
    >
      <Image 
        source={{ uri: item.image_url }} 
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemLocation}>
          <Ionicons name="location-outline" size={12} color="gray" /> 
          {item.location}
        </Text>
        {item.isNearby && (
          <Text style={styles.nearbyText}>
            <Ionicons name="walk-outline" size={12} color="#4CAF50" /> 
            Nearby! ({item.distance.toFixed(1)} km)
          </Text>
        )}
        <Text style={styles.itemPrice}>PKR {item.price}</Text>
      </View>
    </TouchableOpacity>
  );

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
      const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'about', 'want', 'one', 'need'];
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
            keywords: extractedKeywords,
            latitude: 31.48451134818196,
            longitude: 74.30064829198984
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
        `${Constants.expoConfig.extra.API_URL}/wishlist/${userId}/remove`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { item: wishlistItems.find(item => item.wishlist_id === wishlistId)?.item_description }
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
          
          {isLoading ? (
            <Text style={styles.loadingText}>Loading wishlist items...</Text>
          ) : wishlistItems.length === 0 ? (
            <Text style={styles.emptyText}>Your wishlist is empty. Add items you're looking for!</Text>
          ) : (
            <FlatList
              data={wishlistItems}
              renderItem={renderItem}
              keyExtractor={(item) => item.listing_id?.toString() || item.wishlist_id?.toString() || Math.random().toString()}
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
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemLocation: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c7a7b',
  },
  nearbySection: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    marginBottom: 10,
  },
  nearbyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  nearbyText: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 5,
  },
});

export default WishlistView;
