import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView } from 'react-native';
import Header from './Header';
import SideMenu from './SideMenu';
import Footer from './FooterView';

const ProfileView = () => {
        const [isSeller, setIsSeller] = useState(false); 
      
        const handleToggle = () => {
          setIsSeller(!isSeller);
        };

        
    return (
        <View style={styles.container}>
            <Header
                title="Online Thrift Store"
            />
        <ScrollView style={styles.content}>
        <View style={styles.profileContainer}>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>Ifra Ejaz</Text>
            <Text style={styles.email}>ifraeajz07@gmail.com</Text>
            <TouchableOpacity style={styles.editProfileBtn}>
              <Text>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Toggle Button */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Switch to {isSeller ? 'Buyer' : 'Seller'}</Text>
            <Switch 
              value={isSeller} 
              onValueChange={handleToggle} 
            />
          </View>
        </View>

        <View style={styles.menuItems}>
          <Text style={styles.menuItem}>Favourites</Text>
          <Text style={styles.menuItem}>Wishlist Items</Text>
          <Text style={styles.menuItem}>Notification Settings</Text>
          <Text style={styles.menuItem}>Settings</Text>
          <Text style={styles.menuItem}>Log Out</Text>
        </View>
      </ScrollView>
            <Footer />
        </View>

          
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 15,
      },
      profileContainer: {
        alignItems: 'center',
        marginBottom: 20,
      },
      profileInfo: {
        alignItems: 'center',
        marginBottom: 20,
      },
      userName: {
        fontSize: 20,
        fontWeight: 'bold',
      },
      email: {
        fontSize: 14,
        color: '#888',
        marginBottom: 10,
      },
      editProfileBtn: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#007BFF',
        borderRadius: 5,
      },
      switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
      },
      switchLabel: {
        fontSize: 16,
        marginRight: 10,
      },
      menuItems: {
        marginTop: 20,
      },
      menuItem: {
        fontSize: 16,
        paddingVertical: 10,
      },
});



export default ProfileView;

