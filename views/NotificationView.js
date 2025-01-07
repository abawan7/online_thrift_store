import React from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Image } from 'react-native';
import Header from './Header'; // Import Header component
import Footer from './FooterView';
import {Ionicons} from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native'; // Import navigation ho

const NotificationScreen = ({ route, navigation }) => {
    const navigate = useNavigation(); // Initialize navigation
    const { notifications } = route.params; // Get notifications from route params

    const renderNotificationItem = ({ item }) => (
        <View style={styles.notificationCard}>
            <View style={styles.cardHeader}>
                <Image
                    source={{
                        uri: "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg", // Replace with a profile image URL if available
                    }}
                    style={styles.profileImage}
                />
                <View style={styles.textContainer}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationTime}>{item.time}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                {item.items.map((itemDetail, index) => (
                    <View key={index} style={styles.itemDetails}>
                        <Image
                            source={{ uri: itemDetail.image }}
                            style={styles.itemImage}
                        />
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{itemDetail.name}</Text>
                            <Text style={styles.itemLocation}>
                                <Ionicons name="location-outline" size={12} color="gray" /> {item.location || 'Location not available'}
                            </Text>
                            <Text style={styles.itemPrice}>PKR {itemDetail.price}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );


    return (
        <View style={styles.container}>
            <Header
                title="Notifications"
                onMenuPress={() => navigation.goBack()} // Go back to the previous screen
                onNotificationsPress={() => console.log('Notifications Pressed')}
            />
            <Text style={styles.header}>Notifications</Text>
            <View style={styles.underline} />
            <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item, index) => index.toString()}
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
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 25,
        marginLeft: 10,
    },
    notificationCard: {
        backgroundColor: '#ffffff',
        marginBottom: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        overflow: 'hidden',
        width: 380,
        alignSelf: "center",
        borderWidth: 1,
        borderColor: 'Black',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a434e',
    },
    notificationTime: {
        fontSize: 12,
        color: '#777',
        marginTop: 2,
    },
    cardBody: {
        padding: 12,
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
    },
    itemDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 7,
        padding: 7,
        backgroundColor: 'rgba(183, 202, 174, 0.44)', // 44% transparency
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#B7CAAE',
        elevation: 2,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemLocation: {
        fontSize: 13,
        color: 'gray',
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2c7a7b',
        textAlign: "right",
        marginRight: 5,
    },

    underline: {
        width: 385,
        height: 2,
        backgroundColor: '#1A434E',
        marginTop: 4,
        marginBottom: 20,
        marginLeft: 7,
    },
});


export default NotificationScreen;
