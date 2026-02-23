import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import Layout from '../Layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../../api/apiService';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';

const CreatePostScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  // 📌 Pick Media
  const handlePickMedia = async () => {
    const result = await launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 5,
      quality: 0.8,
    });

    if (result.didCancel) return;

    if (result.assets) {
      setSelectedMedia(prev => [...prev, ...result.assets]);
    }
  };

  // ❌ Remove selected image
  const handleRemoveMedia = (index: number) => {
    const updated = [...selectedMedia];
    updated.splice(index, 1);
    setSelectedMedia(updated);
  };

  // 🚀 Create Post
  const handleCreatePost = async () => {
    if (!selectedMedia.length) {
      Alert.alert('Error', 'Please select media');
      return;
    }

    try {
      setLoading(true);

      // 🔥 Upload all media in parallel (FAST)
      const uploadedMedia = await Promise.all(
        selectedMedia.map(file => uploadToCloudinary(file)),
      );

      const payload = {
        caption,
        media: uploadedMedia,
      };

      const res = await apiService.createPost(payload);

      if (res?.success) {
        Alert.alert('Success', 'Post created successfully');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Something went wrong');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout paddingTop={insets.top}>
      <View style={styles.container}>
        {/* Pick Button */}
        <TouchableOpacity style={styles.pickButton} onPress={handlePickMedia}>
          <Text style={styles.pickButtonText}>Pick Media</Text>
        </TouchableOpacity>

        {/* Media Preview List */}
        <FlatList
          data={selectedMedia}
          horizontal
          keyExtractor={(_, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 12 }}
          renderItem={({ item, index }) => (
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: item.uri }}
                style={styles.image}
                resizeMode="cover"
              />

              {/* Cancel Icon */}
              <TouchableOpacity
                style={styles.cancelIcon}
                onPress={() => handleRemoveMedia(index)}
              >
                <Icon name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Caption */}
        <TextInput
          placeholder="Write a caption..."
          placeholderTextColor="#888"
          value={caption}
          onChangeText={setCaption}
          multiline
          style={[styles.captionInput, { color: colors.text }]}
        />

        {/* Share Button */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: loading ? '#999' : '#6C63FF',
              borderWidth: 2,
              marginBottom: 70,
            },
          ]}
          disabled={loading}
          onPress={handleCreatePost}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Share</Text>
          )}
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  pickButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  pickButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  imageWrapper: {
    marginRight: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 16,
  },
  cancelIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 4,
  },
  captionInput: {
    minHeight: 100,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#1c1c1e',
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
