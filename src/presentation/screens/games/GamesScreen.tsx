import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, radius, raised, spacing } from '../../../core/theme';
import { container } from '../../../core/di/container';
import { BigButton, ScreenTitle } from '../../components/common/ui';
import { MascotCici } from '../../components/play/MascotCici';
import { GameDef, GAMES } from '../../games/registry';

export function GamesScreen() {
  const navigation = useNavigation<any>();
  const [activeGame, setActiveGame] = useState<GameDef | null>(null);

  const handleLaunchGame = (game: GameDef) => {
    container.sound.sfx('pop');
    setActiveGame(game);
  };

  const handleExitGame = () => {
    setActiveGame(null);
  };

  if (activeGame) {
    const ActiveComponent = activeGame.Component;
    return <ActiveComponent onExit={handleExitGame} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenTitle
        sub="11 Mini Games Seru dengan 30 Soal & Fitur Lanjut Permainan!"
        rightAction={
          <Pressable
            onPress={() => {
              container.sound.sfx('pop');
              navigation.navigate('Belajar');
            }}
            style={styles.homeBtn}
          >
            <Text style={styles.homeBtnText}>🏠 Beranda</Text>
          </Pressable>
        }
      >
        Arena Mini Games 🎮
      </ScreenTitle>

      <View style={{ marginVertical: 8 }}>
        <MascotCici
          mood="happy"
          message="Pilih game yang kamu suka! Main sambil belajar bersama Cici! 🐱"
          size={70}
        />
      </View>

      <FlatList
        data={GAMES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => handleLaunchGame(item)}
            style={[
              styles.gameCard,
              { backgroundColor: '#FFFFFF' },
              raised(item.edge),
            ]}
          >
            <View style={[styles.emojiWrap, { backgroundColor: item.color }]}>
              <Text style={styles.emojiText}>{item.emoji}</Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.gameTitle}>{item.title}</Text>
              <Text style={styles.gameDesc}>{item.desc}</Text>
            </View>

            <BigButton
              label="Main 🚀"
              small
              color={item.color}
              edge={item.edge}
              onPress={() => handleLaunchGame(item)}
            />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  homeBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  homeBtnText: {
    fontFamily: fonts.black,
    fontSize: 13,
    color: colors.ink,
  },
  list: { padding: 16, gap: 14, paddingBottom: 60 },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.line,
  },
  emojiWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emojiText: { fontSize: 32 },
  cardContent: { flex: 1, paddingRight: 8 },
  gameTitle: { fontFamily: fonts.black, fontSize: 18, color: colors.ink },
  gameDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 2,
  },
});

