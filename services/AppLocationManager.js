import { startLocationTracking, isLocationTrackingEnabled } from './LocationService';

// Function to initialize location tracking when app starts
export const initializeLocationTracking = async () => {
  try {
    // Check if tracking is already enabled
    const isEnabled = await isLocationTrackingEnabled();
    
    if (!isEnabled) {
      console.log('Starting background location tracking...');
      await startLocationTracking();
    } else {
      console.log('Background location tracking already running');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize location tracking:', error);
    return false;
  }
};