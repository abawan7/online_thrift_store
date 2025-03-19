import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing JWT token
import AuthController from '../controllers/AuthController';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height * 0.9;

// Set up Axios base URL for the API
axios.defaults.baseURL = 'http://localhost:3000'; // Replace with the correct URL if needed

export default function LoginView({ navigation }) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('/login', {
        email: emailOrUsername,
        password,
      });

      // Store JWT token and user data
      await AsyncStorage.setItem('token', response.data.token);  // Store JWT token securely
      await AsyncStorage.setItem('user_id', response.data.user.user_id.toString());  // Store user ID
      await AsyncStorage.setItem('email', response.data.user.email);  // Store email
      await AsyncStorage.setItem('phone', response.data.user.phone);  // Store phone
      await AsyncStorage.setItem('access_level', response.data.user.access_level.toString());  // Store access level

      // Navigate to the Home screen after successful login
      navigation.navigate('Home');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <ImageBackground source={require('../assets/Login_page_background.png')} style={styles.container} imageStyle={styles.backgroundImage}>
      <View style={styles.loginBox}>
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
            onChangeText={setEmailOrUsername}
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
