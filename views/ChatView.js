import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import io from 'socket.io-client';

const ChatView = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [socket, setSocket] = useState(null);
  const flatListRef = useRef(null);
  const { conversationId, sellerId, sellerName } = route.params;

  useEffect(() => {
    const setupChat = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        setUserId(storedUserId);

        // Initialize socket connection
        const socketInstance = io(Constants.expoConfig.extra.API_URL);
        setSocket(socketInstance);

        // Join the conversation room
        socketInstance.emit('join_room', conversationId);

        // Listen for new messages
        socketInstance.on('receive_message', (message) => {
          setMessages(prevMessages => [...prevMessages, message]);
          flatListRef.current?.scrollToEnd();
        });

        // Fetch existing messages
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(
          `${Constants.expoConfig.extra.API_URL}/api/messages/${conversationId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setMessages(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error setting up chat:', error);
        setLoading(false);
      }
    };

    setupChat();

    return () => {
      if (socket) {
        socket.emit('leaveConversation', { conversationId });
        socket.disconnect();
      }
    };
  }, [conversationId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        conversationId,
        content: newMessage.trim(),
        senderId: parseInt(userId, 10)
      };

      // Send message through socket only
      socket.emit('send_message', messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.sender_id === userId;

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText
        ]}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A434E" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{sellerName}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.message_id.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={newMessage.trim() ? '#1A434E' : '#ccc'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1A434E',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 5,
    padding: 12,
    borderRadius: 15,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1A434E',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
});

export default ChatView; 