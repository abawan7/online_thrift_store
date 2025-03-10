import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface SignupViewProps {
  navigation: NativeStackNavigationProp<any, any>;
}

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height * 0.9;

const SignupView: React.FC<SignupViewProps> = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('../assets/Login_page_background.png')}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.signupBox}>
        <Text style={styles.title}>Sign Up</Text>

        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color="#888" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888" />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color="#888" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#888" />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="key" size={20} color="#888" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Password" secureTextEntry placeholderTextColor="#888" />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="key" size={20} color="#888" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry placeholderTextColor="#888" />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="phone" size={20} color="#888" style={styles.icon} />
          <TextInput style={styles.input} placeholder="Enter Number" keyboardType="phone-pad" placeholderTextColor="#888" />
        </View>

        <TouchableOpacity style={styles.signupButton}>
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
  );
};

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
});

export default SignupView;
