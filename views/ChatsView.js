import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const ChatsView = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('user_id');
      setUserId(storedUserId);

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
          const messagesResponse = await axios.get(
            `${Constants.expoConfig.extra.API_URL}/api/messages/${conversation.conversation_id}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          const messages = messagesResponse.data;
          const lastMessage = messages[messages.length - 1] || null;

          // Get the seller's details
          const sellerResponse = await axios.get(
            `${Constants.expoConfig.extra.API_URL}/api/getUserProfile`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { user_id: conversation.seller_id }
            }
          );

          // Get the buyer's details
          const buyerResponse = await axios.get(
            `${Constants.expoConfig.extra.API_URL}/api/getUserProfile`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { user_id: conversation.buyer_id }
            }
          );

          // Determine which user to display based on who is the current user
          const isCurrentUserSeller = parseInt(storedUserId) === conversation.seller_id;
          const displayUser = isCurrentUserSeller ? buyerResponse.data.user : sellerResponse.data.user;

          return {
            ...conversation,
            lastMessage,
            otherUser: displayUser
          };
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
    const otherUser = item.otherUser || {};
    const lastMessage = item.lastMessage;
    const displayName = otherUser.name || 'Unknown User';
    const initial = displayName.charAt(0).toUpperCase();

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => navigation.navigate('Chat', {
          conversationId: item.conversation_id,
          sellerId: item.seller_id,
          sellerName: displayName,
          listingId: item.listing_id
        })}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {initial}
          </Text>
        </View>
        <View style={styles.conversationInfo}>
          <Text style={styles.userName}>{displayName}</Text>
          {lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMessage.content}
            </Text>
          )}
        </View>
        {lastMessage && (
          <Text style={styles.messageTime}>
            {new Date(lastMessage.created_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        )}
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
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        {conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No conversations yet</Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.conversation_id.toString()}
            contentContainerStyle={styles.conversationsList}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A434E',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight,
  },
  header: {
    padding: 15,
    backgroundColor: '#1A434E',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  conversationsList: {
    padding: 10,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1A434E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default ChatsView; 