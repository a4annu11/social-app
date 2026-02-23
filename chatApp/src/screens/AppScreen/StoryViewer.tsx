import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Animated,
  Text,
  PanResponder,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import apiService from '../../api/apiService';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000;
const TRANSITION_DURATION = 300; // Duration for cross-fade animation

const StoryViewer = ({ route }: any) => {
  const navigation: any = useNavigation();
  const { allStories, startUserIndex } = route.params;

  const [currentUserIndex, setCurrentUserIndex] = useState(startUserIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const currentUser = allStories[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];

  const progress = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // 🔥 Add fade animations for image and header
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  // 🔥 View story API call
  useEffect(() => {
    if (currentStory?._id) {
      apiService.viewStory({ storyId: currentStory._id });
    }
  }, [currentUserIndex, currentStoryIndex]);

  // 🔥 Auto progress animation (reset on any index change)
  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) goNext();
    });
  }, [currentUserIndex, currentStoryIndex]);

  const animateTransition = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(imageOpacity, {
        toValue: 0,
        duration: TRANSITION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 0,
        duration: TRANSITION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      Animated.parallel([
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: TRANSITION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: TRANSITION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const goNext = () => {
    if (currentStoryIndex < currentUser.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else if (currentUserIndex < allStories.length - 1) {
      animateTransition(() => {
        setCurrentUserIndex((prev: any) => prev + 1);
        setCurrentStoryIndex(0);
      });
    } else {
      navigation.goBack();
    }
  };

  const goPrev = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else if (currentUserIndex > 0) {
      animateTransition(() => {
        setCurrentUserIndex((prev: any) => prev - 1);
        setCurrentStoryIndex(
          allStories[currentUserIndex - 1].stories.length - 1,
        );
      });
    }
    // If at the very beginning, do nothing (or optionally goBack)
  };

  //  Swipe down to close
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
    onPanResponderMove: (_, gesture) => {
      if (gesture.dy > 0) {
        translateY.setValue(gesture.dy);
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy > 120) {
        navigation.goBack();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }] }]}
      {...panResponder.panHandlers}
    >
      {/*  Top Progress Bars (per current user's stories) */}
      <View style={styles.progressContainer}>
        {currentUser.stories.map((_: any, index: number) => (
          <View key={index} style={styles.progressBarBackground}>
            {index < currentStoryIndex && (
              <View style={[styles.progressBar, { width: '100%' }]} />
            )}
            {index === currentStoryIndex && (
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/*  Header (updates with current user) */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <Image source={{ uri: currentUser.avatar }} style={styles.avatar} />
        <Text style={styles.username}>{currentUser.username}</Text>
      </Animated.View>

      {/* Story Image with Tap Gestures */}
      <TouchableWithoutFeedback
        onPress={event => {
          const x = event.nativeEvent.locationX;
          if (x < width / 2) {
            goPrev();
          } else {
            goNext();
          }
        }}
      >
        <Animated.Image
          source={{ uri: currentStory?.media?.url }}
          style={[styles.storyImage, { opacity: imageOpacity }]}
          resizeMode="cover"
        />
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

export default StoryViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  storyImage: {
    width,
    height,
  },
  progressContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: '#444',
    marginHorizontal: 2,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 70,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 8,
  },
  username: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});
