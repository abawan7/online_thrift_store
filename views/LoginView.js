import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing JWT token
import useLocation from '../hooks/userLocation'; // Import useLocation hook
import AuthController from '../controllers/AuthController';
import { KeyboardAvoidingView, Platform , ScrollView} from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height * 0.9;


export default function LoginView({ navigation }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { geocodeAddress } = useLocation(); // Use the location hook

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${Constants.expoConfig.extra.API_URL}/login`, {
        email: emailOrUsername,
        password,
      });
  
      // Check if the login was successful
      console.log('Login success:', response.data);
  
      const { location } = response.data.user;
      let latitude = null;
    let longitude = null;

    // If location exists, fetch latitude and longitude using geocoding API
    if (location && location !== 'Unknown location') {
      const geocodedLocation = await geocodeAddress(location); // Get latitude and longitude
      if (geocodedLocation) {
        latitude = geocodedLocation.lat;
        longitude = geocodedLocation.lon;
      } else {
        console.log('Failed to geocode location');
        latitude = '0';  // Default value when geocoding fails
        longitude = '0'; // Default value when geocoding fails
      }
    } else {
      latitude = '0';  // Default value when location is null
      longitude = '0'; // Default value when location is null
    }
  
      // Store the JWT token, user data, and location (latitude, longitude)
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user_id', response.data.user.user_id.toString());
      await AsyncStorage.setItem('email', response.data.user.email);
      await AsyncStorage.setItem('phone', response.data.user.phone);
      await AsyncStorage.setItem('access_level', response.data.user.access_level.toString());
      await AsyncStorage.setItem('location', location || null);
      await AsyncStorage.setItem('latitude', latitude.toString());
      await AsyncStorage.setItem('longitude', longitude.toString());
      await AsyncStorage.setItem('role', 'buyer');

  
      console.log('All data stored in AsyncStorage');
  
      // Navigate to the Home screen after successful login
      navigation.navigate('Home');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };
  

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <ImageBackground source={require('../assets/Login_page_background.png')} style={styles.container} imageStyle={styles.backgroundImage}>
      <View style={[styles.loginBox, { marginTop: 50 }]}>
        <Text style={styles.title}>Login</Text>

        {/* Error Message */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email or username"
            placeholderTextColor="#888"
            value={emailOrUsername}
            onChangeText={(text) => setEmailOrUsername(text.toLowerCase())}
          />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="key" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity onPress={() => AuthController.handleForgetPassword(navigation)}>
          <Text style={styles.forgotPassword}>Forget Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => AuthController.handleSignup(navigation)}>
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>

      </View>
      <StatusBar style="auto" />
    </ImageBackground>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  backgroundImage: {
    height: '50%',
    width: '112%',
  },
  loginBox: {
    height: "60%",
    width: '112%',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6.27,
    elevation: 10,
    marginBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 55,
    borderColor: '#ccc',
    borderWidth: 1.5,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginVertical: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 18,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#007BFF',
    marginVertical: 10,
    fontSize: 14,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#00494D',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    color: '#555',
    fontSize: 14,
  },
  signupLink: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
  },
});
