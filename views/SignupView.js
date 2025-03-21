import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import PhoneInput from 'react-native-phone-number-input';  // Import the phone number input library
import AuthController from '../controllers/AuthController';
import { KeyboardAvoidingView, Platform , ScrollView} from 'react-native';


const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height * 0.9;

export default function SignupView({ navigation }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [phoneCode, setPhoneCode] = useState('PK');  // Store the country code (default is 'PK' for Pakistan)

  const validateInputs = () => {
    if (!email || !username || !password || !confirmPassword || !phoneNumber) {
      return "All fields are required.";
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return "Please enter a valid email.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    if (password.length < 6) {
      return "Password should be at least 6 characters.";
    }

    // Ensure phone number has exactly 11 digits, where country code is considered as 1 digit.
    // We take the phone number and validate only the digits after the country code
    const phoneWithoutExtension = phoneNumber.slice(phoneCode.length); // Remove the country code part
    if (phoneWithoutExtension.length !== 11 || !/^\d{11}$/.test(phoneWithoutExtension)) {
      return "Please enter a valid 10-digit phone number excluding the country code.";
    }

    return null;  // No errors
  };

  const handleSignUp = async () => {
    const errorMessage = validateInputs();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    try {
      const response = await axios.post('http://192.168.100.233:3000/signup', {
        email,
        username,
        password,
        phone_number: phoneNumber,
      });

      alert(response.data.message);
      navigation.navigate('Login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    <ImageBackground source={require('../assets/Login_page_background.png')} style={styles.container} imageStyle={styles.backgroundImage}>
    <View style={[styles.signupBox, { marginTop: 50 }]}>
        <Text style={styles.title}>Sign Up</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={(text) => setEmail(text.toLowerCase())} // Convert email to lowercase
          />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#888"
            value={username}
            onChangeText={(text) => setUsername(text.toLowerCase())} // Convert username to lowercase
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

        <View style={styles.inputContainer}>
          <FontAwesome name="key" size={20} color="#888" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry={true}
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* Phone number input */}
        <View style={styles.inputContainer}>
          <PhoneInput
            defaultValue={phoneNumber}
            defaultCode={phoneCode} // Set the default country code to Pakistan (or the current value of phoneCode)
            onChangeFormattedText={text => {
              setPhoneNumber(text);  // Set the phone number with country code
            }}
            containerStyle={styles.phoneInput}  // Single container for the phone input
            textContainerStyle={styles.phoneTextContainer}
            onChangeCountry={(country) => {
              setPhoneCode(country.cca2);  // Update the country code when the user selects a new country
            }}
          />
        </View>

        <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Sign In</Text>
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
  signupBox: {
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
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#fff',
  },
  phoneTextContainer: {
    flex: 1,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  signupButton: {
    width: '100%',
    backgroundColor: '#00494D',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#555',
    fontSize: 14,
  },
  loginLink: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    fontSize: 14,
  },
});
