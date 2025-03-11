import React from 'react';
import { Alert } from 'react-native';

export default class NotificationController {
    static renderNotificationPage(navigation) {
        navigation.navigate('NotificationScreen');
    }
}
