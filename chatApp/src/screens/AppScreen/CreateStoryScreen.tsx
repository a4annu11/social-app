import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  StatusBar,
  DeviceEventEmitter,
  Dimensions,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../../api/apiService';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';
import { showError } from '../../utils/ToastMessage';
// import Video from 'react-native-video';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');

const CreateStoryScreen = () => {
  const navigation: any = useNavigation();
  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Zoom & Pan values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    pickMedia();
  }, []);

  const pickMedia = async () => {
    const result: any = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.didCancel) {
      navigation.goBack();
      return;
    }

    if (result.assets?.length > 0) {
      setMedia(result.assets[0]);
    }
  };

  // 🔥 Pinch Gesture
  const pinchGesture = Gesture.Pinch().onUpdate(e => {
    scale.value = e.scale;
  });

  // 🔥 Drag Gesture
  const panGesture = Gesture.Pan().onUpdate(e => {
    translateX.value = e.translationX;
    translateY.value = e.translationY;
  });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const handleShare = async () => {
    if (!media) return;

    try {
      setLoading(true);

      // 1️⃣ Upload to Cloudinary
      const uploaded = await uploadToCloudinary(media);

      // 2️⃣ Save in backend
      const res = await apiService.createStory({
        media: uploaded,
      });

      if (res?.success) {
        DeviceEventEmitter.emit('REFRESH_STORIES');
        navigation.goBack();
      } else {
        showError('Failed to create story');
      }
    } catch (error) {
      showError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  if (!media) return null;

  const isVideo = media.type?.includes('video');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={() => navigation.goBack()}
      >
        <Icon name="close" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Media Preview */}
      {isVideo ? //   resizeMode="cover" //   style={styles.preview} //   source={{ uri: media.uri }} // <Video
      //   repeat
      // />
      null : (
        <GestureDetector gesture={composedGesture}>
          <Animated.Image
            source={{ uri: media.uri }}
            style={[styles.preview, animatedStyle]}
            resizeMode="cover"
          />
        </GestureDetector>
      )}

      {/* Share Button */}
      <TouchableOpacity
        style={styles.shareBtn}
        onPress={handleShare}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.shareText}>Your Story</Text>
            <Icon name="arrow-forward" size={18} color="#fff" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CreateStoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  preview: {
    width: width,
    height: height,
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  shareBtn: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7b8cff',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 30,
  },
  shareText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
});
