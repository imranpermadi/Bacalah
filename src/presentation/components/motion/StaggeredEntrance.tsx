import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

interface Props {
  index: number;
  children: React.ReactNode;
  style?: ViewStyle;
  delayOffsetMs?: number;
}

/**
 * Golden Rule 4: Staggered Entrance
 * Muncul dari bawah dengan spring physics (jeda 100ms antar elemen).
 * DILARANG menggunakan animasi linier.
 */
export function StaggeredEntrance({
  index,
  children,
  style,
  delayOffsetMs = 100,
}: Props) {
  const translateY = useSharedValue(45);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.94);

  useEffect(() => {
    const delay = index * delayOffsetMs;

    translateY.value = withDelay(
      delay,
      withSpring(0, { damping: 14, stiffness: 130, mass: 0.8 })
    );

    opacity.value = withDelay(
      delay,
      withSpring(1, { damping: 16, stiffness: 120 })
    );

    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 12, stiffness: 140 })
    );
  }, [index, delayOffsetMs]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

