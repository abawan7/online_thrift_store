import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Header from './Header';
import Constants from 'expo-constants';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

const AddLocationScreen = ({ navigation }) => {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapRegion, setMapRegion] = useState({
    latitude: 31.5204,  // Default to Pakistan's coordinates
    longitude: 74.3587,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
      
      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // Get address from coordinates
      const response = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (response[0]) {
        const address = formatAddress(response[0]);
        setLocation(address);
        setSelectedLocation({ latitude, longitude });
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const formatAddress = (addressObj) => {
    const components = [
      addressObj.street,
      addressObj.district,
      addressObj.city,
      addressObj.region,
      addressObj.country
    ].filter(Boolean);
    return components.join(', ');
  };

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    
    try {
      const response = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (response[0]) {
        const address = formatAddress(response[0]);
        setLocation(address);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      Alert.alert('Error', 'Failed to get address for selected location');
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const response = await Location.geocodeAsync(searchQuery);

      if (response[0]) {
        const { latitude, longitude } = response[0];
        setMapRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setSelectedLocation({ latitude, longitude });

        // Get address details
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude,
          longitude
        });

        if (addressResponse[0]) {
          const address = formatAddress(addressResponse[0]);
          setLocation(address);
        }
      } else {
        Alert.alert('Location Not Found', 'Please try a different search term');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      Alert.alert('Error', 'Failed to search location');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!location || !selectedLocation) {
      Alert.alert("Error", "Please select a location on the map");
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('user_id');

      if (!token || !userId) {
        Alert.alert("Error", "User is not authenticated.");
        setLoading(false);
        return;
      }

      // Make a PUT request to update the user's location
      await axios.put(`${Constants.expoConfig.extra.API_URL}/updateLocation/${userId}`, {
        location,
        coordinates: selectedLocation // Send both address and coordinates
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update AsyncStorage
      await AsyncStorage.setItem('location', location);
      await AsyncStorage.setItem('access_level', '2');

      const locationStored = await AsyncStorage.getItem('location');
      const accessLevelStored = await AsyncStorage.getItem('access_level');

      console.log('Location:', locationStored);
      console.log('Access Level:', accessLevelStored);

      Alert.alert(
        "Success", 
        "Location updated successfully!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Error updating location:', err);
      Alert.alert("Error", "Failed to update location. Please try again.");
    } finally {
      setLoading(false);
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
        <View style={styles.form}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search location..."
              onSubmitEditing={searchLocation}
            />
            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={searchLocation}
              disabled={loading}
            >
              <Ionicons name="search" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Map View */}
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="Selected Location"
                description={location}
              />
            )}
          </MapView>

          {/* Location Display */}
          <View style={styles.locationDisplay}>
            <Text style={styles.locationLabel}>Selected Location:</Text>
            <Text style={styles.locationText}>{location || 'No location selected'}</Text>
          </View>

          {/* Current Location Button */}
          <TouchableOpacity 
            style={styles.currentLocationBtn}
            onPress={getCurrentLocation}
          >
            <Ionicons name="locate" size={24} color="#FFF" />
            <Text style={styles.currentLocationText}>Use Current Location</Text>
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[styles.saveBtn, loading && styles.disabledButton]}
            disabled={loading}
          >
            <Text style={styles.saveText}>
              {loading ? 'Saving...' : 'Save Location'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1A434E' 
  },
  scrollView: { 
    alignItems: "center", 
    marginTop: 20, 
    backgroundColor: '#fff', 
    borderRadius: 40, 
    paddingBottom: 20 
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 10,
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
  form: { 
    width: "90%", 
    marginTop: 10 
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#FFF",
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: "#1A434E",
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 15,
  },
  locationDisplay: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  currentLocationText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveBtn: { 
    backgroundColor: "#1A434E", 
    borderRadius: 8, 
    paddingVertical: 12, 
    alignItems: "center", 
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
});

export default AddLocationScreen;
