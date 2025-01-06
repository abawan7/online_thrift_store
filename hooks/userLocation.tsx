import { useState } from "react";
import * as Location from "expo-location";

const useLocation = () => {
    const [latitude, setLatitude] = useState<string | null>(null);
    const [longitude, setLongitude] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [address, setAddress] = useState<string | null>(null);

    const getUserLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setErrorMsg("Permission to access location was denied");
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setLatitude(location.coords.latitude.toString());
            setLongitude(location.coords.longitude.toString());

            // Fetch address using reverse geocoding
            reverseGeocode(location.coords.latitude, location.coords.longitude);
        } catch (error) {
            setErrorMsg("An error occurred while fetching location");
        }
    };

    const reverseGeocode = async (lat: number, lon: number) => {
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

    return { getUserLocation, latitude, longitude, address, errorMsg };
};

export default useLocation;
