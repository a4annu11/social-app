import React, { useEffect, useRef, useState } from 'react';
import ActionSheet, {
  SheetManager,
  SheetProps,
} from 'react-native-actions-sheet';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { typography } from '../../theme';
import { GradientButton, OutLineButton } from '../UI/Button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logoutUser } from '../../redux/slice/authSlice';
import apiService from '../../api/apiService';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  removePostById,
  updatePostById,
  updateUserPostById,
} from '../../redux/slice/contentSlice';

export const LogoutSheet = ({ payload }: any) => {
  const navigation: any = useNavigation();
  const colors: any = useTheme().colors;
  const inset = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('currentUser');
    dispatch(logoutUser());
    SheetManager.hide('LogoutSheet');
  };

  const styles = StyleSheet.create({
    topBorder: {
      width: '100%',
      marginTop: 4,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 18,
    },
    topBorderChild: {
      width: '20%',
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.Border_Color,
    },
  });
  return (
    <ActionSheet
      gestureEnabled
      containerStyle={{
        backgroundColor: colors.Sheet_BG_Color,
        padding: 10,
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 0 : inset.bottom + 10,
        borderTopRightRadius: 28,
        borderTopLeftRadius: 28,
      }}
      id="LogoutSheet"
    >
      {/* <View style={styles.topBorder}>
        <View style={styles.topBorderChild} />
      </View> */}

      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            ...typography.Montserrat_Bold16,
            color: colors.Text_Primary_Color,
          }}
        >
          Hold On!
        </Text>

        <Text
          style={{
            ...typography.Montserrat_Medium14,
            color: colors.Text_Primary_Color,
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          Are you sure you want to logout from the app?
        </Text>

        <View style={{ width: '100%', marginTop: 20 }}>
          <GradientButton title="Logout" onPress={handleLogout} />
        </View>

        <Pressable
          onPress={() => SheetManager.hide('LogoutSheet')}
          style={{
            marginTop: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              ...typography.Montserrat_Regular14,
              color: colors.Text_Primary_Color,
            }}
          >
            Cancel
          </Text>
        </Pressable>
      </View>
    </ActionSheet>
  );
};

