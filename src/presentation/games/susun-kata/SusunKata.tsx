import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { bubblePalette, colors, fonts, radius } from '../../../core/theme';
import { WORDS } from '../../../data/content/curriculum';
import { WordItem } from '../../../domain/entities/DictationExercise';
import { Wobble } from '../../components/common/Motion';
import { BigButton } from '../../components/common/ui';
import { GameShell, useGameSession } from '../GameShell';

/** Balok Huruf Taktil dengan Spring Physics Golden Rules */
function TactileLetterTile({
  item,
  bg,
  edge,
  onPress,
}: {
  item: { id: string; letter: string; used: boolean };
  bg: string;
  edge: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const pressY = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: pressY.value },
    ],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        disabled={item.used}
        onPressIn={() => {
          scale.value = withSpring(0.92, { damping: 14, stiffness: 350 });
          pressY.value = withSpring(3, { damping: 14, stiffness: 350 });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          scale.value = withSpring(1.0, { damping: 10, stiffness: 200 });
          pressY.value = withSpring(0, { damping: 10, stiffness: 200 });
        }}
        onPress={onPress}
        style={[
          styles.tile,
          {
            backgroundColor: item.used ? '#E2E8F0' : bg,
            borderBottomColor: item.used ? '#CBD5E1' : edge,
            borderBottomWidth: item.used ? 2 : 5,
          },
          item.used && styles.tileUsed,
        ]}
      >
        <Text style={[styles.tileLetter, item.used && { color: '#94A3B8' }]}>
          {item.letter}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/**
 * 🔤 Susun Kata Acak (Anagram Kata)
 * Golden Rules: Spring physics, multisensory tactile reactions, 3D cards, and depth gradients.
 */
