import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

// Define the task name
const LOCATION_TRACKING = 'location-tracking';
const API_URL = Constants.expoConfig.extra.API_URL;

// Register the task
TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.error('Location tracking task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
  
  if (data) {
    const { locations } = data;
    const location = locations[0];
    
    if (location) {
      // Log to console that the cron job is working
      console.log('===== LOCATION CRON JOB RUNNING =====');
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`Latitude: ${location.coords.latitude}`);
      console.log(`Longitude: ${location.coords.longitude}`);
      console.log(`Accuracy: ${location.coords.accuracy} meters`);
      console.log('====================================');
      
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
  }
  
  return BackgroundFetch.BackgroundFetchResult.NoData;
});

// Helper function to get user ID (implement based on your auth system)
const getUserId = async () => {
  // Replace with your actual implementation to get the user ID
  // For example, from AsyncStorage
  return "user123"; // Placeholder
};

// Function to start location tracking
export const startLocationTracking = async () => {
  try {
    // Request permissions first
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      console.log('Permission to access location was denied');
      return false;
    }

    // Request background permissions
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      console.log('Permission to access location in background was denied');
      // You can still track in foreground only
    }

    // Register the background fetch task
    await BackgroundFetch.registerTaskAsync(LOCATION_TRACKING, {
      minimumInterval: 10, // 10 seconds (in seconds)
      stopOnTerminate: false, // Continue tracking when app is terminated
      startOnBoot: true, // Start tracking when device restarts
    });

    // Configure foreground service notification (Android only)
    const foregroundService = {
      notificationTitle: 'Location Tracking',
      notificationBody: 'Tracking your location for nearby items',
      notificationColor: '#1A434E',
    };

    // Start location updates - IMPORTANT CHANGES HERE
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000, // 10 seconds (in milliseconds)
      distanceInterval: 0, // Set to 0 to get updates regardless of distance change
      deferredUpdatesInterval: 10000, // Force updates every 10 seconds
      deferredUpdatesDistance: 0, // No minimum distance for deferred updates
      foregroundService,
      // iOS requires significant changes for background updates
      activityType: Device.isIOS 
        ? Location.ActivityType.Other // Changed from AutomotiveNavigation to Other
        : Location.ActivityType.Other,
      showsBackgroundLocationIndicator: true, // iOS only
    });

    console.log('Location tracking started successfully');
    console.log('Location updates will occur every 10 seconds regardless of movement');
    
    // Start a foreground timer as a backup to ensure we get updates
    if (Device.isIOS) {
      // On iOS, we'll use a timer as a backup to ensure we get location updates
      const locationTimer = setInterval(async () => {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
          });
          
          console.log('===== TIMER-BASED LOCATION UPDATE =====');
          console.log(`Timestamp: ${new Date().toISOString()}`);
          console.log(`Latitude: ${location.coords.latitude}`);
          console.log(`Longitude: ${location.coords.longitude}`);
          console.log(`Accuracy: ${location.coords.accuracy} meters`);
          console.log('=======================================');
        } catch (error) {
          console.error('Error getting location in timer:', error);
        }
      }, 10000);
      
      // Store the timer ID somewhere if you need to clear it later
      global.locationTimerId = locationTimer;
    }
    
    return true;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    return false;
  }
};

// Function to stop location tracking
export const stopLocationTracking = async () => {
  try {
    await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
    await BackgroundFetch.unregisterTaskAsync(LOCATION_TRACKING);
    
    // Clear the timer if it exists
    if (global.locationTimerId) {
      clearInterval(global.locationTimerId);
      global.locationTimerId = null;
    }
    
    console.log('Location tracking stopped');
    return true;
  } catch (error) {
    console.error('Error stopping location tracking:', error);
    return false;
  }
};

// Function to check if tracking is enabled
export const isLocationTrackingEnabled = async () => {
  try {
    return await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING);
  } catch (error) {
    console.error('Error checking if location tracking is enabled:', error);
    return false;
  }
};

// Function to get the current location once and log it
export const getCurrentLocationAndLog = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log('Permission to access location was denied');
    return null;
  }

  try {
    console.log('Fetching current location...');
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    // Log the location data
    console.log('===== CURRENT LOCATION =====');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Latitude: ${location.coords.latitude}`);
    console.log(`Longitude: ${location.coords.longitude}`);
    console.log(`Accuracy: ${location.coords.accuracy} meters`);
    console.log('============================');
    
    return location;
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

// Add this function to your LocationService.js
export const testForegroundLocationUpdates = async () => {
  try {
    console.log('Testing foreground location updates...');
    
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return false;
    }
    
    // Start watching position in foreground
    const locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 0,
      },
      (location) => {
        console.log('===== FOREGROUND LOCATION UPDATE =====');
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log(`Latitude: ${location.coords.latitude}`);
        console.log(`Longitude: ${location.coords.longitude}`);
        console.log(`Accuracy: ${location.coords.accuracy} meters`);
        console.log('======================================');
      }
    );
    
    console.log('Foreground location updates started. Will run for 60 seconds.');
    
    // Stop after 60 seconds
    setTimeout(() => {
      locationSubscription.remove();
      console.log('Foreground location updates stopped after 60 seconds.');
    }, 60000);
    
    return true;
  } catch (error) {
    console.error('Error testing foreground location:', error);
    return false;
  }
};