import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from './Header';
import Footer from './FooterView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

const ViewProductScreen = ({ route, navigation }) => {
  // Get the product data passed from the navigation params
  const { product } = route.params;
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const getUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('user_id');
      const storedToken = await AsyncStorage.getItem('token');
      setUserId(storedUserId);
      setToken(storedToken);
    };
    getUserId();
  }, []);

  const handleChatPress = async () => {
    try {
      // Log the entire product object to see its structure
      console.log('Full product data:', JSON.stringify(product, null, 2));
      console.log('User ID:', userId);
      console.log('Token:', token);
      console.log('API URL:', Constants.expoConfig.extra.API_URL);
      console.log('Seller Email:', product.user_email);

      // First, let's verify the API URL is correct
      const apiUrl = `${Constants.expoConfig.extra.API_URL}/api/getUserProfile`;
      console.log('Making request to:', apiUrl);

      // Test the API connection first
      try {
        const testResponse = await axios.get(`${Constants.expoConfig.extra.API_URL}/test`);
        console.log('Test response:', testResponse.data);
      } catch (testError) {
        console.error('Test request failed:', testError.message);
        Alert.alert('Error', 'Could not connect to the server. Please try again.');
        return;
      }

      // Fetch seller's ID using their email
      const sellerResponse = await axios.get(
        apiUrl,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: {
            email: product.user_email
          }
        }
      );

      console.log('Seller Response:', JSON.stringify(sellerResponse.data, null, 2));

      if (!sellerResponse.data || !sellerResponse.data.user || !sellerResponse.data.user.user_id) {
        console.error('Could not fetch seller ID. Response:', sellerResponse.data);
        Alert.alert('Error', 'Could not identify the seller. Please try again.');
        return;
      }

      const sellerId = sellerResponse.data.user.user_id;
      const sellerName = sellerResponse.data.user.name;
      console.log('Seller ID:', sellerId);
      console.log('Seller Name:', sellerName);

      // Ensure buyer_id is a number
      const numericBuyerId = parseInt(userId, 10);
      if (isNaN(numericBuyerId)) {
        console.error('Invalid buyer ID:', userId);
        Alert.alert('Error', 'Invalid user ID. Please try logging in again.');
        return;
      }

      const conversationData = {
        listing_id: parseInt(product.listing_id, 10),
        seller_id: parseInt(sellerId, 10),
        buyer_id: numericBuyerId
      };

      console.log('Creating conversation with data:', JSON.stringify(conversationData, null, 2));

      // Create a new conversation if it doesn't exist
      const response = await axios.post(
        `${Constants.expoConfig.extra.API_URL}/api/conversations`,
        conversationData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Conversation created:', JSON.stringify(response.data, null, 2));

      navigation.navigate('Chat', {
        conversationId: response.data.conversation_id,
        sellerId: sellerId,
        sellerName: sellerName,
        listingId: product.listing_id
      });
    } catch (error) {
      console.error('Full error object:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      console.error('Error message:', error.message);
      Alert.alert('Error', 'Could not start conversation. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Online Thrift Store" />
      
      <ScrollView style={styles.scrollView}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.image_url }} 
            style={styles.productImage} 
            resizeMode="contain"
          />
          <View style={styles.imageIndicators}>
            <View style={[styles.indicator, styles.activeIndicator]} />
            <View style={styles.indicator} />
            <View style={styles.indicator} />
            <View style={styles.indicator} />
          </View>
        </View>
        
        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.titlePriceContainer}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>PKR {product.price}</Text>
          </View>
          
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.locationText}>{product.location}</Text>
          </View>
          
          {/* Seller Info */}
          <View style={styles.sellerContainer}>
            <Image 
              source={{ uri: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg' }} 
              style={styles.sellerImage} 
            />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{product.user_name}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SellerProfile', { sellerEmail: product.user_email, sellerName: product.user_name })}>
                <Text style={styles.viewProfile}>view profile</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactButton}>
                <Ionicons name="call-outline" size={20} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton}>
                <Ionicons name="chatbubble-outline" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Rating: </Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star}
                  name={star <= 4 ? "star" : "star-outline"} 
                  size={18} 
                  color="#FFD700" 
                />
              ))}
            </View>
          </View>
          
          {/* Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Brand:</Text>
                <Text style={styles.detailValue}>Apple</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Condition:</Text>
                <Text style={styles.detailValue}>Used</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>OS:</Text>
                <Text style={styles.detailValue}>MAC</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Model:</Text>
                <Text style={styles.detailValue}>Macbook</Text>
              </View>
            </View>
          </View>
          
          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
            <TouchableOpacity>
              <Text style={styles.seeMoreText}>see more</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.chatButton]}
          onPress={handleChatPress}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Chat with Seller</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="call-outline" size={20} color="#333" />
        </TouchableOpacity>
      </View>
      
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#e8f0ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageIndicators: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: '#1A434E',
  },
  productInfo: {
    padding: 15,
    backgroundColor: '#fff',
  },
  titlePriceContainer: {
    marginBottom: 10,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A434E',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationText: {
    marginLeft: 5,
    color: '#666',
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 15,
  },
  sellerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  sellerInfo: {
    marginLeft: 10,
    flex: 1,
  },
  sellerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewProfile: {
    color: '#1A434E',
    textDecorationLine: 'underline',
  },
  contactButtons: {
    flexDirection: 'row',
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingLabel: {
    fontWeight: 'bold',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  detailsSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    width: '50%',
    marginBottom: 10,
    alignItems: 'center',
  },
  detailLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  detailValue: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    color: '#666',
    lineHeight: 20,
  },
  seeMoreText: {
    color: '#1A434E',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  chatButton: {
    backgroundColor: '#1A434E',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ViewProductScreen;