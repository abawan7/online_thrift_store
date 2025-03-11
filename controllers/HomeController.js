import React from 'react';
import { Alert } from 'react-native';

export default class HomeController {
    static async renderHomePage(navigation) {
        navigation.navigate('Home');
    }
}