export const CommentSheet = (props: any) => {
  const { postId } = props.payload;
  const { colors }: any = useTheme();
  const { currentUser } = useAppSelector(state => state.auth);

  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const post = useAppSelector((state: any) =>
    state.content.feedData.find((p: any) => p._id === postId),
  );
  const userpost = useAppSelector((state: any) =>
    state.content.userPosts.find((p: any) => p._id === postId),
  );

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await apiService.getPostComment({ postId });
      if (res?.success) {
        setComments(res.comments);
      }
    } catch (error) {
      console.log('Error in getting comments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!text.trim()) return;

    const res = await apiService.addComment({
      postId,
      text,
      parentComment: replyTo?._id || null,
    });

    if (res?.success) {
      const newComment = {
        ...res.comment,
        replies: [],
      };

      setText('');

      dispatch(
        updatePostById({
          postId,
          updates: {
            commentsCount: (post?.commentsCount || 0) + 1,
          },
        }),
      );
      dispatch(
        updateUserPostById({
          postId,
          updates: {
            commentsCount: (userpost?.commentsCount || 0) + 1,
          },
        }),
      );

      if (replyTo) {
        setComments(prev =>
          prev.map(comment =>
            comment._id === replyTo._id
              ? {
                  ...comment,
                  replies: [...(comment.replies || []), newComment],
                }
              : comment,
          ),
        );
      } else {
        setComments(prev => [newComment, ...prev]);
      }

      setReplyTo(null);
    }
  };

  //Delete Comment
  const handleDelete = async (commentId: string) => {
    const parentComment = comments.find(c => c._id === commentId);

    let totalRemoved = 0;

    if (parentComment) {
      totalRemoved = 1 + (parentComment.replies?.length || 0);
    } else {
      totalRemoved = 1;
    }

    const res = await apiService.deleteComment({ commentId });

    if (res?.success) {
      dispatch(
        updatePostById({
          postId,
          updates: {
            commentsCount: Math.max(
              (post?.commentsCount || 0) - totalRemoved,
              0,
            ),
          },
        }),
      );

      dispatch(
        updateUserPostById({
          postId,
          updates: {
            commentsCount: Math.max(
              (userpost?.commentsCount || 0) - totalRemoved,
              0,
            ),
          },
        }),
      );
    }
  };

  const handleToggleLike = async (commentId: string) => {
    setComments(prev =>
      prev.map(comment => {
        if (comment._id === commentId) {
          const isLiked = comment.likes?.includes(currentUser._id);

          return {
            ...comment,
            likes: isLiked
              ? comment.likes.filter((id: string) => id !== currentUser._id)
              : [...(comment.likes || []), currentUser._id],
          };
        }

        return {
          ...comment,
          replies: comment.replies?.map((reply: any) => {
            if (reply._id === commentId) {
              const isLiked = reply.likes?.includes(currentUser._id);

              return {
                ...reply,
                likes: isLiked
                  ? reply.likes.filter((id: string) => id !== currentUser._id)
                  : [...(reply.likes || []), currentUser._id],
              };
            }
            return reply;
          }),
        };
      }),
    );

    const res = await apiService.toggleLikeComment(commentId);

    if (!res?.success) {
      fetchComments();
    }
  };

  const renderComment = ({ item }: any) => {
    return (
      <View style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row' }}>
          <Image
            source={
              item.author?.profilePicture
                ? { uri: item.author.profilePicture }
                : require('../../../assets/images/default-user.png')
            }
            style={styles.avatar}
          />

          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  color: colors.Text_Primary_Color,
                  flex: 1,
                }}
              >
                <Text style={{ fontWeight: '700' }}>
                  {item.author.username}{' '}
                </Text>
                {item.text}
              </Text>

              {/* <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={() => handleToggleLike(item._id)}>
                  <Icon
                    name={
                      item.likes?.includes(currentUser._id) ? 'heart' : 'heart'
                    }
                    size={16}
                    color={
                      item.likes?.includes(currentUser._id)
                        ? '#ff3b5c'
                        : colors.Text_Primary_Color
                    }
                  />
                </TouchableOpacity>

                {item.likes?.length > 0 && (
                  <Text style={{ marginLeft: 6, fontSize: 12, color: '#888' }}>
                    {item.likes.length}
                  </Text>
                )}
              </View> */}

              {item.author._id === currentUser._id && (
                <TouchableOpacity
                  onPress={() => {
                    handleDelete(item._id);
                    setComments(prev =>
                      prev.filter(comment => comment._id !== item._id),
                    );
                  }}
                >
                  <Icon
                    name="trash"
                    size={16}
                    color={colors.Text_Primary_Color}
                  />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setReplyTo(item)}
              style={{ marginTop: 4 }}
            >
              <Text style={{ fontSize: 12, color: '#888' }}>Reply</Text>
            </TouchableOpacity>
          </View>
        </View>

        {item.replies?.map((reply: any) => (
          <View
            key={reply._id}
            style={{
              flexDirection: 'row',
              marginLeft: 44,
              marginTop: 10,
            }}
          >
            <Image
              source={
                reply.author?.profilePicture
                  ? { uri: reply.author.profilePicture }
                  : require('../../../assets/images/default-user.png')
              }
              style={styles.avatarSmall}
            />

            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    color: colors.Text_Primary_Color,
                    flex: 1,
                  }}
                >
                  <Text style={{ fontWeight: '700' }}>
                    {reply.author.username}{' '}
                  </Text>
                  {reply.text}
                </Text>

                {/* <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity onPress={() => handleToggleLike(reply._id)}>
                    <Icon
                      name="heart"
                      size={14}
                      color={
                        reply.likes?.includes(currentUser._id)
                          ? '#ff3b5c'
                          : colors.Text_Primary_Color
                      }
                    />
                  </TouchableOpacity>

                  {reply.likes?.length > 0 && (
                    <Text
                      style={{ marginLeft: 6, fontSize: 11, color: '#888' }}
                    >
                      {reply.likes.length}
                    </Text>
                  )}
                </View> */}

                {reply.author._id === currentUser._id && (
                  <TouchableOpacity
                    onPress={async () => {
                      await handleDelete(reply._id);

                      // Remove locally without refetch
                      setComments(prev =>
                        prev.map(comment => ({
                          ...comment,
                          replies: comment.replies?.filter(
                            (r: any) => r._id !== reply._id,
                          ),
                        })),
                      );
                    }}
                  >
                    <Icon
                      name="trash"
                      size={14}
                      color={colors.Text_Primary_Color}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const styles = StyleSheet.create({
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 20,
      marginRight: 10,
    },
    avatarSmall: {
      width: 28,
      height: 28,
      borderRadius: 14,
      marginRight: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 0.5,
      borderColor: '#333',
      paddingTop: 10,
      marginTop: 8,
      marginBottom: 12,
    },
    input: {
      flex: 1,
      fontSize: 14,
      marginRight: 10,
    },
  });

  return (
    <ActionSheet
      id="CommentSheet"
      gestureEnabled
      containerStyle={{
        backgroundColor: colors.Sheet_BG_Color,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 16,
        paddingBottom: insets.bottom + 10,
      }}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: colors.Text_Primary_Color,
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        Comments
      </Text>

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 16,
          }}
        >
          <ActivityIndicator size="small" color="#7b8cff" />
        </View>
      ) : (
        <FlatList
          data={comments}
          extraData={comments}
          keyExtractor={(item: any) => item._id}
          renderItem={renderComment}
          showsVerticalScrollIndicator={false}
          overScrollMode="never"
          bounces={false}
        />
      )}

      {/* Reply indicator */}
      {replyTo && (
        <View style={{ marginBottom: 6 }}>
          <Text style={{ fontSize: 12, color: '#7b8cff' }}>
            Replying to @{replyTo.author.username}
          </Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Add a comment..."
          placeholderTextColor="#777"
          value={text}
          onChangeText={setText}
          style={[styles.input, { color: colors.Text_Primary_Color }]}
        />

        <TouchableOpacity onPress={handleAddComment}>
          <Icon name="send" size={22} color="#7b8cff" />
        </TouchableOpacity>
      </View>
    </ActionSheet>
  );
};

export const DeletePostSheet = ({ payload }: any) => {
  const { colors }: any = useTheme();
  const inset = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await apiService.deletePost({
        postId: payload?.postId,
      });

      if (res?.success) {
        SheetManager.hide('DeletePostSheet');
        dispatch(removePostById(payload?.postId));
        // DeviceEventEmitter.emit('REFRESH_HOME_FEED', payload?.postId);
      }
    } catch (error) {
      console.log('Delete error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActionSheet
      id="DeletePostSheet"
      gestureEnabled
      containerStyle={{
        backgroundColor: colors.Sheet_BG_Color,
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 0 : inset.bottom + 10,
        borderTopRightRadius: 28,
        borderTopLeftRadius: 28,
      }}
    >
      <TouchableOpacity onPress={handleDelete} disabled={loading}>
        <Text style={{ color: 'red', fontSize: 16, paddingVertical: 14 }}>
          {loading ? 'Deleting...' : 'Delete Post'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => SheetManager.hide('DeletePostSheet')}>
        <Text
          style={{
            ...typography.Montserrat_Regular14,
            color: colors.Text_Primary_Color,
            paddingVertical: 14,
          }}
        >
          Cancel
        </Text>
      </TouchableOpacity>
    </ActionSheet>
  );
};
