import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Layout from '../Layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import apiService from '../../api/apiService';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';
import { showError, showSuccess, showWarning } from '../../utils/ToastMessage';
import DeckCarousel from '../../components/DeckCard';

const CreatePostScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Pick Media ────────────────────────────────────────────────────
  const handlePickMedia = async () => {
    const result: any = await launchImageLibrary({
      mediaType: 'mixed',
      selectionLimit: 5,
      quality: 0.8,
    });

    if (result.didCancel) return;
    if (result.assets) {
      setSelectedMedia(prev => [...prev, ...result.assets]);
    }
  };

  // ── Remove by index (X button only) ──────────────────────────────
  const handleRemove = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  // ── Create Post ───────────────────────────────────────────────────
  const handleCreatePost = async () => {
    if (!caption.trim() && selectedMedia.length === 0) {
      showWarning('Please add a caption or select media');
      return;
    }

    try {
      setLoading(true);

      let uploadedMedia: any[] = [];
      if (selectedMedia.length > 0) {
        uploadedMedia = await Promise.all(
          selectedMedia.map(file => uploadToCloudinary(file)),
        );
      }

      const payload = {
        caption: caption.trim(),
        ...(uploadedMedia.length > 0 && { media: uploadedMedia }),
      };

      const res = await apiService.createPost(payload);

      if (res?.success) {
        showSuccess('Post created successfully');
        navigation.goBack();
      } else {
        showError('Failed to create post');
      }
    } catch {
      showError('Upload failed');
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

        {/* Carousel */}
        {selectedMedia.length > 0 && (
          <DeckCarousel media={selectedMedia} onRemove={handleRemove} />
        )}

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
            { backgroundColor: loading ? '#999' : '#6C63FF', marginBottom: 70 },
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
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  pickButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  captionInput: {
    minHeight: 110,
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#1c1c1e',
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  button: {
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
