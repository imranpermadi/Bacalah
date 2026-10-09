import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { container } from '../../../core/di/container';
import { colors, fonts, levelMeta, radius, raised, spacing } from '../../../core/theme';
import { ALPHABET, LETTERS } from '../../../data/content/alphabet';
import { OPEN_SYLLABLES, SENTENCES, wordsForLevel } from '../../../data/content/curriculum';
import { BigButton, HearButtons, ScreenTitle } from '../../components/common/ui';
import { MascotCici } from '../../components/play/MascotCici';
import { AlphabetCard } from '../../components/play/AlphabetCard';
import { VoiceMicButton } from '../../components/play/VoiceMicButton';
import { useAppStore } from '../../stores/useAppStore';

const { width } = Dimensions.get('window');

export function BelajarScreen() {
  const [activeLevel, setActiveLevel] = useState(1);
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [ciciMood, setCiciMood] = useState<'idle' | 'talk' | 'happy' | 'hint'>('idle');
  const [ciciMsg, setCiciMsg] = useState('Pilih huruf atau level belajar yang kamu mau ya! 🐱');
  
  // Sentence quiz state for Level 6
  const [selectedSentenceIdx, setSelectedSentenceIdx] = useState(0);
  const [sentenceAnswered, setSentenceAnswered] = useState<string | null>(null);

  const currentAlphabet = ALPHABET.find((a) => a.letter === selectedLetter) || ALPHABET[0];

  const handleSelectLetter = (letter: string) => {
    setSelectedLetter(letter);
    const item = ALPHABET.find((a) => a.letter === letter);
    if (item) {
      setCiciMood('talk');
      setCiciMsg(`Ini huruf ${item.letter}! Bunyinya "${item.speak}". Contoh: ${item.word} ${item.emoji}`);
      container.sound.hear(item.speak);
    }
  };

  const renderLevelSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.levelRow}
    >
      {levelMeta.map((lvl) => {
        const isSelected = activeLevel === lvl.level;
        return (
          <Pressable
            key={lvl.level}
            onPress={() => {
              setActiveLevel(lvl.level);
              setCiciMood('talk');
              setCiciMsg(`Ayo belajar Level ${lvl.level}: ${lvl.title}! 🚀`);
              container.sound.sfx('pop');
            }}
            style={[
              styles.levelTab,
              { backgroundColor: isSelected ? lvl.color : '#FFFFFF' },
              raised(isSelected ? colors.sunnyDark : colors.line),
            ]}
          >
            <Text style={styles.levelEmoji}>{lvl.emoji}</Text>
            <Text
              style={[
                styles.levelText,
                { color: isSelected ? colors.ink : colors.inkSoft },
              ]}
            >
              L{lvl.level}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  const renderLevel1Alphabet = () => (
    <View>
      {/* Horizontal Strip of 26 Letters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.letterStrip}
      >
        {ALPHABET.map((item, idx) => {
          const isSelected = item.letter === selectedLetter;
          return (
            <Pressable
              key={item.letter}
              onPress={() => handleSelectLetter(item.letter)}
              style={[
                styles.miniLetterBubble,
                {
                  backgroundColor: isSelected ? colors.sunny : '#FFFFFF',
                  borderColor: isSelected ? colors.sunnyDark : colors.line,
                },
                raised(isSelected ? colors.sunnyDark : colors.line),
              ]}
            >
              <Text
                style={[
                  styles.miniLetterText,
                  { color: isSelected ? colors.ink : colors.inkSoft },
                ]}
              >
                {item.letter}
              </Text>
              <Text style={{ fontSize: 13 }}>{item.emoji}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Hero Interactive Card for Selected Letter */}
      <AlphabetCard
        item={currentAlphabet}
        index={ALPHABET.findIndex((a) => a.letter === selectedLetter)}
      />

      {/* Voice Challenge Practice for Letter */}
      <View style={styles.voiceSection}>
        <Text style={styles.sectionHeading}>🎤 Coba Ucapkan Bersama Cici</Text>
        <VoiceMicButton
          target={currentAlphabet.speak}
          speakText={currentAlphabet.speak}
          accepted={[currentAlphabet.speak, currentAlphabet.letter.toLowerCase()]}
        />
      </View>
    </View>
  );

  const renderLevel2Syllables = () => (
    <View style={styles.moduleCard}>
      <Text style={styles.sectionHeading}>🧩 Suku Kata Terbuka (2 Huruf)</Text>
      <Text style={styles.sectionSub}>Ketuk suku kata untuk mendengarkan bunyinya!</Text>
      <View style={styles.syllableGrid}>
        {OPEN_SYLLABLES.slice(0, 30).map((syl, i) => (
          <Pressable
            key={syl}
            onPress={() => {
              container.sound.sfx('tap');
              container.sound.speak(syl.toLowerCase());
            }}
            style={[
              styles.syllableBubble,
              raised(colors.skyDark),
              { backgroundColor: i % 2 === 0 ? colors.sky : colors.mint },
            ]}
          >
            <Text style={styles.syllableText}>{syl}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderWordLevel = (level: number, title: string, sub: string) => {
    const list = wordsForLevel(level);
    return (
      <View style={styles.moduleCard}>
        <Text style={styles.sectionHeading}>{title}</Text>
        <Text style={styles.sectionSub}>{sub}</Text>
        <View style={styles.wordsContainer}>
          {list.map((item) => (
            <View key={item.word} style={styles.wordCard}>
              <Text style={styles.wordCardEmoji}>{item.emoji}</Text>
              <View style={styles.syllableBadgeRow}>
                {item.syllables.map((s, idx) => (
                  <View key={idx} style={styles.syllableBadge}>
                    <Text style={styles.syllableBadgeText}>{s}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.wordCardFull}>{item.word}</Text>
              <HearButtons
                text={item.word.toLowerCase()}
                slowParts={item.syllables.map((s) => s.toLowerCase())}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderLevel6Sentences = () => {
    const current = SENTENCES[selectedSentenceIdx];
    return (
      <View style={styles.moduleCard}>
        <Text style={styles.sectionHeading}>📖 Kalimat Pendek & Pemahaman</Text>
        <Text style={styles.sectionSub}>Dengarkan cerita Cici, lalu jawab pertanyaannya!</Text>

        <View style={styles.sentenceHero}>
          <Text style={{ fontSize: 72, textAlign: 'center' }}>{current.emoji}</Text>
          <Text style={styles.sentenceText}>{current.text}</Text>
          <HearButtons
            text={current.text}
            slowParts={current.text.split(' ')}
          />
        </View>

        <View style={styles.questionBox}>
          <Text style={styles.questionText}>❓ {current.question}</Text>
          <View style={styles.choiceRow}>
            {current.choices.map((c) => {
              const isCorrect = c.label === current.answer;
              const isPicked = sentenceAnswered === c.label;
              return (
                <Pressable
                  key={c.label}
                  onPress={() => {
                    setSentenceAnswered(c.label);
                    if (isCorrect) {
                      container.sound.sfx('chime');
                      setCiciMood('happy');
                      setCiciMsg('Pintar sekali! Jawabanmu tepat! 🎉');
                      useAppStore.getState().addStars(1);
                    } else {
                      container.sound.sfx('boop');
                      setCiciMood('hint');
                      setCiciMsg('Hampir tepat! Ayo perhatikan lagi ceritanya! 💛');
                    }
                  }}
                  style={[
                    styles.choiceButton,
                    raised(
                      isPicked
                        ? isCorrect
                          ? colors.mintDark
                          : colors.coralDark
                        : colors.line
                    ),
                    {
                      backgroundColor: isPicked
                        ? isCorrect
                          ? colors.mint
                          : colors.coral
                        : '#FFFFFF',
                    },
                  ]}
                >
                  <Text style={{ fontSize: 24 }}>{c.emoji}</Text>
                  <Text style={styles.choiceLabel}>{c.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.sentenceNavRow}>
          <BigButton
            label="⬅ Kalimat Sebelumnya"
            small
            disabled={selectedSentenceIdx === 0}
            onPress={() => {
              setSelectedSentenceIdx((i) => Math.max(0, i - 1));
              setSentenceAnswered(null);
            }}
          />
          <BigButton
            label="Kalimat Berikutnya ➡"
            small
            color={colors.sunny}
            edge={colors.sunnyDark}
            disabled={selectedSentenceIdx === SENTENCES.length - 1}
            onPress={() => {
              setSelectedSentenceIdx((i) => Math.min(SENTENCES.length - 1, i + 1));
              setSentenceAnswered(null);
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenTitle sub="Jelajahi 26 Huruf A-Z, Suku Kata, dan Cerita Pendek">
        Belajar Bersama Cici 📖
      </ScreenTitle>

      {/* Mascot Cici Guide */}
      <View style={{ marginVertical: 6 }}>
        <MascotCici mood={ciciMood} message={ciciMsg} size={70} />
      </View>

      {/* Level Selector Bar */}
      {renderLevelSelector()}

      {/* Scrollable Content based on Level */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {activeLevel === 1 && renderLevel1Alphabet()}
        {activeLevel === 2 && renderLevel2Syllables()}
        {activeLevel === 3 &&
          renderWordLevel(
            3,
            '📕 Gabung 2 Suku Kata Terbuka',
            'Kata dasar mudah dengan vokal A, I, U, E, O'
          )}
        {activeLevel === 4 &&
          renderWordLevel(
            4,
            '🏠 Suku Kata Tertutup',
            'Kata berakhiran konsonan (MA-KAN, RU-MAH, dsb.)'
          )}
        {activeLevel === 5 &&
          renderWordLevel(
            5,
            '🌸 Diftong & Konsonan Rangkap',
            'Kata dengan bunyi NG, NY, dan diftong AU/AI'
          )}
        {activeLevel === 6 && renderLevel6Sentences()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  levelRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 10 },
  levelTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  levelEmoji: { fontSize: 20 },
  levelText: { fontFamily: fonts.black, fontSize: 14, marginTop: 2 },
  letterStrip: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  miniLetterBubble: {
    width: 54,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  miniLetterText: { fontFamily: fonts.black, fontSize: 22 },
  voiceSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: 16,
    borderBottomWidth: 4,
    borderBottomColor: colors.line,
  },
  sectionHeading: {
    fontFamily: fonts.black,
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionSub: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 16,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: radius.lg,
    padding: 16,
    borderBottomWidth: 4,
    borderBottomColor: colors.line,
  },
  syllableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  syllableBubble: {
    width: (width - 80) / 4,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syllableText: { fontFamily: fonts.black, fontSize: 22, color: colors.ink },
  wordsContainer: { gap: 16 },
  wordCard: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.line,
  },
  wordCardEmoji: { fontSize: 60, marginBottom: 4 },
  syllableBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  syllableBadge: {
    backgroundColor: colors.sunny,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomWidth: 3,
    borderBottomColor: colors.sunnyDark,
  },
  syllableBadgeText: { fontFamily: fonts.black, fontSize: 18, color: colors.ink },
  wordCardFull: {
    fontFamily: fonts.black,
    fontSize: 28,
    color: colors.ink,
    marginBottom: 12,
  },
  sentenceHero: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.line,
  },
  sentenceText: {
    fontFamily: fonts.black,
    fontSize: 24,
    color: colors.ink,
    textAlign: 'center',
    marginVertical: 12,
  },
  questionBox: {
    backgroundColor: '#F7F7FA',
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 16,
  },
  questionText: {
    fontFamily: fonts.heavy,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  choiceRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  choiceButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 2,
  },
  choiceLabel: {
    fontFamily: fonts.black,
    fontSize: 16,
    color: colors.ink,
    marginTop: 4,
  },
  sentenceNavRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
});
