import { useState } from "react";
import * as Location from "expo-location";

const useLocation = () => {
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [address, setAddress] = useState(null);
    const [geocodedLocation, setGeocodedLocation] = useState(null);

    // Get user's current location
    const getUserLocation = async () => {
        try {
            const servicesEnabled = await Location.hasServicesEnabledAsync();
            if (!servicesEnabled) {
                setErrorMsg("Location services are disabled");
                console.error("Location services are disabled");
                return;
            }

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
                return;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            const { latitude, longitude } = location.coords;

            setLatitude(latitude.toString());
            setLongitude(longitude.toString());

            await reverseGeocode(latitude, longitude);
        } catch (error) {
            console.error("Location Error:", error);
            setErrorMsg("An error occurred while fetching location");
        }
    };

    // Reverse geocode to get address from latitude and longitude
    const reverseGeocode = async (lat, lon) => {
        try {
            const reverseGeocodedAddress = await Location.reverseGeocodeAsync({
                latitude: lat,
                longitude: lon,
            });

            if (reverseGeocodedAddress.length > 0) {
                const { city, region, country } = reverseGeocodedAddress[0];
                setAddress(`${city}, ${region}, ${country}`);
            } else {
                setAddress("Address not found");
            }
        } catch (error) {
            console.error("Reverse Geocoding Error:", error);
            setAddress("Error fetching address");
        }
    };

    // Geocode an address to get latitude and longitude
    const geocodeAddress = async (inputAddress) => {
        try {
            const results = await Location.geocodeAsync(inputAddress);
            if (results.length > 0) {
                const { latitude, longitude } = results[0];
                setGeocodedLocation({ lat: latitude, lon: longitude });
                console.log(`Geocoded Address: Latitude ${latitude}, Longitude ${longitude}`);
                return { lat: latitude, lon: longitude }; // Return the geocoded location
            } else {
                setGeocodedLocation(null);
                setErrorMsg("Geocoding failed: Address not found");
                return null;
            }
        } catch (error) {
            console.error("Geocoding Error:", error);
            setErrorMsg("An error occurred while geocoding the address");
            return null;
        }
    };

    return {
        getUserLocation,
        reverseGeocode,
        geocodeAddress,
        latitude,
        longitude,
        address,
        geocodedLocation,
        errorMsg,
    };
};

export default useLocation;