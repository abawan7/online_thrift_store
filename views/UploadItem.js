import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker from expo-image-picker
import { TextInput } from 'react-native';
import Footer from './FooterView';
import Header from './Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // Import Axios
import * as FileSystem from 'expo-file-system';  // Import Expo FileSystem to get the file name
import Constants from 'expo-constants';
const UploadItemView = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState([]); 
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [titleCharCount, setTitleCharCount] = useState(100); 
  const [descriptionCharCount, setDescriptionCharCount] = useState(200);
  const [images, setImages] = useState(Array(5).fill(null));  // Initialize with 5 empty image slots
  const [imageFilenames, setImageFilenames] = useState(Array(5).fill(null)); // New array to store filenames

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
      mediaTypes: ImagePicker.MediaTypeImages,  // Use MediaType instead of MediaTypeOptions
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      // Log image details
      console.log('Selected Image:', result.assets[0]);

      // Extract the filename from the URI
      const uri = result.assets[0].uri;
      const filename = uri.split('/').pop(); // Get the filename from URI path

      // Update the images and imageFilenames arrays
      let updatedImages = [...images];
      let updatedFilenames = [...imageFilenames];
      
      updatedImages[index] = uri;  // Set the URI of the selected image
      updatedFilenames[index] = filename;  // Set the filename of the selected image

      setImages(updatedImages);
      setImageFilenames(updatedFilenames);  // Store the filename
    }
  };

  const handleSubmit = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id'); // Get the user_id from AsyncStorage

      const listingData = {
        user_id: userId,
        name: title,
        description,
        quality: condition,
        location,
        category: '', // Add category as needed
        images: imageFilenames.filter(filename => filename !== null), // Send only non-null filenames
        tags, // Pass the tags array
      };

      // Post the data directly from here
      const response = await axios.post(`${Constants.expoConfig.extra.API_URL}/listing`, listingData);

      // Handle success, you can show an alert or navigate the user
      Alert.alert('Success', 'Listing uploaded successfully!');
      console.log('Listing created:', response.data);
      
      // Clear the form after successful upload
      setTitle('');
      setDescription('');
      setTag('');
      setTags([]);
      setLocation('');
      setPrice('');
      setCondition('');
      setImages(Array(5).fill(null)); // Reset images
      setImageFilenames(Array(5).fill(null)); // Reset filenames
    } catch (error) {
      console.error('Error submitting listing:', error);
      Alert.alert('Error', 'Failed to upload listing. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Online Thrift Store" />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Upload Listing</Text>
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
        <TextInput
          style={styles.input}
          onSubmitEditing={handleAddTag}
          value={tag}
          onChangeText={setTag}
        />

        <View style={styles.tagContainer}>
          {tags.map((tagItem, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tagItem}</Text>
              <TouchableOpacity
                style={styles.removeTagButton}
                onPress={() => handleRemoveTag(tagItem)}
              >
                <Ionicons name="close-circle" size={16} color="black" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.charCountContainer}>
          <Text style={styles.charCount}>{tags.length}/5 tags</Text>
        </View>

        <Text style={styles.labels}>Location</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />

        <View style={styles.row}>
          <View style={styles.pickerContainer}>
            <Text style={styles.labels}>Price</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
            />
          </View>

          <View style={styles.pickerContainer}>
            <Text style={styles.labels}>Condition</Text>
            <TextInput
              style={styles.input}
              value={condition}
              onChangeText={setCondition}
            />
          </View>
        </View>

        <View style={styles.uploadImagesContainer}>
          <Text style={styles.labels}>Upload 1 to 5 images</Text>
          <View style={styles.imageIcons}>
            {images.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={styles.imageIcon}
                onPress={() => pickImage(index)}  // Trigger image picker on icon press
              >
                {image ? (
                  <Image source={{ uri: image }} style={styles.imageIcon} />
                ) : (
                  <Ionicons name="camera" size={20} color="black" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.uploadButton} onPress={handleSubmit}>
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
      </ScrollView>

      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  labels: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    paddingLeft: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    paddingLeft: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCountContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  charCount: {
    fontSize: 12,
    color: '#888',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D3D3D3',
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
  },
  removeTagButton: {
    marginLeft: 10,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    width: '42%',
  },
  uploadImagesContainer: {
    marginVertical: 20,
  },
  imageIcons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageIcon: {
    width: 50,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  uploadButton: {
    backgroundColor: '#1A434E',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UploadItemView;
