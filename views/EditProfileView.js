import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Header from './Header';
import PhoneInput from 'react-native-phone-number-input';  // Import the phone number input library
import AsyncStorage from '@react-native-async-storage/async-storage';  // For accessing the saved token

const EditProfileScreen = () => {
    const navigation = useNavigation();

    // State for form inputs
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [phoneCode, setPhoneCode] = useState('PK');  // Store the country code (default is 'PK' for Pakistan)

    // Fetch user session data from AsyncStorage
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Retrieve user session from AsyncStorage
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const parsedData = JSON.parse(userData);

                    // Set state values with user data
                    setFirstName(parsedData.firstName);
                    setLastName(parsedData.lastName);
                    setUsername(parsedData.username);
                    setEmail(parsedData.email);
                    setPhoneNumber(parsedData.phone);
                    setPhoneCode(parsedData.phoneCode);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <View style={styles.container}>
            {/* Header */}
            <Header title="Online Thrift Store" />

            <View style={styles.titleContainer}>
                <Ionicons name="pencil-outline" size={55} color="#FFF" />
                <Text style={styles.EditTitle}>Edit Profile</Text>
                <View style={styles.underline} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollView}>
                {/* Profile Picture */}
                <View style={styles.profilePicContainer}>
                    <Image 
                        source={{ uri: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg' }} 
                        style={styles.profilePic} 
                    />
                    <TouchableOpacity style={styles.cameraIcon}>
                        <Ionicons name="camera" size={20} color="black" />
                    </TouchableOpacity>
                </View>

                {/* Input Fields */}
                <View style={styles.form}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

                    <Text style={styles.label}>Last Name</Text>
                    <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

                    <Text style={styles.label}>Username</Text>
                    <TextInput style={styles.input} value={username} onChangeText={setUsername} />

                    <Text style={styles.label}>Email</Text>
                    <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.phoneInputContainer}>
                        <PhoneInput
                            defaultValue={phoneNumber}
                            defaultCode={phoneCode}  // Set the default country code
                            onChangeFormattedText={text => {
                                setPhoneNumber(text);  // Set the phone number with country code
                            }}
                            containerStyle={styles.phoneInput}  // Style the container for the phone input
                            textContainerStyle={styles.phoneTextContainer}
                            onChangeCountry={(country) => {
                                setPhoneCode(country.cca2);  // Update the country code when the user selects a new country
                            }}
                        />
                    </View>

                    <TouchableOpacity style={styles.changePasswordBtn}>
                        <Text style={styles.changePasswordText}>Change Password</Text>
                        <Ionicons name="lock-closed" size={16} color="black" />
                    </TouchableOpacity>

                    {/* Save Button */}
                    <TouchableOpacity style={styles.saveBtn}>
                        <Text style={styles.saveText}>SAVE</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", backgroundColor: '#1A434E',},
    scrollView: { alignItems: "center", marginTop: 40, backgroundColor: '#fff', borderRadius: 40, },
    profilePicContainer: { marginTop: -40, alignItems: "center", justifyContent: "center" },
    profilePic: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: "white" },
    cameraIcon: { position: "absolute", bottom: 5, right: 5, backgroundColor: "white", borderRadius: 20, padding: 4 },
    editProfileText: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
    form: { width: "85%", marginTop: 10 },
    label: { fontSize: 14, fontWeight: "bold", marginTop: 10 },
    input: { borderWidth: 1, borderColor: "#000", borderRadius: 8, padding: 10, fontSize: 16 },
    phoneInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 8,
        padding:2,
        backgroundColor: "#FFF",
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
    changePasswordBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#D3D3D3", // Light gray background
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 15,
        width: "100%", // Full width
        opacity: 0.8, // Slight transparency effect
    },
    changePasswordText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333", // Dark text for visibility
        marginRight: 8, // Spacing between text and icon
    },
    saveBtn: { backgroundColor: "#1A434E", borderRadius: 8, paddingVertical: 12, marginTop: 15, alignItems: "center", marginBottom: 100, },
    saveText: { color: "white", fontSize: 16, fontWeight: "bold" },
    titleContainer: {
        alignItems: 'center',
    },
    EditTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    underline: {
        width: 90,
        height: 2,
        backgroundColor: '#FFF',
        marginTop: 4,
        marginBottom: 10
    },
});

export default EditProfileScreen;
