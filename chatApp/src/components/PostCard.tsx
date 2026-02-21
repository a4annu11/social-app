import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useNavigation, useTheme } from '@react-navigation/native';
import apiService from '../api/apiService';
import { useAppSelector } from '../redux/hooks';

const { width } = Dimensions.get('window');

const Dot = ({ index, scrollX }: { index: number; scrollX: any }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const position = scrollX.value / width;

    const opacity = interpolate(
      position,
      [index - 1, index, index + 1],
      [0.3, 1, 0.3],
      Extrapolate.CLAMP,
    );

    const scale = interpolate(
      position,
      [index - 1, index, index + 1],
      [0.8, 1.2, 0.8],
      Extrapolate.CLAMP,
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const PostCard = ({ post }: any) => {
  console.log('POST: ', post);
  const scrollX = useSharedValue(0);
  const { colors }: any = useTheme();
  const naviagtion: any = useNavigation();
  const [isLiked, setIsLiked] = useState(post?.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post?.likesCount ?? 0);
  const { currentUser } = useAppSelector(state => state.auth);

  const onScroll = useAnimatedScrollHandler({
    onScroll: e => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const handleToggleLike = async () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    try {
      const res = await apiService.toggleLikePost({
        postId: post?._id,
      });

      if (!res?.success) {
        setIsLiked(!isLiked);
      }
    } catch (error) {
      console.log('ERror in Toggle likepost', error);
    }
  };

  return (
    <View style={styles.card}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => {
              if (post?.author?._id === currentUser?._id) {
                naviagtion.navigate('Profile');
                return;
              }
              naviagtion.navigate('userProfile', {
                username: post?.author?.username,
              });
            }}
          >
            <Image
              source={
                post?.author?.profilePicture
                  ? { uri: post?.author?.profilePicture ?? '' }
                  : require('../../assets/images/default-user.png')
              }
              style={styles.avatar}
            />
          </Pressable>
          <View>
            <Text
              style={[styles.username, { color: colors.Text_Primary_Color }]}
            >
              {post?.author?.username}
            </Text>
            <Text style={[styles.location, { color: colors.Colored_Text }]}>
              Indore, India
            </Text>
          </View>
        </View>

        <Icon name="ellipsis-horizontal" size={20} color="#aaa" />
      </View>

      {/* IMAGE SLIDER */}
      <Animated.ScrollView
        horizontal
        pagingEnabled
        snapToInterval={width}
        decelerationRate="fast"
        snapToAlignment="center"
        disableIntervalMomentum
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {post?.media.map((img: any, index: any) => (
          <View key={index} style={{ width }}>
            <Image source={{ uri: img?.url }} style={styles.image} />
          </View>
        ))}
      </Animated.ScrollView>

      {/* DOTS */}
      {post?.media?.length > 1 && (
        <View style={styles.dotsContainer}>
          <View style={styles.dots}>
            {post?.media.map((_: any, i: number) => (
              <Dot key={i} index={i} scrollX={scrollX} />
            ))}
          </View>
        </View>
      )}

      {/* ACTION ROW */}
      <View style={styles.actions}>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity onPress={handleToggleLike}>
            {isLiked ? (
              <Icon name="heart" size={24} color="#7b8cff" />
            ) : (
              <Icon name="heart-outline" size={24} color="#7b8cff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity>
            <Icon name="chatbubble-outline" size={22} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity>
            <Icon name="share-social-outline" size={22} color="#aaa" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity>
          <Icon name="bookmark-outline" size={22} color="#aaa" />
        </TouchableOpacity>
      </View>

      {/* STATS */}
      <View style={styles.stats}>
        <Text style={[styles.likes, { color: colors.Colored_Text }]}>
          {likesCount ?? 0} likes
        </Text>
      </View>

      {/* CAPTION */}
      <Text style={[styles.caption, { color: colors.Text_Secondary_Color }]}>
        <Text style={[styles.username, { color: colors.Text_Primary_Color }]}>
          {post?.author?.username}{' '}
        </Text>
        {post?.caption ?? ''}
      </Text>

      <Text style={styles.comments}>
        View all {post?.commentsCount ?? 0} comments
      </Text>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111a30',
    // marginVertical: 10,
    paddingBottom: 22,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#7b8cff',
  },
  username: {
    fontWeight: '700',
    fontSize: 15,
  },
  location: {
    fontSize: 12,
    marginTop: 2,
  },
  image: {
    width: width,
    height: 420,
  },

  dotsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 5,
    backgroundColor: '#7b8cff',
    marginHorizontal: 4,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginTop: 12,
  },
  stats: {
    paddingHorizontal: 14,
    marginTop: 8,
  },
  likes: {
    fontWeight: '600',
  },
  caption: {
    paddingHorizontal: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  comments: {
    color: '#777',
    paddingHorizontal: 14,
    marginTop: 6,
  },
});
