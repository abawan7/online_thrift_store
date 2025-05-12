import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { TextInput } from 'react-native';
import Footer from './FooterView';
import Header from './Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { updateListing } from '../services/ListingService';

const EditItemView = ({ route, navigation }) => {
  // Get the item data from route params
  const { item } = route.params;
  
  const [title, setTitle] = useState(item.name || '');
  const [description, setDescription] = useState(item.description || '');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState(item.tags || []);
  const [location, setLocation] = useState(item.location || '');
  const [price, setPrice] = useState(item.price ? item.price.toString() : '');
  const [condition, setCondition] = useState(item.quality || '');
  const [titleCharCount, setTitleCharCount] = useState(100 - (item.name ? item.name.length : 0));
  const [descriptionCharCount, setDescriptionCharCount] = useState(200 - (item.description ? item.description.length : 0));
  
  // Initialize images array with existing images or empty slots
  const [images, setImages] = useState(Array(5).fill(null));
  const [imageFilenames, setImageFilenames] = useState(Array(5).fill(null));
  
  // Load existing images when component mounts
  useEffect(() => {
    if (item.images && item.images.length > 0) {
      const updatedImages = [...images];
      const updatedFilenames = [...imageFilenames];
      
      item.images.forEach((image, index) => {
        if (index < 5) {
          updatedImages[index] = image.url;
          updatedFilenames[index] = image.path;
        }
      });
      
      setImages(updatedImages);
      setImageFilenames(updatedFilenames);
    }
  }, [item]);

  const handleTitleChange = (input) => {
    if (input.length <= 100) {
      setTitle(input);
      setTitleCharCount(100 - input.length);
    }
  };

  const handleDescriptionChange = (input) => {
    if (input.length <= 200) {
      setDescription(input);
      setDescriptionCharCount(200 - input.length);
    }
  };

  const handleAddTag = () => {
    if (tag && tags.length < 5 && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const pickImage = async (index) => {
    // Ask for camera roll permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permission to select an image!');
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeImages,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled && result.assets && result.assets[0]) {
      // Extract the filename from the URI
      const uri = result.assets[0].uri;
      const filename = uri.split('/').pop();

      // Update the images and imageFilenames arrays
      let updatedImages = [...images];
      let updatedFilenames = [...imageFilenames];
      
      updatedImages[index] = uri;
      updatedFilenames[index] = filename;

      setImages(updatedImages);
      setImageFilenames(updatedFilenames);
    }
  };

  const uploadImageToCloudinary = async (uri) => {
    // Skip upload if the image is already a URL (existing image)
    if (uri && uri.startsWith('http')) {
      // Find the corresponding path from imageFilenames
      const index = images.findIndex(img => img === uri);
      const path = imageFilenames[index];
      return { url: uri, path };
    }
    
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${Constants.expoConfig.extra.CLOUD_NAME}/image/upload`;
  
    const fileUri = uri;
    const file = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
  
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/png',
      name: uri.split('/').pop(),
    });
  
    formData.append('upload_preset', 'thrift_store_upload');  // Use your preset name
  
    try {
      const response = await axios.post(cloudinaryUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      const { secure_url, public_id } = response.data;
      return { url: secure_url, path: public_id };
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error.response ? error.response.data : error);
      throw error;
    }
  };
  
  // Function to handle form submission
  const handleSubmit = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const uploadedImages = [];
  
      for (const uri of images.filter((image) => image !== null)) {
        const { url, path } = await uploadImageToCloudinary(uri);
        uploadedImages.push({ url, path });
      }
  
      const listingData = {
        user_id: userId,
        name: title,
        description,
        quality: condition,
        location,
        category: item.category || '',
        images: uploadedImages,
        tags,
        price: price,
      };
  
      // Make sure item.listing_id exists and is correctly passed
      if (!item || !item.listing_id) {
        throw new Error('Listing ID is missing');
      }
  
      console.log('Updating listing with ID:', item.listing_id);
      console.log('API URL:', `${Constants.expoConfig.extra.API_URL}/listing/${item.listing_id}`);
      
      const response = await axios.put(
        `${Constants.expoConfig.extra.API_URL}/listing/${item.listing_id}`, 
        listingData
      );
  
      Alert.alert('Success', 'Listing updated successfully!');
      console.log('Listing updated:', response.data);
      
      // Navigate back or refresh the inventory
      if (route.params.refreshData) {
        route.params.refreshData();
      }
      navigation.goBack();
  
    } catch (error) {
      console.error('Error updating listing:', error);
      Alert.alert('Error', 'Failed to update listing. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Online Thrift Store" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Edit Listing</Text>
        <Text style={styles.labels}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          maxLength={100}
          onChangeText={handleTitleChange}
        />
        <View style={styles.charCountContainer}>
          <Text style={styles.charCount}>{titleCharCount} characters left</Text>
        </View>

        <Text style={styles.labels}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          maxLength={200}
          onChangeText={handleDescriptionChange}
          multiline
        />
        <View style={styles.charCountContainer}>
          <Text style={styles.charCount}>{descriptionCharCount} characters left</Text>
        </View>

        <Text style={styles.labels}>Tag</Text>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={styles.tagInput}
            value={tag}
            onChangeText={setTag}
            placeholder="Add a tag"
          />
          <TouchableOpacity style={styles.addTagButton} onPress={handleAddTag}>
            <Text style={styles.addTagButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagsContainer}>
          {tags.map((t, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
              <TouchableOpacity onPress={() => handleRemoveTag(t)}>
                <Ionicons name="close-circle" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={styles.labels}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.labels}>Price (PKR)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <Text style={styles.labels}>Condition</Text>
        <View style={styles.conditionContainer}>
          {['New', 'Like New', 'Good', 'Fair', 'Poor'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.conditionOption,
                condition === option && styles.selectedCondition,
              ]}
              onPress={() => setCondition(option)}
            >
              <Text
                style={[
                  styles.conditionText,
                  condition === option && styles.selectedConditionText,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.labels}>Images</Text>
        <View style={styles.imagesContainer}>
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={styles.imagePickerButton}
              onPress={() => pickImage(index)}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.pickedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="add" size={24} color="#666" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1A434E',
  },
  labels: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCountContainer: {
    alignItems: 'flex-end',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginRight: 10,
  },
  addTagButton: {
    backgroundColor: '#1A434E',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  addTagButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    margin: 5,
  },
  tagText: {
    marginRight: 5,
  },
  conditionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  conditionOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 5,
  },
  selectedCondition: {
    backgroundColor: '#1A434E',
    borderColor: '#1A434E',
  },
  conditionText: {
    color: '#333',
  },
  selectedConditionText: {
    color: 'white',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imagePickerButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  pickedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  submitButton: {
    backgroundColor: '#1A434E',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditItemView;