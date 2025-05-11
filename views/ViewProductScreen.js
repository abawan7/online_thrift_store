import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from './Header';
import Footer from './FooterView';

const { width } = Dimensions.get('window');

const ViewProductScreen = ({ route, navigation }) => {
  // Get the product data passed from the navigation params
  const { product } = route.params;

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
});

export default ViewProductScreen;