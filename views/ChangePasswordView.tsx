import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface ChangePasswordViewProps {
    navigation: NativeStackNavigationProp<any, any>;
}

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height * 0.9;

const ChangePasswordView: React.FC<ChangePasswordViewProps> = ({ navigation }) => {
    return (
        <ImageBackground
            source={require('../assets/Login_page_background.png')}
            style={styles.container}
            imageStyle={styles.backgroundImage}
        >
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Login')}>
                <View style={styles.circle}>
                    <FontAwesome name="arrow-left" size={24} color="#000" />
                </View>
            </TouchableOpacity>
            <View style={styles.loginBox}>
                <Text style={styles.title}>Change Password</Text>

                <View style={styles.inputContainer}>
                    <FontAwesome name="key" size={20} color="#888" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <FontAwesome name="key" size={20} color="#888" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm Password"
                        secureTextEntry
                        placeholderTextColor="#888"
                    />
                </View>

                <TouchableOpacity style={styles.loginButton}>
                    <Text style={styles.loginButtonText}>Change</Text>
                </TouchableOpacity>
            </View>
            <StatusBar style="auto" />
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
    },
    backgroundImage: {
        height: '50%',
        width: '112%',
    },
    loginBox: {
        height: "60%",
        width: '112%',
        backgroundColor: '#fff',
        borderRadius: 30,
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6.27,
        elevation: 10,
        marginBottom: 0,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 25,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 55,
        borderColor: '#ccc',
        borderWidth: 1.5,
        borderRadius: 15,
        paddingHorizontal: 15,
        marginVertical: 12,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 18,
    },
    loginButton: {
        width: '100%',
        backgroundColor: '#00494D',
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: 'center',
        marginVertical: 20,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 1,
    },
    circle: {
        width: 35,
        height: 35,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6.27,
        elevation: 10,
        borderWidth: 2,
        borderColor: '#000000',
    },
});

export default ChangePasswordView;