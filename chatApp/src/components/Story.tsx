import React from 'react';
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

const Story = () => {
  const stories = [
    {
      id: '1',
      username: 'You',
      avatar: 'https://i.pravatar.cc/150?img=1',
      isOwn: true,
    },
    {
      id: '2',
      username: 'Elena_X',
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
    {
      id: '3',
      username: 'CyberV',
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
    {
      id: '4',
      username: 'NeoGlow',
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
    {
      id: '5',
      username: 'Zion_3',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
  ];

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity style={styles.storyContainer}>
        <LinearGradient
          colors={['#7b8cff', '#b06ab3']}
          style={styles.gradientBorder}
        >
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />

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
        data={stories}
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
    // backgroundColor: '#0f172a',
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
