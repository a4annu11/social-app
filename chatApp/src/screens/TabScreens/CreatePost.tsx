import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Layout from '../Layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import apiService from '../../api/apiService';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';
import { showError, showSuccess, showWarning } from '../../utils/ToastMessage';
import DeckCarousel from '../../components/DeckCard';

import { useForm, FormProvider } from 'react-hook-form';
import { TextField } from '../../components/UI/Input';
import { GradientButton, OutLineButton } from '../../components/UI/Button';
import AppHeader from '../../components/AppHeader';
import Icon from 'react-native-vector-icons/Ionicons';

const CreatePostScreen = () => {
  const insets = useSafeAreaInsets();
  const { colors }: any = useTheme();
  const navigation = useNavigation();

  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      caption: '',
    },
  });

  // ── Pick Media ──────
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

  // ── Remove Media ─────────────
  const handleRemove = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  // ── Create Post ──────────────
  const handleCreatePost = async () => {
    const { caption } = methods.getValues();

    if (!caption?.trim() && selectedMedia.length === 0) {
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
        caption: caption?.trim(),
        ...(uploadedMedia.length > 0 && { media: uploadedMedia }),
      };

      const res = await apiService.createPost(payload);

      if (res?.success) {
        showSuccess('Post created successfully');

        methods.reset();
        setSelectedMedia([]);

        navigation.goBack();
      } else {
        showError('Failed to create post');
      }
    } catch (error) {
      showError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout paddingTop={insets.top}>
      <AppHeader
        isLogo={true}
        rightIcon1={
          <Icon
            name="add-circle-sharp"
            size={28}
            color={colors.Text_Primary_Color}
          />
        }
        onPressRightIcon1={handlePickMedia}
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <FormProvider {...methods}>
          <View style={styles.container}>
            {/* Media Carousel */}
            {selectedMedia.length > 0 && (
              <DeckCarousel media={selectedMedia} onRemove={handleRemove} />
            )}

            {/* Caption Field */}
            <View style={{ marginBottom: 30 }}>
              <TextField
                name="caption"
                placeholder="Write a caption..."
                multiline
                numberOfLines={4}
                maxLength={300}
                showCharCount
                height={110}
                backgroundColor="#1c1c1e"
              />
            </View>
            <View style={{ marginTop: 'auto', paddingBottom: 70 }}>
              <GradientButton
                title="Share To Lumora"
                onPress={handleCreatePost}
                disabled={loading}
                loading={loading}
              />
            </View>
          </View>
        </FormProvider>
      </ScrollView>
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
