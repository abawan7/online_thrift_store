import React, { useState, useRef } from 'react';
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
    Dimensions
} from 'react-native';
import Header from './Header';
import Footer from './FooterView';
import SideMenu from './SideMenu';
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get('window').width;
const menuWidth = screenWidth * 0.5;

interface Message {
    id: string;
    text: string;
}

const ChatbotView: React.FC = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const scrollViewRef = useRef<ScrollView>(null);

    const sendMessage = () => {
        if (message.trim()) {
            setMessages([...messages, { id: Date.now().toString(), text: message }]); 
            setMessage('');

            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
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
                            {messages.map((item) => (
                                <View key={item.id} style={styles.messageBubble}>
                                    <Text style={styles.messageText}>{item.text}</Text>
                                </View>
                            ))}
                        </ScrollView>

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
    messageBubble: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 20,
        maxWidth: '70%',
        alignSelf: 'flex-end',
        marginBottom: 5,
        marginTop:7,
        marginRight: 10,
    },
    messageText: {
        color: 'black',
        fontSize: 16,
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