export function SusunKata({ onExit }: { onExit: () => void }) {
  const session = useGameSession('susun-kata', 30);

  const [currentWord, setCurrentWord] = useState<WordItem>(WORDS[0]);
  const [scrambled, setScrambled] = useState<{ id: string; letter: string; used: boolean }[]>([]);
  const [placed, setPlaced] = useState<{ id: string; letter: string }[]>([]);
  const [wobbleToken, setWobbleToken] = useState(0);

  useEffect(() => {
    if (session.finished) return;
    const pool = WORDS.filter((w) => w.level >= 3 && w.word.length >= 4);
    const word = pool[session.round % pool.length] || WORDS[0];
    setCurrentWord(word);

    // Acak huruf-hurufnya
    const letters = word.word.split('').map((l, idx) => ({
      id: `${l}-${idx}-${Date.now()}`,
      letter: l,
      used: false,
    }));

    let shuffled = [...letters].sort(() => Math.random() - 0.5);
    if (shuffled.map((s) => s.letter).join('') === word.word) {
      shuffled = shuffled.reverse();
    }
    setScrambled(shuffled);
    setPlaced([]);
    setWobbleToken(0);
  }, [session.round, session.finished]);

  const hearWord = () => {
    container.sound.speak(currentWord.word.toLowerCase());
  };

  const handleTilePress = (item: { id: string; letter: string; used: boolean }) => {
    if (item.used) return;
    container.sound.sfx('tap');

    const nextPlaced = [...placed, { id: item.id, letter: item.letter }];
    setPlaced(nextPlaced);
    setScrambled((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, used: true } : t))
    );

    // Cek jika seluruh slot sudah terisi
    if (nextPlaced.length === currentWord.word.length) {
      const spelled = nextPlaced.map((p) => p.letter).join('');
      if (spelled === currentWord.word) {
        container.sound.sfx('tada_magic');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        session.correct(`susun-${currentWord.word}`);
      } else {
        container.sound.sfx('error_buzz');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setWobbleToken((t) => t + 1);
        session.wrong();

        setTimeout(() => {
          setPlaced([]);
          setScrambled((prev) => prev.map((t) => ({ ...t, used: false })));
        }, 800);
      }
    }
  };

  const handleRemovePlaced = (index: number) => {
    const itemToRemove = placed[index];
    if (!itemToRemove) return;
    container.sound.sfx('pop');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setPlaced((prev) => prev.filter((_, idx) => idx !== index));
    setScrambled((prev) =>
      prev.map((t) => (t.id === itemToRemove.id ? { ...t, used: false } : t))
    );
  };

  return (
    <GameShell
      title="Susun Kata Acak"
      emoji="🔤"
      color={colors.coral}
      session={session}
      onExit={onExit}
    >
      <View style={styles.container}>
        {/* Clue Header: 3D Gradient Card */}
        <View style={styles.clueCard3D}>
          <LinearGradient
            colors={['#FFFFFF', '#FFFBF5']}
            style={styles.clueGradient}
          >
            <Text style={styles.clueEmoji}>{currentWord.emoji}</Text>
            <Text style={styles.clueTextHint}>
              Tebak gambar di atas ({currentWord.word.length} Huruf)
            </Text>
            <BigButton
              label="🔊 Petunjuk Suara Cici"
              small
              color={colors.sunny}
              edge={colors.sunnyDark}
              onPress={hearWord}
            />
          </LinearGradient>
        </View>

        {/* Target Slots Area */}
        <Wobble token={wobbleToken}>
          <View style={styles.slotRow}>
            {currentWord.word.split('').map((_, idx) => {
              const placedChar = placed[idx];
              return (
                <Pressable
                  key={idx}
                  onPress={() => handleRemovePlaced(idx)}
                  style={[
                    styles.slotBox,
                    placedChar ? styles.slotBoxFilled : styles.slotBoxEmpty,
                  ]}
                >
                  <Text style={styles.slotText}>{placedChar ? placedChar.letter : '?'}</Text>
                  {placedChar && <Text style={styles.removeHint}>✕</Text>}
                </Pressable>
              );
            })}
          </View>
        </Wobble>

        <Text style={styles.instruction}>
          Ketuk balok huruf acak di bawah untuk menyusun kata:
        </Text>

        {/* Scrambled Letter Tiles */}
        <View style={styles.tilesGrid}>
          {scrambled.map((item, idx) => {
            const [bg, edge] = bubblePalette[idx % bubblePalette.length];
            return (
              <TactileLetterTile
                key={item.id}
                item={item}
                bg={bg}
                edge={edge}
                onPress={() => handleTilePress(item)}
              />
            );
          })}
        </View>

        {/* Undo / Reset Button */}
        {placed.length > 0 && (
          <View style={{ alignItems: 'center', marginTop: 14 }}>
            <BigButton
              label="↩ Ulangi Susun Huruf"
              small
              color="#FFF0F0"
              edge="#FFAAAA"
              textColor="#D93838"
              onPress={() => {
                setPlaced([]);
                setScrambled((prev) => prev.map((t) => ({ ...t, used: false })));
              }}
            />
          </View>
        )}
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center' },
  clueCard3D: {
    width: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FED7AA',
    borderBottomWidth: 5,
    borderBottomColor: '#FDBA74',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  clueGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  clueEmoji: { fontSize: 64 },
  clueTextHint: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  slotRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 18,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  slotBox: {
    width: 58,
    height: 66,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  slotBoxEmpty: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  slotBoxFilled: {
    backgroundColor: colors.mint,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderBottomWidth: 5,
    borderBottomColor: colors.mintDark,
  },
  slotText: {
    fontFamily: fonts.black,
    fontSize: 32,
    color: colors.ink,
  },
  removeHint: {
    position: 'absolute',
    top: 3,
    right: 5,
    fontSize: 11,
    color: colors.inkSoft,
    fontFamily: fonts.black,
  },
  instruction: {
    fontFamily: fonts.heavy,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 12,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  tile: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tileUsed: {
    opacity: 0.45,
    elevation: 0,
    shadowOpacity: 0,
  },
  tileLetter: {
    fontFamily: fonts.black,
    fontSize: 34,
    color: colors.ink,
  },
});
