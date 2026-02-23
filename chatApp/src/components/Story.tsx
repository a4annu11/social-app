import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../redux/hooks';

const Story = ({ stories }: any) => {
  const navigation: any = useNavigation();
  const { currentUser } = useAppSelector(state => state.auth);

  //  Transform backend response
  const formattedStories = useMemo(() => {
    if (!stories) return [];

    const mapped = stories.map((item: any) => ({
      id: item._id,
      userId: item.user._id,
      avatar: item.user.profilePicture,
      username: item.user.username,
      isOwn: item.user._id === currentUser?._id,
      hasUnseen: item.hasUnseen === 1,
      stories: item.stories,
    }));

    // Move own story to first
    const own = mapped.find((s: any) => s.isOwn);
    const others = mapped.filter((s: any) => !s.isOwn);

    return own ? [own, ...others] : mapped;
  }, [stories, currentUser]);

  const renderItem = ({ item }: any) => {
    const borderColors = item.hasUnseen
      ? ['#7b8cff', '#b06ab3']
      : ['#444', '#444'];

    return (
      <TouchableOpacity
        style={styles.storyContainer}
        onPress={() => {
          const startUserIndex = formattedStories.findIndex(
            (s: any) => s.id === item.id,
          );

          if (item.isOwn && item.stories.length === 0) {
            navigation.navigate('CreateStory');
            return;
          }

          navigation.navigate('StoryViewer', {
            allStories: formattedStories,
            startUserIndex,
          });
        }}
      >
        <LinearGradient colors={borderColors} style={styles.gradientBorder}>
          <View style={styles.imageWrapper}>
            <Image
              source={
                item.avatar
                  ? { uri: item.avatar }
                  : require('../../assets/images/default-user.png')
              }
              style={styles.avatar}
            />

            {item.isOwn && (
              <View style={styles.plusIcon}>
                <Icon name="add" size={14} color="#fff" />
              </View>
            )}
          </View>
        </LinearGradient>

        <Text style={styles.username} numberOfLines={1}>
          {item.isOwn ? 'Your Story' : item.username}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={formattedStories}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14 }}
      />
    </View>
  );
};

export default Story;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
  },
  storyContainer: {
    alignItems: 'center',
    marginRight: 18,
    width: 80,
  },
  gradientBorder: {
    padding: 3,
    borderRadius: 50,
  },
  imageWrapper: {
    backgroundColor: '#0f172a',
    borderRadius: 50,
    padding: 3,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 50,
  },
  username: {
    marginTop: 6,
    fontSize: 13,
    color: '#ddd',
    textAlign: 'center',
  },
  plusIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7b8cff',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
});
