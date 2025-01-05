import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ImageBackground, Dimensions, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const width = Dimensions.get('window').width;

export default function ForgetpasswordView({ navigation }) {
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity for fade animation

  const handleSendCode = () => {
    setShowCodeInput(true);
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1, // Fully visible
      duration: 500, // Animation duration in milliseconds
      useNativeDriver: true,
    }).start();
  };

  return (
      <ImageBackground source={require('../assets/Login_page_background.png')} style={styles.container} imageStyle={styles.backgroundImage}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
          <View style={styles.circle}>
            <FontAwesome name="arrow-left" size={24} color="#000" />
          </View>
        </TouchableOpacity>

        <View style={styles.loginBox}>
          <Text style={styles.title}>Forget Password</Text>

          <View style={styles.inputContainer}>
            <FontAwesome name="user" size={20} color="#888" style={styles.icon} />
            <TextInput
                style={styles.input}
                placeholder="Email or Username"
                placeholderTextColor="#888"
            />
          </View>

          {!showCodeInput && (
              <TouchableOpacity style={styles.sendcodeButton} onPress={handleSendCode}>
                <Text style={styles.sendcodeButtonText}>Send Code</Text>
              </TouchableOpacity>
          )}

          {showCodeInput && (
              <Animated.View style={[styles.codeInputContainer, { opacity: fadeAnim }]}>
                <Text style={styles.codePrompt}>Enter Code</Text>
                <View style={styles.codeFields}>
                  {Array(4).fill().map((_, index) => (
                      <TextInput
                          key={index}
                          style={styles.codeInput}
                          keyboardType="numeric"
                          maxLength={1}
                      />
                  ))}
                </View>
                <TouchableOpacity style={styles.enterButton} onPress={() => navigation.navigate('ChangePassword')}>
                  <Text style={styles.enterButtonText}>Enter</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                  <Text style={styles.resendText}>
                    Didn’t get the code? <Text style={styles.resendLink}>Resend Code</Text>
                  </Text>
                </TouchableOpacity>
              </Animated.View>
          )}
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1, // Ensure it stays on top of other elements
  },
  circle: {
    width: 35,
    height: 35,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6.27,
    elevation: 10,
    borderWidth: 2, // Thickness of the stroke
    borderColor: '#000000', // Color of the stroke
  },
  loginBox: {
    height: "70%",
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
    marginBottom: 20,
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
  sendcodeButton: {
    width: '100%',
    backgroundColor: '#00494D',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  sendcodeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  codeInputContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  codePrompt: {
    fontSize: 18,
    marginBottom: 10,
  },
  codeFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    fontSize: 18,
    borderColor: '#ccc',
    borderWidth: 1.5,
    borderRadius: 10,
    textAlign: 'center',
  },
  enterButton: {
    width: '100%',
    backgroundColor: '#00494D',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  enterButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendText: {
    color: '#555',
    fontSize: 14,
  },
  resendLink: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
});
