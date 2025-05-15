import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ImageBackground, Dimensions, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing JWT token
import useLocation from '../hooks/userLocation'; // Import useLocation hook
import AuthController from '../controllers/AuthController';
import { KeyboardAvoidingView, Platform , ScrollView} from 'react-native';
import eventEmitter from '../utils/EventEmitter';

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
  
      if (response.data.token) {
        // Store user data in AsyncStorage
        await AsyncStorage.setItem('userToken', response.data.token);
        await AsyncStorage.setItem('user_id', response.data.user.user_id.toString());
        await AsyncStorage.setItem('user_email', response.data.user.email);
        await AsyncStorage.setItem('user_phone', response.data.user.phone);
        await AsyncStorage.setItem('user_location', response.data.user.location || '');
        await AsyncStorage.setItem('user_access_level', response.data.user.access_level.toString());
        await AsyncStorage.setItem('user_name', response.data.user.name || '');
  
        // Emit login success event
        eventEmitter.emit('LOGIN_SUCCESS');
  
        // Navigate to Home screen
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.response?.data?.message || 'An error occurred during login'
      );
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
