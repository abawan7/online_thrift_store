import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from './Header';
import Footer from './FooterView';

const SellerProfileView = ({ route, navigation }) => {
  const { sellerEmail, sellerName } = route.params;
  const [sellerProducts, setSellerProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('Products'); // Add state for active tab
  
  useEffect(() => {
    // Get the data from App.js through the navigation state
    const fetchSellerProducts = async () => {
      try {
        // Access the data from the navigation state
        const { data } = navigation.getState().routes.find(route => route.name === 'Home').params;
        
        // Filter products by seller email
        const filteredProducts = data.filter(item => item.user_email === sellerEmail);
        setSellerProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching seller products:', error);
      }
    };

    fetchSellerProducts();
  }, [sellerEmail, navigation]);

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ViewProduct', { product: item })}
    >
      <Image source={{ uri: item.image_url }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productLocation}>
          <Ionicons name="location-outline" size={12} color="gray" /> {item.location}
        </Text>
        <Text style={styles.productPrice}>PKR {item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  // Add tab rendering function
  const renderTabContent = () => {
    switch(activeTab) {
      case 'Products':
        return (
          <View style={styles.productsSection}>
            {sellerProducts.length > 0 ? (
              <FlatList
                data={sellerProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.listing_id.toString()}
                numColumns={2}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.noProductsText}>No products found from this seller.</Text>
            )}
          </View>
        );
      case 'About':
        return (
          <View style={styles.aboutSection}>
            <Text style={styles.aboutText}>This seller has not provided any additional information.</Text>
          </View>
        );
      case 'Reviews':
        return (
          <View style={styles.reviewsSection}>
            <Text style={styles.reviewsText}>No reviews yet for this seller.</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Online Thrift Store" />
      
      <View style={styles.mainContainer}>
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg' }} 
            style={styles.profileImage} 
          />
          <Text style={styles.sellerName}>{sellerName}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>4.0 (150 Reviews)</Text>
          </View>
        </View>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Products' && styles.activeTab]} 
            onPress={() => setActiveTab('Products')}
          >
            <Text style={[styles.tabText, activeTab === 'Products' && styles.activeTabText]}>Listings</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'About' && styles.activeTab]} 
            onPress={() => setActiveTab('About')}
          >
            <Text style={[styles.tabText, activeTab === 'About' && styles.activeTabText]}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Reviews' && styles.activeTab]} 
            onPress={() => setActiveTab('Reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'Reviews' && styles.activeTabText]}>Reviews</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          {/* Render content based on active tab */}
          {renderTabContent()}
        </ScrollView>
      </View>
      
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A434E', // Updated to match the teal color in the image
  },
  mainContainer: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e8f0ed', // Light background for profile card
    borderRadius: 10,
    margin: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  sellerName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#333',
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A434E', // Match the background color
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'white',
  },
  tabText: {
    fontSize: 16,
    color: 'white',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: 'white', // White background for the content area
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  // Content sections
  productsSection: {
    padding: 5,
  },
  aboutSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  reviewsSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  reviewsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  // Existing styles
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A434E',
  },
  noProductsText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  }
});

export default SellerProfileView;