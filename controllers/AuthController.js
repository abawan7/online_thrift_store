import React from 'react';
import { Alert } from 'react-native';

export default class AuthController {
    // Handles user login
    static handleLogin(navigation) {
        navigation.navigate('Home');
    }

    // Handles navigating to the forget password screen
    static handleForgetPassword(navigation) {
        // Navigate to the Forget Password screen
        navigation.navigate('Forgetpassword');
    }

    // Handles navigating to the signup screen
    static handleSignup(navigation) {
        // Navigate to the Signup screen
        navigation.navigate('Signup');
    }

    // Handles logging out logic (if needed in the future)
    static handleLogout(navigation) {
        navigation.navigate('Login');
    }

    static signIn(navigation) {
        navigation.navigate('Login');
    }
}
