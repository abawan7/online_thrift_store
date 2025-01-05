import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height * 0.9;

export default function LoginView({ navigation }) {
  return (
    <ImageBackground source={require('../assets/Login_page_background.png')} style={styles.container} imageStyle={styles.backgroundImage}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>Login</Text>
        
        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email or username"
            placeholderTextColor="#888"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <FontAwesome name="key" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={true}
            placeholderTextColor="#888"
          />
        </View>
        
        <TouchableOpacity onPress={() => navigation.navigate('Forgetpassword')}>
          <Text style={styles.forgotPassword}>Forget Password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupLink}>Sign Up</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ProximityCheck')}>
          <Text style={styles.signupText}>Proximity Check <Text style={styles.signupLink}>Click Here</Text></Text>
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
});
