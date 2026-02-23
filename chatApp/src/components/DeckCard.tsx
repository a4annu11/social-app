import React, { useState } from 'react';
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 420;
const SWIPE_THRESHOLD = width * 0.25;
const SWIPE_OUT_DURATION = 280;

interface DeckCarouselProps {
  media: any[];
  onRemove: (index: number) => void;
}

const DeckCarousel = ({ media, onRemove }: DeckCarouselProps) => {
  const [items, setItems] = useState(media);
  const translateX = useSharedValue(0);

  // Sync external media changes (add/remove via X button)
  React.useEffect(() => {
    setItems(media);
  }, [media]);

  // Swipe left → send top card to the end
  const sendToBack = () => {
    setItems(prev => {
      if (prev.length <= 1) return prev;
      const updated = [...prev];
      const top = updated.shift()!;
      updated.push(top);
      return updated;
    });
    translateX.value = 0;
  };

  // Swipe right → bring last card to the front
  const bringToFront = () => {
    setItems(prev => {
      if (prev.length <= 1) return prev;
      const updated = [...prev];
      const last = updated.pop()!;
      updated.unshift(last);
      return updated;
    });
    translateX.value = 0;
  };

  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      translateX.value = event.translationX;
    })
    .onEnd(event => {
      if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          -width * 1.4,
          { duration: SWIPE_OUT_DURATION },
          () => {
            runOnJS(sendToBack)();
          },
        );
      } else if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(
          width * 1.4,
          { duration: SWIPE_OUT_DURATION },
          () => {
            runOnJS(bringToFront)();
          },
        );
      } else {
        // Snap back — use withTiming not withSpring to avoid bouncy entrance
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  const topCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [-8, 0, 8],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateX: translateX.value }, { rotate: `${rotate}deg` }],
    };
  });

  if (items.length === 0) return null;

  // Only render top 3 for the stack effect
  const visibleItems = items.slice(0, 3);

  return (
    <View style={styles.wrapper}>
      {/* Render from back to front so top card is on top */}
      {[...visibleItems].reverse().map((item, reversedIdx) => {
        const stackIdx = visibleItems.length - 1 - reversedIdx; // 0 = top card
        const isTop = stackIdx === 0;

        // Pure static values — zero animation on mount
        const offsetX = stackIdx * 14;
        const offsetY = stackIdx * 10;
        const scale = 1 - stackIdx * 0.06;

        const staticStyle = {
          transform: [
            { translateX: offsetX },
            { translateY: offsetY },
            { scale },
          ],
          zIndex: 10 - stackIdx,
        };

        if (isTop) {
          return (
            <GestureDetector key={`top-${item.uri}`} gesture={panGesture}>
              <Animated.View style={[styles.card, staticStyle, topCardStyle]}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.image}
                  resizeMode="cover"
                />

                {/* Remove button — removes from original media array */}
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => onRemove(media.indexOf(item))}
                  hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>

                {/* Counter */}
                {items.length > 1 && (
                  <View style={styles.counter}>
                    <Text style={styles.counterText}>
                      {media.indexOf(item) + 1} / {items.length}
                    </Text>
                  </View>
                )}
              </Animated.View>
            </GestureDetector>
          );
        }

        return (
          <View
            key={`back-${item.uri}-${stackIdx}`}
            style={[styles.card, staticStyle]}
          >
            <Image
              source={{ uri: item.uri }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        );
      })}

      {/* Dot indicators */}
      {/* {items.length > 1 && (
        <View style={styles.dots}>
          {items.map((item, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === 0 ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )} */}
    </View>
  );
};

export default DeckCarousel;

const styles = StyleSheet.create({
  wrapper: {
    height: CARD_HEIGHT + 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#1a1a1e',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 22,
    padding: 9,
  },
  counter: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 2,
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    width: 18,
    backgroundColor: '#fff',
  },
  dotInactive: {
    width: 7,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});
