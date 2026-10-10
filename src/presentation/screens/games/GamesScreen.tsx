import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius } from '../../../core/theme';
import { container } from '../../../core/di/container';
import { ScreenTitle } from '../../components/common/ui';
import { MascotCici } from '../../components/play/MascotCici';
import { GameDef, GAMES } from '../../games/registry';
import { GameCard3D } from '../../components/games/GameCard3D';
import { StaggeredEntrance } from '../../components/motion/StaggeredEntrance';

export function GamesScreen() {
  const navigation = useNavigation<any>();
  const [activeGame, setActiveGame] = useState<GameDef | null>(null);

  // Tactile home button spring
  const homeScale = useSharedValue(1);

  const handleLaunchGame = (game: GameDef) => {
    setActiveGame(game);
  };

  const handleExitGame = () => {
    setActiveGame(null);
  };

  const homeBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: homeScale.value }],
  }));

  if (activeGame) {
    const ActiveComponent = activeGame.Component;
    return <ActiveComponent onExit={handleExitGame} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* 1. Header Bar dengan Staggered Entrance */}
      <StaggeredEntrance index={0}>
        <ScreenTitle
          sub="11 Mini Games Seru dengan 30 Soal & Tantangan Menyenangkan!"
          rightAction={
            <Animated.View style={homeBtnAnimStyle}>
              <Pressable
                onPressIn={() => {
                  homeScale.value = withSpring(0.92, { damping: 12, stiffness: 220 });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                onPressOut={() => {
                  homeScale.value = withSpring(1.0, { damping: 10, stiffness: 180 });
                }}
                onPress={() => {
                  container.sound.sfx('pop');
                  navigation.navigate('Belajar');
                }}
                style={styles.homeBtn}
              >
                <LinearGradient
                  colors={['#FFFFFF', '#F8FAFC']}
                  style={styles.homeBtnGradient}
                >
                  <Text style={styles.homeBtnText}>🏠 Beranda</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          }
        >
          Arena Mini Games 🎮
        </ScreenTitle>
      </StaggeredEntrance>

      {/* 2. Balon Interaktif Cici dengan Staggered Entrance */}
      <StaggeredEntrance index={1}>
        <View style={styles.mascotWrapper}>
          <MascotCici
            mood="happy"
            message="Pilih game favoritmu! Tekan 'Main' dan raih semua bintang! 🐱🌟"
            size={70}
          />
        </View>
      </StaggeredEntrance>

      {/* 3. Daftar Permainan: FlatList dengan Kartu 3D & Staggered Entrance 100ms */}
      <FlatList
        data={GAMES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        maxToRenderPerBatch={6}
        renderItem={({ item, index }) => (
          <GameCard3D
            item={item}
            index={index + 2}
            onLaunch={handleLaunchGame}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  homeBtn: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  homeBtnGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  homeBtnText: {
    fontFamily: fonts.black,
    fontSize: 13,
    color: colors.ink,
  },
  mascotWrapper: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
});
