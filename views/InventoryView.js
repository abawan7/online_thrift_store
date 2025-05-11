import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Header from './Header';
import Footer from './FooterView';
import SideMenu from './SideMenu';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const screenWidth = Dimensions.get('window').width;
const menuWidth = screenWidth * 0.7;

const InventoryView = ({ navigation }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-menuWidth)).current;
  const [activeTab, setActiveTab] = useState('Not Sold');
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

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

  // Fetch inventory items
  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        // Get user email from AsyncStorage
        const email = await AsyncStorage.getItem('email');
        setUserEmail(email);
        
        // Fetch all listings data from App.js
        const { data } = navigation.getState().routes.find(route => route.name === 'Home').params;
        
        // Filter listings to only show those uploaded by the current user
        const userListings = data.filter(item => item.user_email === email);
        
        console.log('User email:', email);
        console.log('Filtered listings:', userListings);
        
        setInventoryItems(userListings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory items:', error);
        setLoading(false);
        
        // For demo purposes, set some dummy data
        setInventoryItems([
          {
            listing_id: '1',
            name: 'Handball Spezial Shoes',
            description: 'Inside, outside and everything in between. Handball Spezial shoes are ready for anything',
            price: '20000',
            location: 'Johar Town, Lahore Pakistan',
            image_url: 'https://assets.adidas.com/images/w_1880,f_auto,q_auto/237264d18bb14f108f80e83ba4644ffb_9366/IF7086_01_standard.jpg',
            status: 'active'
          },
          {
            listing_id: '2',
            name: 'Xbox Series X 1TB',
            description: 'Xbox Series X 1TB | With 2 controllers and power cable',
            price: '80000',
            location: 'Valencia Town, Lahore',
            image_url: 'https://gamestoppakistan.com/cdn/shop/products/2_f079828d-5804-4a55-81d8-ba4f9e03f167.jpg?v=1734508868&width=1946',
            status: 'active'
          }
        ]);
      }
    };

    fetchInventoryItems();
  }, [navigation]);

  // Render inventory item
  const renderInventoryItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <Text style={styles.itemPrice}>PKR {item.price}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditItem', { 
            item: item,
            refreshData: navigation.getState().routes.find(route => route.name === 'Home').params.refreshData
          })}
        >
          <Ionicons name="pencil-outline" size={20} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('ViewProduct', { product: item })}
        >
          <Ionicons name="eye-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Filter items based on active tab
  const getFilteredItems = () => {
    // For now, we don't have status information in the data
    // So we'll just return all items for the 'Not Sold' tab
    // and empty arrays for other tabs
    if (activeTab === 'Not Sold') {
      return inventoryItems;
    } else if (activeTab === 'Sold') {
      return []; // No sold items yet
    } else {
      return []; // No archived items yet
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
        {/* Inventory Icon and Title */}
        <View style={styles.titleContainer}>
          <Ionicons name="build-outline" size={40} color="#fff" style={styles.titleIcon} />
          <Text style={styles.title}>Inventory</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Not Sold' && styles.activeTab]}
            onPress={() => setActiveTab('Not Sold')}
          >
            <Text style={[styles.tabText, activeTab === 'Not Sold' && styles.activeTabText]}>
              Not Sold
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Sold' && styles.activeTab]}
            onPress={() => setActiveTab('Sold')}
          >
            <Text style={[styles.tabText, activeTab === 'Sold' && styles.activeTabText]}>
              Sold
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'Archive' && styles.activeTab]}
            onPress={() => setActiveTab('Archive')}
          >
            <Text style={[styles.tabText, activeTab === 'Archive' && styles.activeTabText]}>
              Archive
            </Text>
          </TouchableOpacity>
        </View>

        {/* Item Count */}
        <View style={styles.itemCountContainer}>
          <Text style={styles.itemCount}>{getFilteredItems().length} Items</Text>
          <TouchableOpacity style={styles.sortButton}>
            <Ionicons name="filter-outline" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Inventory List */}
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <FlatList
            data={getFilteredItems()}
            renderItem={renderInventoryItem}
            keyExtractor={(item) => item.listing_id.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No items found in this category.</Text>
            }
          />
        )}
      </View>

      <Footer isSeller={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#1A434E',
  },
  titleContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  titleIcon: {
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#1A434E',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#1A434E',
    fontWeight: 'bold',
  },
  itemCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  sortButton: {
    padding: 5,
  },
  listContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A434E',
    marginTop: 5,
  },
  actionButtons: {
    justifyContent: 'space-around',
    paddingLeft: 10,
  },
  actionButton: {
    padding: 5,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

export default InventoryView;