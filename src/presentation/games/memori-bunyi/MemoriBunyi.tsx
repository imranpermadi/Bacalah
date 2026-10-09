import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { container } from '../../../core/di/container';
import { colors, fonts, radius, raised } from '../../../core/theme';
import { OPEN_SYLLABLES, WORDS } from '../../../data/content/curriculum';
import { BigButton } from '../../components/common/ui';
import { GameShell, useGameSession } from '../GameShell';

interface MemoryCardItem {
  id: string;
  pairId: string;
  type: 'sound' | 'visual';
  text: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

/**
 * 🧠 Memori Kartu Bunyi & Ejaan
 * Kartu interaktif 3D Flip dengan Reanimated: Mencocokkan bunyi/suara fonik dengan kartu visual tulisan.
 */
function FlipCard({
  item,
  onPress,
}: {
  item: MemoryCardItem;
  onPress: () => void;
}) {
  const rotateVal = useSharedValue(item.isFlipped || item.isMatched ? 1 : 0);

  useEffect(() => {
    rotateVal.value = withSpring(item.isFlipped || item.isMatched ? 1 : 0, {
      damping: 15,
      stiffness: 120,
    });
  }, [item.isFlipped, item.isMatched, rotateVal]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotateVal.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${rotate}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(rotateVal.value, [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: `${rotate}deg` }],
      backfaceVisibility: 'hidden',
    };
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={item.isFlipped || item.isMatched}
      style={styles.cardContainer}
    >
      {/* Back View (Saat Tertutup) */}
      <Animated.View
        style={[
          styles.cardFace,
          styles.cardHidden,
          raised(colors.sunnyDark),
          frontAnimatedStyle,
        ]}
      >
        <Text style={styles.cardHiddenEmoji}>❓</Text>
        <Text style={styles.cardHiddenLabel}>Buka Kartu</Text>
      </Animated.View>

      {/* Front View (Saat Terbuka) */}
      <Animated.View
        style={[
          styles.cardFace,
          item.isMatched ? styles.cardMatched : styles.cardRevealed,
          raised(item.isMatched ? colors.mintDark : colors.skyDark),
          backAnimatedStyle,
        ]}
      >
        <Text style={styles.cardRevealedEmoji}>{item.emoji}</Text>
        <Text style={styles.cardRevealedText}>{item.text}</Text>
        {item.type === 'sound' && <Text style={styles.soundIndicator}>🔊 Bunyi</Text>}
      </Animated.View>
    </Pressable>
  );
}

export function MemoriBunyi({ onExit }: { onExit: () => void }) {
  const session = useGameSession('memori-bunyi', 30);

  const [cards, setCards] = useState<MemoryCardItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Buat 3 pasang kartu (total 6 kartu) untuk ronde aktif
  useEffect(() => {
    if (session.finished) return;

    const syllablesPool = OPEN_SYLLABLES.slice(0, 40);
    const startIdx = (session.round * 3) % syllablesPool.length;
    const chosenSyllables = [
      syllablesPool[startIdx],
      syllablesPool[(startIdx + 1) % syllablesPool.length],
      syllablesPool[(startIdx + 2) % syllablesPool.length],
    ];

    const generated: MemoryCardItem[] = [];

    chosenSyllables.forEach((syl, idx) => {
      // Pasangan A: Kartu Suara
      generated.push({
        id: `sound-${idx}-${syl}`,
        pairId: `pair-${idx}`,
        type: 'sound',
        text: syl,
        emoji: '🔊',
        isFlipped: false,
        isMatched: false,
      });

      // Pasangan B: Kartu Visual
      const matchingWord = WORDS.find((w) => w.word.startsWith(syl)) || { emoji: '✨' };
      generated.push({
        id: `visual-${idx}-${syl}`,
        pairId: `pair-${idx}`,
        type: 'visual',
        text: syl,
        emoji: matchingWord.emoji,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Acak posisi ke-6 kartu
    const shuffled = [...generated].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setSelectedIds([]);
    setIsEvaluating(false);
  }, [session.round, session.finished]);

  const handleCardPress = (id: string) => {
    if (isEvaluating || selectedIds.length >= 2 || selectedIds.includes(id)) return;

    const clickedCard = cards.find((c) => c.id === id);
    if (!clickedCard || clickedCard.isMatched) return;

    container.sound.sfx('tap');
    container.sound.speak(clickedCard.text.toLowerCase());

    const newSelected = [...selectedIds, id];
    setSelectedIds(newSelected);

    // Buka kartu
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFlipped: true } : c))
    );

    if (newSelected.length === 2) {
      setIsEvaluating(true);
      const first = cards.find((c) => c.id === newSelected[0])!;
      const second = clickedCard;

      if (first.pairId === second.pairId) {
        // Cocok!
        container.sound.sfx('chime');
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.pairId === first.pairId ? { ...c, isMatched: true } : c
            )
          );
          setSelectedIds([]);
          setIsEvaluating(false);

          // Cek jika seluruh 3 pasang sudah matched
          const remainingUnmatched = cards.filter(
            (c) => c.pairId !== first.pairId && !c.isMatched
          ).length;

          if (remainingUnmatched === 0) {
            session.correct(`memori-round-${session.round}`);
          }
        }, 500);
      } else {
        // Keliru: tutup kembali setelah jeda
        container.sound.sfx('boop');
        session.wrong();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newSelected.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setSelectedIds([]);
          setIsEvaluating(false);
        }, 1000);
      }
    }
  };

  return (
    <GameShell
      title="Memori Kartu Bunyi"
      emoji="🧠"
      color={colors.lavender}
      session={session}
      onExit={onExit}
    >
      <View style={styles.container}>
        <View style={styles.guideCard}>
          <Text style={styles.guideText}>
            Dengarkan bunyi kartu dan temukan pasangan suku kata yang sama! 🎧✨
          </Text>
        </View>

        {/* 6 Cards Grid (2 rows x 3 columns) */}
        <View style={styles.grid}>
          {cards.map((item) => (
            <FlipCard
              key={item.id}
              item={item}
              onPress={() => handleCardPress(item.id)}
            />
          ))}
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: 'center' },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: colors.line,
  },
  guideText: {
    fontFamily: fonts.heavy,
    fontSize: 13,
    color: colors.ink,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  cardContainer: {
    width: '30%',
    height: 125,
    position: 'relative',
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    gap: 4,
  },
  cardHidden: {
    backgroundColor: colors.sunny,
    borderWidth: 2,
    borderColor: colors.sunnyDark,
  },
  cardHiddenEmoji: { fontSize: 32 },
  cardHiddenLabel: {
    fontFamily: fonts.black,
    fontSize: 10,
    color: colors.ink,
  },
  cardRevealed: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.skyDark,
  },
  cardMatched: {
    backgroundColor: '#E8F8F0',
    borderWidth: 2,
    borderColor: colors.mintDark,
  },
  cardRevealedEmoji: { fontSize: 32 },
  cardRevealedText: {
    fontFamily: fonts.black,
    fontSize: 22,
    color: colors.ink,
  },
  soundIndicator: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.skyDark,
  },
});

