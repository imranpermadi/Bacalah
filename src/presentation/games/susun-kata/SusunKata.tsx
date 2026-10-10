import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { container } from '../../../core/di/container';
import { bubblePalette, colors, fonts, radius, raised } from '../../../core/theme';
import { WORDS } from '../../../data/content/curriculum';
import { WordItem } from '../../../domain/entities/DictationExercise';
import { Float, Wobble } from '../../components/common/Motion';
import { BigButton } from '../../components/common/ui';
import { GameShell, useGameSession } from '../GameShell';

/**
 * 🔤 Susun Kata Acak (Anagram Kata)
 * Tingkat Kesulitan Tinggi: Huruf-huruf diacak dan anak harus menyusunnya ke slot dalam urutan yang tepat.
 */
export function SusunKata({ onExit }: { onExit: () => void }) {
  const session = useGameSession('susun-kata', 30);

  // Ambil kata sesuai round
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
    // Pastikan teracak dan tidak sama persis dengan aslinya
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

    // Tandai tile sebagai used dan masukkan ke placed
    const nextPlaced = [...placed, { id: item.id, letter: item.letter }];
    setPlaced(nextPlaced);
    setScrambled((prev) =>
      prev.map((t) => (t.id === item.id ? { ...t, used: true } : t))
    );

    // Cek jika seluruh slot sudah terisi
    if (nextPlaced.length === currentWord.word.length) {
      const spelled = nextPlaced.map((p) => p.letter).join('');
      if (spelled === currentWord.word) {
        container.sound.sfx('chime');
        session.correct(`susun-${currentWord.word}`);
      } else {
        container.sound.sfx('boop');
        setWobbleToken((t) => t + 1);
        session.wrong();
        // Beri jeda lalu kembalikan huruf yang salah
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
        {/* Clue Header: Gambar Saja (Tanpa Bocoran Kata) */}
        <View style={styles.clueCard}>
          <Text style={styles.clueEmoji}>{currentWord.emoji}</Text>
          <Text style={styles.clueTextHint}>Tebak gambar di atas ({currentWord.word.length} Huruf)</Text>
          <BigButton
            label="🔊 Petunjuk Suara Cici"
            small
            color={colors.sunny}
            edge={colors.sunnyDark}
            onPress={hearWord}
          />
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
              <Pressable
                key={item.id}
                disabled={item.used}
                onPress={() => handleTilePress(item)}
                style={[
                  styles.tile,
                  item.used ? styles.tileUsed : raised(edge),
                  { backgroundColor: item.used ? '#E0DDD2' : bg },
                ]}
              >
                <Text style={[styles.tileLetter, item.used && { color: '#BDBDBD' }]}>
                  {item.letter}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Undo / Reset Button */}
        {placed.length > 0 && (
          <View style={{ alignItems: 'center', marginTop: 12 }}>
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
  clueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 14,
    alignItems: 'center',
    width: '100%',
    gap: 10,
    borderBottomWidth: 4,
    borderBottomColor: colors.line,
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
    marginVertical: 20,
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
  },
  slotBoxEmpty: {
    backgroundColor: '#F5F3E9',
    borderWidth: 2,
    borderColor: '#D8D4C0',
    borderStyle: 'dashed',
  },
  slotBoxFilled: {
    backgroundColor: colors.mint,
    borderBottomWidth: 4,
    borderBottomColor: colors.mintDark,
  },
  slotText: {
    fontFamily: fonts.black,
    fontSize: 32,
    color: colors.ink,
  },
  removeHint: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 10,
    color: colors.inkSoft,
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
  },
  tileUsed: {
    opacity: 0.4,
  },
  tileLetter: {
    fontFamily: fonts.black,
    fontSize: 34,
    color: colors.ink,
  },
});

