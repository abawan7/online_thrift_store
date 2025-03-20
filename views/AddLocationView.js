import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Header from './Header';  // Assuming the Header component is used in your project
import Constants from 'expo-constants';
const AddLocationScreen = ({ navigation }) => {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);  // Initialize the loading state

  const handleSubmit = async () => {
    if (!location) {
      Alert.alert("Error", "Location is required.");
      return;
    }

    try {
      setLoading(true);  // Set loading to true while making the request
  
      // Get the user ID and token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('user_id');
  
      if (!token || !userId) {
        Alert.alert("Error", "User is not authenticated.");
        setLoading(false); // Set loading to false after the error
        return;
      }
  
      // Make a PUT request to update the user's location
      await axios.put(`${Constants.expoConfig.extra.API_URL}/updateLocation/${userId}`, {
        location
      }, {
        headers: {
          Authorization: `Bearer ${token}`  // Add the authorization token in the headers
        }
      });
      
      // Update AsyncStorage with the new location and access level
      await AsyncStorage.setItem('location', location);
      await AsyncStorage.setItem('access_level', '2'); // Set access level to seller
  
      // Log the stored AsyncStorage data
      const locationStored = await AsyncStorage.getItem('location');
      const accessLevelStored = await AsyncStorage.getItem('access_level');
  
      console.log('Location:', locationStored);
      console.log('Access Level:', accessLevelStored);
  
      Alert.alert("Success", "Location updated successfully!");
      navigation.goBack();
    } catch (err) {
      console.error('Error updating location:', err);
      Alert.alert("Error", "Failed to update location. Please try again.");
    } finally {
      setLoading(false);  // Set loading to false after the request is done
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Online Thrift Store" />

      <View style={styles.titleContainer}>
        <Ionicons name="location-outline" size={55} color="#FFF" />
        <Text style={styles.title}>Add Location</Text>
        <View style={styles.underline} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Input Fields */}
        <View style={styles.form}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter location"
          />
          <TouchableOpacity onPress={handleSubmit} style={styles.saveBtn}>
            <Text style={styles.saveText}>Save Location</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", backgroundColor: '#1A434E' },
  scrollView: { alignItems: "center", marginTop: 40, backgroundColor: '#fff', borderRadius: 40, height: '100%', },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 10,
  },
  underline: {
    width: 90,
    height: 2,
    backgroundColor: '#FFF',
    marginTop: 4,
    marginBottom: 10
  },
  form: { width: "85%", marginTop: 10 },
  label: { fontSize: 14, fontWeight: "bold", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  saveBtn: { 
    backgroundColor: "#1A434E", 
    borderRadius: 8, 
    paddingVertical: 12, 
    marginTop: 20, 
    alignItems: "center", 
    marginBottom: 30 
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
});

export default AddLocationScreen;
