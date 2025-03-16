import React, { useState } from 'react';
import { View, Text,TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import Header from './Header';
import Footer from './FooterView';
import { Ionicons } from '@expo/vector-icons';  
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';  
import DropDownPicker from 'react-native-dropdown-picker';

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
    const [images, setImages] = useState([]);
    const handleTitleChange = (input) => {
        if (input.length <= 100) { 
          setTitle(input);
          setTitleCharCount(100 - input.length);
        }
      };
    
      // Handle Description Input
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
          <Text style={styles.labels}>Upload 1 to 10 images</Text>
          <View style={styles.imageIcons}>
            {[...Array(10)].map((_, index) => (
              <TouchableOpacity key={index} style={styles.imageIcon}>
                <Ionicons name="camera" size={20} color="black" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.uploadButton}>
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
    labels:{
        fontWeight:'bold',
        fontSize:16,
        marginBottom:10,
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
      textAlignVertical: 'top', // To make the text start from the top in the textarea
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
      tagInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
      
      simplePicker: {
        height: 40, 
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingLeft: 10,
      },
      
      pickerItem: {
        height: 40, 
        width: '100%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
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
