import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Header from './Header';

const EditProfileScreen = () => {
    const navigation = useNavigation();

    // State for form inputs
    const [firstName, setFirstName] = useState("Ifra");
    const [lastName, setLastName] = useState("Ejaz");
    const [username, setUsername] = useState("ifraejaz07");
    const [email, setEmail] = useState("ifraejaz07@gmail.com");
    const [phoneNumber, setPhoneNumber] = useState("123 456789");

    // Dropdown states
    const [birth, setBirth] = useState("Birth");
    const [gender, setGender] = useState("Gender");
    const [isBirthModalVisible, setBirthModalVisible] = useState(false);
    const [isGenderModalVisible, setGenderModalVisible] = useState(false);

    // Country Code State
    const [selectedCountry, setSelectedCountry] = useState({ name: "Pakistan", code: "+92" });
    const [isCountryModalVisible, setCountryModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            {/* Header */}
            <Header title="Online Thrift Store" />

            <View style={styles.titleContainer}>
                <Ionicons name="pencil-outline" size={75} color="#FFF" />
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
                        <TouchableOpacity style={styles.countryCodeButton} onPress={() => setCountryModalVisible(true)}>
                            <Text style={styles.phoneCode}>{selectedCountry.code}</Text>
                            <Ionicons name="chevron-down" size={16} color="black" />
                        </TouchableOpacity>
                        <TextInput 
                            style={styles.phoneInput} 
                            value={phoneNumber} 
                            onChangeText={setPhoneNumber} 
                            keyboardType="phone-pad" 
                        />
                    </View>

                    {/* Dropdowns for Birth and Gender */}
                    <View style={styles.dropdownContainer}>
                        <TouchableOpacity style={styles.dropdownButton} onPress={() => setBirthModalVisible(true)}>
                            <Text style={styles.dropdownText}>{birth}</Text>
                            <Ionicons name="chevron-down" size={18} color="black" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.dropdownButton} onPress={() => setGenderModalVisible(true)}>
                            <Text style={styles.dropdownText}>{gender}</Text>
                            <Ionicons name="chevron-down" size={18} color="black" />
                        </TouchableOpacity>
                    </View>

                    {/* Modals */}
                    <Modal visible={isCountryModalVisible} transparent animationType="slide">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <FlatList 
                                    data={[
                                        { name: "Pakistan", code: "+92" },
                                        { name: "United States", code: "+1" },
                                        { name: "United Kingdom", code: "+44" },
                                        { name: "India", code: "+91" },
                                        { name: "Germany", code: "+49" },
                                        { name: "Australia", code: "+61" }
                                    ]}
                                    keyExtractor={(item) => item.code}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity 
                                            style={styles.modalItem} 
                                            onPress={() => { setSelectedCountry(item); setCountryModalVisible(false); }}
                                        >
                                            <Text style={styles.modalText}>{`${item.name} (${item.code})`}</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                                <TouchableOpacity onPress={() => setCountryModalVisible(false)} style={styles.modalClose}>
                                    <Text style={styles.modalCloseText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    <Modal visible={isBirthModalVisible} transparent animationType="slide">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                {["January", "February", "March", "April"].map((item) => (
                                    <TouchableOpacity key={item} style={styles.modalItem} onPress={() => { setBirth(item); setBirthModalVisible(false); }}>
                                        <Text style={styles.modalText}>{item}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity onPress={() => setBirthModalVisible(false)} style={styles.modalClose}>
                                    <Text style={styles.modalCloseText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    <Modal visible={isGenderModalVisible} transparent animationType="slide">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                {["Male", "Female", "Other"].map((item) => (
                                    <TouchableOpacity key={item} style={styles.modalItem} onPress={() => { setGender(item); setGenderModalVisible(false); }}>
                                        <Text style={styles.modalText}>{item}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity onPress={() => setGenderModalVisible(false)} style={styles.modalClose}>
                                    <Text style={styles.modalCloseText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

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
    scrollView: { alignItems: "center", marginTop: 45, backgroundColor: '#fff', borderRadius: 40, },
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
        padding: 12,
        marginTop: 10,
        backgroundColor: "#FFF",
    },
    phoneCode: {
        fontSize: 16,
        fontWeight: "bold",
        color: "Black",
        marginRight: 10,
    },
    phoneInput: {
        flex: 1,
        fontSize: 16,
        color: "#000",
    },
    countryCodeButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#000",
        backgroundColor: "#fff",
        marginRight: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        marginHorizontal: 40,
        borderRadius: 8,
    },
    modalItem: {
        paddingVertical: 10,
    },
    modalClose: {
        marginTop: 10,
        alignItems: "center",
    },
    modalCloseText: {
        fontSize: 16,
        color: "red",
    },
    saveBtn: { backgroundColor: "#1A434E", borderRadius: 8, paddingVertical: 12, marginTop: 15, alignItems: "center", marginBottom: 100, },
    saveText: { color: "white", fontSize: 16, fontWeight: "bold" },
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
    titleContainer: {
        alignItems: 'center',
      },
    EditTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#1A434E',
    },
    dropdownContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    
    dropdownButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 8,
        backgroundColor: "#FFF",
        marginHorizontal: 5,
    },
    
    dropdownText: {
        fontSize: 16,
        color: "#333",
        fontWeight: "500",
    },
    
    
});

export default EditProfileScreen;
