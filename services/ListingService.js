import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

// Get all listings
export const getAllListings = async () => {
  try {
    const response = await axios.get(`${API_URL}/listings`);
    return response.data.listings;
  } catch (error) {
    console.error('Error fetching listings:', error);
    throw error;
  }
};

// Get listings by user ID
export const getUserListings = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/listings/user/${userId}`);
    return response.data.listings;
  } catch (error) {
    console.error('Error fetching user listings:', error);
    throw error;
  }
};

// Add a new listing
export const addListing = async (listingData) => {
  try {
    const response = await axios.post(`${API_URL}/listings`, listingData);
    return response.data;
  } catch (error) {
    console.error('Error adding listing:', error);
    throw error;
  }
};

// Update a listing
export const updateListing = async (listingId, listingData) => {
  try {
    const response = await axios.put(`${API_URL}/listings/${listingId}`, listingData);
    return response.data;
  } catch (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
};

// Delete a listing
export const deleteListing = async (listingId) => {
  try {
    const response = await axios.delete(`${API_URL}/listings/${listingId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
};