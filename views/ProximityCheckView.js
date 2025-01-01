import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    ImageBackground,
} from 'react-native';
import { getDistance } from 'geolib';

// Hardcoded checkpoints
const checkpoints = [
    { name: 'Model Town', latitude: 31.4832, longitude: 74.3031 },
    { name: 'Johar Town', latitude: 31.4722, longitude: 74.2662 },
    { name: 'Faisal Town', latitude: 31.4834, longitude: 74.3038 },
    { name: 'Gulberg', latitude: 31.5204, longitude: 74.3587 },
    { name: 'Shadman', latitude: 31.5357, longitude: 74.3405 },
];

const ProximityCheckView = ({ navigation }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [targetLocation1, setTargetLocation1] = useState(null);
    const [targetLocation2, setTargetLocation2] = useState(null);
    const [targetLocation3, setTargetLocation3] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentSelection, setCurrentSelection] = useState(null); // Tracks which dropdown is active
    const [proximityResults, setProximityResults] = useState([]);

    const proximityRange = 5000; // Proximity range in meters (5 km)

    const handleSelect = (item) => {
        if (currentSelection === 'userLocation') {
            setUserLocation(item);
        } else if (currentSelection === 'targetLocation1') {
            setTargetLocation1(item);
        } else if (currentSelection === 'targetLocation2') {
            setTargetLocation2(item);
        } else if (currentSelection === 'targetLocation3') {
            setTargetLocation3(item);
        }
        setModalVisible(false);
    };

    const handleCheckProximity = () => {
        if (!userLocation || !targetLocation1 || !targetLocation2 || !targetLocation3) {
            setProximityResults([{ error: 'Please select all locations.' }]);
            return;
        }

        // Calculate distances to all target locations
        const distances = [
            {
                target: targetLocation1.name,
                distance: getDistance(
                    { latitude: userLocation.latitude, longitude: userLocation.longitude },
                    { latitude: targetLocation1.latitude, longitude: targetLocation1.longitude }
                ),
            },
            {
                target: targetLocation2.name,
                distance: getDistance(
                    { latitude: userLocation.latitude, longitude: userLocation.longitude },
                    { latitude: targetLocation2.latitude, longitude: targetLocation2.longitude }
                ),
            },
            {
                target: targetLocation3.name,
                distance: getDistance(
                    { latitude: userLocation.latitude, longitude: userLocation.longitude },
                    { latitude: targetLocation3.latitude, longitude: targetLocation3.longitude }
                ),
            },
        ];

        // Check if distances are within proximity
        const results = distances.map((entry) => ({
            target: entry.target,
            distance: entry.distance,
            withinProximity: entry.distance <= proximityRange,
        }));

        setProximityResults(results);
    };

    return (
        <ImageBackground
            source={require('../assets/Login_page_background.png')}
            style={styles.container}
            imageStyle={styles.backgroundImage}
        >
            <View style={styles.contentContainer}>
                <Text style={styles.heading}>Proximity Check</Text>

                {/* User Location Dropdown */}
                <Text style={styles.label}>Select Your Location</Text>
                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => {
                        setCurrentSelection('userLocation');
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.dropdownText}>
                        {userLocation ? userLocation.name : 'Choose Location'}
                    </Text>
                </TouchableOpacity>

                {/* Target Locations */}
                <Text style={styles.label}>Select Target Locations</Text>
                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => {
                        setCurrentSelection('targetLocation1');
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.dropdownText}>
                        {targetLocation1 ? targetLocation1.name : 'Choose Location 1'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => {
                        setCurrentSelection('targetLocation2');
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.dropdownText}>
                        {targetLocation2 ? targetLocation2.name : 'Choose Location 2'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => {
                        setCurrentSelection('targetLocation3');
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.dropdownText}>
                        {targetLocation3 ? targetLocation3.name : 'Choose Location 3'}
                    </Text>
                </TouchableOpacity>

                {/* Button to Check Proximity */}
                <TouchableOpacity style={styles.button} onPress={handleCheckProximity}>
                    <Text style={styles.buttonText}>Check Proximity</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginText}>
                        Already have an account? <Text style={styles.loginLink}>Sign In</Text>
                    </Text>
                </TouchableOpacity>

                {/* Display Proximity Results */}
                {proximityResults.length > 0 && (
                    <View style={styles.resultContainer}>
                        {proximityResults[0].error ? (
                            <Text style={styles.errorText}>{proximityResults[0].error}</Text>
                        ) : (
                            proximityResults.map((result, index) => (
                                <Text key={index} style={styles.resultText}>
                                    {result.target}: {':  '}
                                    {result.withinProximity
                                        ? 'Within Proximity Range'
                                        : 'Outside Proximity Range'}
                                </Text>
                            ))
                        )}
                    </View>
                )}

                {/* Modal for Dropdown Options */}
                <Modal visible={modalVisible} transparent animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <FlatList
                                data={checkpoints}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.option}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text style={styles.optionText}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    backgroundImage: {
        height: '50%',
        width: '112%',
    },
    contentContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        elevation: 10,
        paddingBottom: 20,
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginVertical: 10,
    },
    dropdown: {
        padding: 15,
        borderRadius: 5,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 20,
    },
    dropdownText: {
        fontSize: 16,
        color: '#555',
    },
    button: {
        backgroundColor: '#00494D',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resultContainer: {
        marginTop: 20,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#e6e6e6',
        alignItems: 'center',
    },
    resultText: {
        fontSize: 16,
        marginVertical: 5,
    },
    errorText: {
        fontSize: 16,
        color: 'red',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    option: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    optionText: {
        fontSize: 16,
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#00494D',
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    loginText: {
        color: '#555',
        fontSize: 14,
        textAlign: 'center',
    },
    loginLink: {
        color: '#007BFF',
        fontWeight: 'bold',
    },
});

export default ProximityCheckView;
