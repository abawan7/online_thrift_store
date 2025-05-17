import React, { useState, useRef } from 'react';
import Constants from 'expo-constants';
import {
    View,
    StyleSheet,
    TextInput,
    Text,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    Keyboard,
    Animated,
    Dimensions,
    Image,
} from 'react-native';
import Header from './Header';
import Footer from './FooterView';
import SideMenu from './SideMenu';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage'; 
const screenWidth = Dimensions.get('window').width;
import axios from 'axios';
const menuWidth = screenWidth * 0.5;

const ChatbotView = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [showBotIntro, setShowBotIntro] = useState(true);  // New state for showing intro
    const scrollViewRef = useRef();



    const sendMessage = async() => {
        if (message.trim() === "") return;
        
        try {
            // Add the user message to the chat
            setMessages([...messages, { sender: "You", text: message }]);
            
            // Get the user_id from AsyncStorage
            const userId = await AsyncStorage.getItem('user_id');
            if (!userId) {
                console.error("No user ID found");
                return;
            }

            // Make the API call
            const response = await axios.get(`${Constants.expoConfig.extra.API_URL}/chat`, {
                params: {
                    user_id: userId,
                    user_input: message
                }
            });
        
            const botResponse = response.data.response;
            setMessages((prevMessages) => [...prevMessages, { sender: "Bot", text: botResponse }]);
            setMessage("");
            setShowBotIntro(false);
            
            // Scroll to bottom after message is sent
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
            
        } catch (error) {
            console.error("Error sending message:", error);
            // Add error message to chat
            setMessages((prevMessages) => [...prevMessages, { 
                sender: "Bot", 
                text: "Sorry, I'm having trouble connecting right now. Please try again later." 
            }]);
        }
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const slideAnim = useRef(new Animated.Value(-menuWidth)).current;
    
    const toggleMenu = () => {
        if (isMenuOpen) {
            Animated.timing(slideAnim, {
                toValue: -menuWidth,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setIsMenuOpen(false));
        } else {
            setIsMenuOpen(true);
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    };

    return (
        <View style={styles.container}>
            <Header
                title="Chatbot"
                onMenuPress={toggleMenu}
                onNotificationsPress={() => console.log('Notifications Pressed')}
            />

            <SideMenu slideAnim={slideAnim} toggleMenu={toggleMenu} menuWidth={menuWidth}/>
            {isMenuOpen && (
                <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
            )}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.chatArea}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.inner}>
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.messagesContainer}
                            contentContainerStyle={{ flexGrow: 1 }}
                            showsVerticalScrollIndicator={false}
                            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                        >
                            {showBotIntro && (
                                <View style={styles.botIntroContainer}>
                                    <Image
                                        source={require('../assets/bot.png')}
                                        style={styles.botImage}
                                    />
                                    <Text style={styles.botIntroText}>
                                        Hi there! I'm Thrifty, your personal shopping assistant from Re-quire. How can I assist you today?
                                    </Text>
                                </View>
                            )}

{messages.map((msg, index) => (
    <View key={index} style={msg.sender === "You" ? styles.messageWrapper : styles.botMessageWrapper}>
        {msg.sender === "Bot" && (
            <Image
                source={require('../assets/bot.png')} // Adjust the path to your bot's image
                style={styles.botpfp}
            />
        )}
        <View style={msg.sender === "You" ? styles.messageBubble : styles.botBubble}>
            <Text style={msg.sender === "You" ? styles.messageText : styles.botText}>
                {msg.text}
            </Text>
        </View>
    </View>
))}


                        </ScrollView>

                        {/* Chat Input Field */}
                        <View style={styles.inputContainer}>
                            <TouchableOpacity style={styles.iconWrapper}>
                                <Ionicons name="attach-outline" size={24} color="white" />
                            </TouchableOpacity>

                            <TextInput
                                style={styles.inputField}
                                placeholder="Type here..."
                                placeholderTextColor="#A9A9A9"
                                value={message}
                                onChangeText={setMessage}
                            />

                            <TouchableOpacity style={styles.iconWrapper} onPress={sendMessage}>
                                <Ionicons name="send" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            <Footer />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chatArea: {
        flex: 1,
    },
    inner: {
        flex: 1,
    },
    messagesContainer: {
        maxHeight: '85%', 
        paddingHorizontal: 10,
        paddingTop: 10,
        width: '100%',
    },
    botIntroContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '40%',
        
    },
    botImage: {
        width: 130,
        height: 130,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 9 }, 
        shadowOpacity: 0.4,
        shadowRadius: 5,
        
    },
    botpfp: {
        width: 50,
        padding:5,
        height: 50,
        
    },
    botIntroText: {
        fontSize: 16,
        color: '#818589',
        textAlign: 'center',
        paddingHorizontal: 20,
        marginTop:10,
        fontWeight: '600', 
        letterSpacing: 0.9,
        lineHeight: 22, 
        fontFamily: 'Time New Roman',
        textShadowColor: 'rgba(0, 0, 0, 0.3)', 
        textShadowOffset: { width: 1, height: 1 }, 
        textShadowRadius: 3, 
    },
    messageWrapper: {
        alignItems: 'flex-end', 
        marginBottom: 10,
    },

    botMessageWrapper: {
        flexDirection: 'row', 
        alignItems: 'flex-start', 
        marginBottom: 10,
    },

    messageBubble: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 20,
        maxWidth: '70%',
        alignSelf: 'flex-end',
        marginBottom: 5,
        marginTop: 7,
        marginRight: 10,
    },
    botBubble: {
        backgroundColor: "rgba(183, 202, 174, 0.44)",
        padding: 10,
        borderRadius: 20,
        maxWidth: "80%",
        flexDirection: 'row', 
        alignItems: 'center',
    },
    messageText: {
        color: 'black',
        fontSize: 16,
    },
    botText: {
        color: "black",
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '98%',
        borderRadius: 25,
        paddingVertical: 5,
        paddingHorizontal: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        position: 'absolute',
        bottom: 10, 
        alignSelf: 'center',
    },
    iconWrapper: {
        width: 40,
        height: 40,
        backgroundColor: '#1A434E',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    inputField: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        backgroundColor: 'white',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: screenWidth - menuWidth,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 500,
    },
});

export default ChatbotView;
