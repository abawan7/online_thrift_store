import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert, Animated, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from './Header';
import Footer from './FooterView';
import SideMenu from './SideMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const menuWidth = width * 0.5;

const ViewProductScreen = ({ route, navigation }) => {
  // Get the product data passed from the navigation params
  const { product } = route.params;
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoadingPhone, setIsLoadingPhone] = useState(false);
  const slideAnim = useRef(new Animated.Value(-menuWidth)).current;

  useEffect(() => {
    const getUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('user_id');
      const storedToken = await AsyncStorage.getItem('token');
      setUserId(storedUserId);
      setToken(storedToken);
    };
    getUserId();
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

  const handleChatPress = async () => {
    try {
      setIsLoadingPhone(true);
      console.log('Starting chat with seller:', product.user_email);
      
      const response = await axios.get(
        `${Constants.expoConfig.extra.API_URL}/api/getUserProfile`,
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

      console.log('Seller profile response:', response.data);

      if (response.data && response.data.user) {
        const sellerId = response.data.user.user_id;
        const sellerName = response.data.user.name;

        // Create or get existing conversation
        const conversationResponse = await axios.post(
          `${Constants.expoConfig.extra.API_URL}/api/conversations`,
          {
            seller_id: sellerId,
            buyer_id: userId
          },
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Conversation response:', conversationResponse.data);

        // Navigate to chat screen
        navigation.navigate('Chat', {
          conversationId: conversationResponse.data.conversation_id,
          sellerId: sellerId,
          sellerName: sellerName
        });
      } else {
        Alert.alert('Error', 'Could not find seller information');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      Alert.alert('Error', 'Could not start chat. Please try again.');
    } finally {
      setIsLoadingPhone(false);
    }
  };

  const handlePhonePress = async () => {
    try {
      setIsLoadingPhone(true);
      console.log('Fetching profile for email:', product.user_email);
      
      const response = await axios.get(
        `${Constants.expoConfig.extra.API_URL}/api/getUserProfile`,
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

      console.log('Profile response:', response.data);

      if (response.data && response.data.user && response.data.user.phone) {
        const phoneNumber = response.data.user.phone;
        console.log('Found phone number:', phoneNumber);
        
        // Show confirmation dialog before opening dialer
        Alert.alert(
          'Call Seller',
          `Would you like to call ${response.data.user.name} at ${phoneNumber}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Call',
              onPress: () => {
                console.log('Opening dialer for:', phoneNumber);
                Linking.openURL(`tel:${phoneNumber}`);
              }
            }
          ]
        );
      } else {
        console.log('No phone number found in response:', response.data);
        Alert.alert('Error', 'Seller phone number is not available');
      }
    } catch (error) {
      console.error('Error fetching seller phone:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      Alert.alert('Error', 'Could not fetch seller phone number. Please try again.');
    } finally {
      setIsLoadingPhone(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Product Details"
        onMenuPress={toggleMenu}
        onNotificationsPress={() => navigation.navigate('NotificationScreen')}
      />
      <SideMenu slideAnim={slideAnim} toggleMenu={toggleMenu} menuWidth={menuWidth} />
      {isMenuOpen && (
        <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
      )}
      <ScrollView style={styles.content}>
        <Image source={{ uri: product.image_url }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productLocation}>
            <Ionicons name="location-outline" size={16} color="gray" /> {product.location}
          </Text>
          <Text style={styles.productPrice}>PKR {product.price}</Text>
          
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
              <TouchableOpacity 
                style={[styles.contactButton, isLoadingPhone && styles.contactButtonDisabled]} 
                onPress={handlePhonePress}
                disabled={isLoadingPhone}
              >
                {isLoadingPhone ? (
                  <ActivityIndicator size="small" color="#333" />
                ) : (
                  <Ionicons name="call-outline" size={20} color="#333" />
                )}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.contactButton, isLoadingPhone && styles.contactButtonDisabled]} 
                onPress={handleChatPress}
                disabled={isLoadingPhone}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>
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
  content: {
    flex: 1,
  },
  productImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  productLocation: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A434E',
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: width - menuWidth,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 500,
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
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
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
  contactButtonDisabled: {
    opacity: 0.5,
  },
});

export default ViewProductScreen;