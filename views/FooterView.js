import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; // Import the useNavigation hook
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Footer = ({ isSeller }) => {
  const navigation = useNavigation(); // Get the navigation object
  const [role, setRole] = useState(null); // State to store the role from AsyncStorage or isSeller

  useEffect(() => {
    const fetchRoleFromAsyncStorage = async () => {
      if (!isSeller) {
        // If isSeller is not passed, fetch role from AsyncStorage
        const storedRole = await AsyncStorage.getItem('role');
        setRole(storedRole);
      } else {
        // If isSeller is passed, use it as the role
        setRole(isSeller ? 'seller' : 'buyer');
      }
    };

    fetchRoleFromAsyncStorage();
  }, [isSeller]);

  // Conditional rendering based on role
  const currentRole = role || 'buyer'; // Default to 'buyer' if role is not yet determined

  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Home')}>
        <Ionicons name="home-outline" size={25} color="#1A434E" />
        <Text style={styles.footerText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate(currentRole === 'seller' ? 'UploadItem' : 'Wishlist')}>
        <Ionicons name={currentRole === 'seller' ? "cloud-upload-outline" : "bag-outline"} size={25} color="#1A434E" />
        <Text style={styles.footerText}>{currentRole === 'seller' ? 'Upload Item' : 'Wishlist'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('chatbot')}>
        <MaterialIcons name="smart-toy" size={24} color="#1A434E" />
        <Text style={styles.footerText}>Chatbot</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.footerItem} onPress={() => navigation.navigate('Profile')}>
        <Ionicons name="person-outline" size={25} color="#1A434E" />
        <Text style={styles.footerText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#ffffff',
  },
  footerItem: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 5,
  },
});

export default Footer;
