import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  DeviceEventEmitter,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';

import { showError, showSuccess, showWarning } from '../utils/ToastMessage';
import apiService from '../api/apiService';
import { useAppSelector } from '../redux/hooks';
import { typography } from '../theme';
import Icon from 'react-native-vector-icons/FontAwesome';

const ShareQuote = () => {
  const { colors }: any = useTheme();
  const navigation = useNavigation();
  const { currentUser } = useAppSelector(state => state.auth);

  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState('');
  const [inputHeight, setInputHeight] = useState(50);
  const [isFocused, setIsFocused] = useState(false);

  // ── Create Post ──────────────
  const handleCreatePost = async () => {
    if (!caption?.trim()) {
      showWarning('Please add some thought...');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        caption: caption.trim(),
      };

      const res = await apiService.createPost(payload);

      if (res?.success) {
        DeviceEventEmitter.emit('REFRESH_HOME_FEED');
        // showSuccess('Post created successfully');

        setCaption('');
        // navigation.goBack();
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[
          styles.container,
          {
            borderBottomWidth: 1,
            borderColor: isFocused ? colors.Colored_Text : '#dddddd7c',
          },
        ]}
      >
        <View
          style={{
            padding: 16,
            borderRadius: 12,
          }}
        >
          {/* <Text
            style={{
              ...typography.Montserrat_SemiBold16,
              color: colors.Text_Primary_Color,
              marginBottom: 10,
              fontStyle: 'italic',
            }}
          >
            Whats on your mind?
          </Text> */}
          <View style={[styles.inputWrapper]}>
            <Image
              source={
                currentUser?.profilePicture
                  ? { uri: currentUser?.profilePicture }
                  : require('../../assets/images/default-user.png')
              }
              style={styles.avatar}
            />

            <View style={{ flex: 1 }}>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="Share Your Thoughts..."
                placeholderTextColor="#888"
                maxLength={300}
                multiline
                textAlignVertical="top"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onContentSizeChange={e =>
                  setInputHeight(e.nativeEvent.contentSize.height)
                }
                style={[
                  styles.input,
                  {
                    color: colors.Text_Primary_Color,
                    height: Math.max(50, inputHeight),
                  },
                ]}
              />

              {/* Character Counter */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 10,
                }}
              >
                {/* <Text style={styles.charCount}>{caption.length}/300</Text> */}

                {/* Post Button */}
                <TouchableOpacity
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    backgroundColor: colors.Colored_Text,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: loading || !caption?.trim() ? 0.5 : 1,
                    flexDirection: 'row',
                    gap: 5,
                  }}
                  onPress={handleCreatePost}
                  disabled={loading || !caption?.trim()}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text
                        style={{
                          ...typography.Montserrat_SemiBold14,
                          color: colors.Text_Primary_Color,
                        }}
                      >
                        Share
                      </Text>
                      <Icon name="share" size={14} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ShareQuote;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingVertical: 16,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },

  input: {
    borderRadius: 12,
    padding: 8,
    backgroundColor: 'transparent',
    fontSize: 15,
  },

  charCount: {
    textAlign: 'left',
    fontSize: 12,
    marginTop: 4,
    color: '#888',
  },

  button: {
    paddingVertical: 16,
    borderRadius: 40,
    alignItems: 'center',
    marginTop: 'auto',
  },
});
