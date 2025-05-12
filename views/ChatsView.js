import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import Header from './Header';
import Footer from './FooterView';
import SideMenu from './SideMenu';

const screenWidth = Dimensions.get('window').width;
const menuWidth = screenWidth * 0.5;

const ChatsView = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-menuWidth)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('user_id');
      setUserId(storedUserId);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

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

  const fetchConversations = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${Constants.expoConfig.extra.API_URL}/api/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Get the last message for each conversation
      const conversationsWithLastMessage = await Promise.all(
        response.data.map(async (conversation) => {
          try {
            const messagesResponse = await axios.get(
              `${Constants.expoConfig.extra.API_URL}/api/messages/${conversation.conversation_id}`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            const messages = messagesResponse.data;
            const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

            return {
              ...conversation,
              last_message: lastMessage ? lastMessage.content : 'No messages yet',
              last_message_time: lastMessage ? lastMessage.created_at : null
            };
          } catch (error) {
            console.error('Error fetching messages for conversation:', error);
            return {
              ...conversation,
              last_message: 'No messages yet',
              last_message_time: null
            };
          }
        })
      );

      setConversations(conversationsWithLastMessage);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const renderConversation = ({ item }) => {
    const displayName = item.seller_name;
    const lastMessage = item.last_message || 'No messages yet';
    const lastMessageTime = item.last_message_time ? new Date(item.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigation.navigate('Chat', {
          conversationId: item.conversation_id,
          sellerId: item.seller_id,
          sellerName: displayName
        })}
      >
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={50} color="#1A434E" />
        </View>
        <View style={styles.conversationInfo}>
          <Text style={styles.conversationName}>{displayName}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage}
          </Text>
        </View>
        <Text style={styles.timeText}>{lastMessageTime}</Text>
      </TouchableOpacity>
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
    <View style={styles.container}>
      <Header
        title="Messages"
        onMenuPress={toggleMenu}
        onNotificationsPress={() => navigation.navigate('NotificationScreen')}
      />
      <SideMenu slideAnim={slideAnim} toggleMenu={toggleMenu} menuWidth={menuWidth} />
      {isMenuOpen && (
        <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
      )}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.conversation_id.toString()}
        contentContainerStyle={styles.conversationList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No conversations yet</Text>
          </View>
        }
      />
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  conversationList: {
    padding: 15,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 15,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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

export default ChatsView; 