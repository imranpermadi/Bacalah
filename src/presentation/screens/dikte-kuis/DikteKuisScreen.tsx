import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { container } from '../../../core/di/container';
import { colors, fonts, levelMeta, radius, raised, spacing } from '../../../core/theme';
import { randomHint, randomPraise } from '../../../data/content/feedback';
import { DictationExercise } from '../../../domain/entities/DictationExercise';
import { DictationGenerator } from '../../../domain/services/DictationGenerator';
import { Celebration } from '../../components/common/Celebration';
import { BigButton, HearButtons, ScreenTitle, Stars } from '../../components/common/ui';
import { BubbleKeyboard } from '../../components/play/BubbleKeyboard';
import { DictationInputSlot } from '../../components/play/DictationInputSlot';
import { MascotCici, Mood } from '../../components/play/MascotCici';
import { VoiceMicButton } from '../../components/play/VoiceMicButton';
import { VoiceResult } from '../../../core/sound/VoiceEvaluatorService';
import { useAppStore } from '../../stores/useAppStore';

const { width } = Dimensions.get('window');
const SESSION_SIZE = 30; // Minimal 30 varian soal per level

export function DikteKuisScreen() {
  const profile = useAppStore((s) => s.profile);
  const levels = useAppStore((s) => s.levels);
  const weights = useAppStore((s) => s.weights);
  const recordLetter = useAppStore((s) => s.recordLetter);
  const finishSession = useAppStore((s) => s.finishSession);
  const setMode = useAppStore((s) => s.setMode);

  const [activeLevel, setActiveLevel] = useState(1);
  const [exercises, setExercises] = useState<DictationExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [mistakesThisQuestion, setMistakesThisQuestion] = useState(0);
  const [totalCorrectFirstTry, setTotalCorrectFirstTry] = useState(0);

  // Mascot Cici Feedback State
  const [ciciMood, setCiciMood] = useState<Mood>('idle');
  const [ciciMoodToken, setCiciMoodToken] = useState(0);
  const [ciciMessage, setCiciMessage] = useState('Dengarkan baik-baik ya, lalu ketik hurufnya! 🎧');

  // Input Slot Wobble & Key Wobble
  const [slotWobbleToken, setSlotWobbleToken] = useState(0);
  const [wobbleKey, setWobbleKey] = useState<{ letter: string | null; token: number }>({
    letter: null,
    token: 0,
  });

  // End of session celebration
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [unlockedNextSuccess, setUnlockedNextSuccess] = useState(false);
  const sessionSaved = useRef(false);

  const isLevelUnlocked = (lvlNum: number) => {
    if (lvlNum === 1) return true;
    const item = levels.find((l) => l.level === lvlNum);
    return item ? item.unlocked : (profile.unlockedLevel >= lvlNum);
  };

  // Load exercises when level changes or after restarting
  const loadExercises = (lvl: number) => {
    const list = DictationGenerator.generate(lvl, SESSION_SIZE, weights);
    setExercises(list);
    setCurrentIndex(0);
    setTyped('');
    setMistakesThisQuestion(0);
    setTotalCorrectFirstTry(0);
    setIsSessionComplete(false);
    setUnlockedNextSuccess(false);
    sessionSaved.current = false;
    setCiciMood('idle');
    setCiciMessage('Ayo mulai! Tekan tombol Dengar Cici bila perlu! 🐱');
  };

  useEffect(() => {
    loadExercises(activeLevel);
  }, [activeLevel]);

  const currentExercise = exercises[currentIndex];

  // Auto-play audio when a new exercise appears
  useEffect(() => {
    if (!currentExercise || isSessionComplete) return;
    const t = setTimeout(() => {
      container.sound.hear(currentExercise.speakText);
    }, 450);
    return () => clearTimeout(t);
  }, [currentIndex, currentExercise, isSessionComplete]);

  // Handle letter tapped on BubbleKeyboard
  const handleLetterPress = (pressedLetter: string) => {
    if (!currentExercise || isSessionComplete) return;

    const expectedIndex = typed.length;
    const targetChar = currentExercise.target[expectedIndex];

    if (!targetChar) return;

    const isMatch = pressedLetter.toUpperCase() === targetChar.toUpperCase();

    // Dynamically update accuracy stats in SQLite for weak letter tracking
    recordLetter(targetChar, isMatch, pressedLetter);

    if (isMatch) {
      const nextTyped = typed + targetChar;
      setTyped(nextTyped);
      container.sound.sfx('pop');

      // Check if word / target completed
      if (nextTyped.length === currentExercise.target.length) {
        if (mistakesThisQuestion === 0) {
          setTotalCorrectFirstTry((prev) => prev + 1);
        }
        setCiciMood('happy');
        setCiciMoodToken((t) => t + 1);
        setCiciMessage(randomPraise());
        container.sound.sfx('chime');

        setTimeout(() => {
          if (currentIndex + 1 >= exercises.length) {
            handleCompleteSession();
          } else {
            setCurrentIndex((i) => i + 1);
            setTyped('');
            setMistakesThisQuestion(0);
            setCiciMood('idle');
            setCiciMessage('Luar biasa! Lanjut ke soal berikutnya! ✨');
          }
        }, 1100);
      }
    } else {
      // Gentle feedback: wobble, no scary buzzer
      setMistakesThisQuestion((m) => m + 1);
      setSlotWobbleToken((t) => t + 1);
      setWobbleKey({ letter: pressedLetter, token: wobbleKey.token + 1 });
      container.sound.sfx('boop');
      setCiciMood('hint');
      setCiciMoodToken((t) => t + 1);
      setCiciMessage(randomHint());
    }
  };

  const handleCompleteSession = async () => {
    setIsSessionComplete(true);
    const total = exercises.length || 1;
    const accuracy = (totalCorrectFirstTry / total) * 100;
    // Opsi A: minimal akurasi 80%
    const passed = accuracy >= 80;
    const starsWon = accuracy >= 90 ? 3 : accuracy >= 80 ? 2 : 1;

    if (!sessionSaved.current) {
      sessionSaved.current = true;
      const res = await finishSession(activeLevel, starsWon);
      setUnlockedNextSuccess(res.unlockedNext);
      if (passed) {
        container.sound.sfx('clap');
      } else {
        container.sound.sfx('boop');
      }
    }
  };

  // Handle voice speech recognition result in Dictation
  const handleVoiceResult = (res: VoiceResult) => {
    if (!currentExercise || isSessionComplete) return;
    if (res.similarity >= 0.55 || res.stars >= 2) {
      for (const ch of currentExercise.target) {
        recordLetter(ch, true);
      }
      setTyped(currentExercise.target);
      if (mistakesThisQuestion === 0) {
        setTotalCorrectFirstTry((prev) => prev + 1);
      }
      setCiciMood('happy');
      setCiciMoodToken((t) => t + 1);
      setCiciMessage('Hebat sekali! Lafalmu jelas dan tepat! 🎤🌟');
      container.sound.sfx('chime');

      setTimeout(() => {
        if (currentIndex + 1 >= exercises.length) {
          handleCompleteSession();
        } else {
          setCurrentIndex((i) => i + 1);
          setTyped('');
          setMistakesThisQuestion(0);
          setCiciMood('idle');
          setCiciMessage('Luar biasa! Lanjut ke soal berikutnya! ✨');
        }
      }, 1200);
    }
  };

  // Determine keyboard letters for Adaptive Scaffolding
  const currentKeyLetters = React.useMemo(() => {
    if (!currentExercise) return [];
    if (profile.mode === 'mandiri') {
      return []; // empty array means full 26 letters A-Z
    }
    const targetChar = currentExercise.target[typed.length] || currentExercise.target[0];
    return DictationGenerator.choices(targetChar, 4, weights);
  }, [currentExercise, typed, profile.mode, weights]);

  const highlightChar =
    mistakesThisQuestion >= 2 && currentExercise
      ? currentExercise.target[typed.length]
      : null;

  const totalQuestions = exercises.length || SESSION_SIZE;
  const accuracyPercent = Math.round((totalCorrectFirstTry / totalQuestions) * 100);
  const isPassed = accuracyPercent >= 80;
  const earnedStars = accuracyPercent >= 90 ? 3 : accuracyPercent >= 80 ? 2 : 1;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenTitle sub="Dengarkan Suara Cici, Lalu Ketik atau Ucapkan!">
        Dikte Cerdas Cici 📝
      </ScreenTitle>

      {/* Scaffolding Mode & Level Switcher */}
      <View style={styles.controlRow}>
        <View style={styles.modeSwitch}>
          <Pressable
            onPress={() => setMode('pemula')}
            style={[
              styles.modeBtn,
              profile.mode === 'pemula' && styles.modeBtnActive,
            ]}
          >
            <Text
              style={[
                styles.modeBtnText,
                profile.mode === 'pemula' && styles.modeBtnTextActive,
              ]}
            >
              🐣 Pemula (4 Huruf)
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('mandiri')}
            style={[
              styles.modeBtn,
              profile.mode === 'mandiri' && styles.modeBtnActive,
            ]}
          >
            <Text
              style={[
                styles.modeBtnText,
                profile.mode === 'mandiri' && styles.modeBtnTextActive,
              ]}
            >
              🦁 Mandiri (A–Z)
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Level Buttons Bar */}
      <View style={{ height: 48 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.levelBar}
        >
          {levelMeta.map((l) => {
            const isSelected = activeLevel === l.level;
            const unlocked = isLevelUnlocked(l.level);
            return (
              <Pressable
                key={l.level}
                onPress={() => {
                  if (!unlocked) {
                    container.sound.sfx('boop');
                    setCiciMood('hint');
                    setCiciMessage(
                      `Level ${l.level} masih terkunci 🔒! Selesaikan Level ${l.level - 1} dengan minimal 80% akurasi dulu ya!`
                    );
                    return;
                  }
                  setActiveLevel(l.level);
                  container.sound.sfx('pop');
                }}
                style={[
                  styles.levelPill,
                  {
                    backgroundColor: isSelected
                      ? l.color
                      : unlocked
                      ? '#FFFFFF'
                      : '#E0DDD2',
                    opacity: unlocked ? 1 : 0.6,
                  },
                  raised(isSelected ? colors.sunnyDark : colors.line),
                ]}
              >
                <Text style={styles.levelPillEmoji}>{unlocked ? l.emoji : '🔒'}</Text>
                <Text style={styles.levelPillText}>
                  L{l.level} {l.title.split(' ')[0]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Arena / Completion State */}
      {isSessionComplete ? (
        <View style={styles.completeBox}>
          {isPassed && <Celebration visible />}
          <Text style={styles.completeTitle}>
            {isPassed ? 'Luar Biasa, Kamu Lulus! 🎉' : 'Ayo Latihan Lagi! 🐣'}
          </Text>

          <Stars count={earnedStars} size={54} />

          <Text style={styles.completeSubtitle}>
            Akurasi: {accuracyPercent}% ({totalCorrectFirstTry} dari {totalQuestions} Soal Benar)
          </Text>

          <Text style={styles.completeSub2}>
            {isPassed
              ? activeLevel < 6
                ? `Selamat! Level ${activeLevel + 1} sekarang sudah TERBUKA untukmu! 🏆`
                : 'Hebat sekali! Kamu telah menuntaskan seluruh level membaca! 🌟'
              : 'Syarat lulus membuka level berikutnya adalah minimal 80% akurasi (2 Bintang). Ayo ulangi lagi ya! Cici selalu menyemangatimu! 💛'}
          </Text>

          <View style={styles.completeBtnRow}>
            {isPassed && activeLevel < 6 ? (
              <BigButton
                label={`🚀 Lanjut ke Level ${activeLevel + 1}`}
                color={colors.mint}
                edge={colors.mintDark}
                onPress={() => {
                  setActiveLevel(activeLevel + 1);
                }}
              />
            ) : null}

            <BigButton
              label={`🔁 Ulangi Level ${activeLevel}`}
              color={colors.sunny}
              edge={colors.sunnyDark}
              onPress={() => loadExercises(activeLevel)}
            />
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollWrapper}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Mascot Feedback Bubble */}
          <MascotCici
            mood={ciciMood}
            moodToken={ciciMoodToken}
            message={ciciMessage}
            size={70}
          />

          {/* Question Hero Arena */}
          {currentExercise ? (
            <View style={styles.arenaCard}>
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  Soal {currentIndex + 1} dari {totalQuestions}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 14 }}>⭐</Text>
                  <Text style={styles.progressText}>{totalCorrectFirstTry} Benar</Text>
                </View>
              </View>

              <View style={styles.actionSection}>
                <HearButtons
                  text={currentExercise.speakText}
                  slowParts={currentExercise.slowParts}
                />

                <View style={styles.slotContainer}>
                  <DictationInputSlot
                    target={currentExercise.target}
                    typed={typed}
                    wobbleToken={slotWobbleToken}
                    emoji={currentExercise.emoji}
                  />
                </View>

                {/* Voice Input Integration */}
                <View style={{ marginTop: 2 }}>
                  <VoiceMicButton
                    target={currentExercise.target}
                    speakText={currentExercise.speakText}
                    accepted={[currentExercise.target, currentExercise.speakText]}
                    onResult={handleVoiceResult}
                  />
                </View>
              </View>
            </View>
          ) : null}

          {/* Custom BubbleKeyboard (Tactile 3D, Kid-friendly) */}
          <View style={styles.keyboardContainer}>
            <BubbleKeyboard
              letters={currentKeyLetters}
              onPress={handleLetterPress}
              highlightLetter={highlightChar}
              wobbleLetter={wobbleKey.letter}
              wobbleToken={wobbleKey.token}
              width={width}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  controlRow: { paddingHorizontal: 16, marginBottom: 6 },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#EBE6D2',
    borderRadius: radius.pill,
    padding: 3,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modeBtnText: {
    fontFamily: fonts.heavy,
    fontSize: 13,
    color: colors.inkSoft,
  },
  modeBtnTextActive: {
    color: colors.ink,
  },
  levelBar: { paddingHorizontal: 16, paddingVertical: 6, gap: 8 },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    gap: 6,
  },
  levelPillEmoji: { fontSize: 16 },
  levelPillText: { fontFamily: fonts.black, fontSize: 13, color: colors.ink },
  scrollWrapper: { flex: 1 },
  scrollContent: {
    paddingBottom: 110,
    paddingTop: 4,
    gap: 12,
  },
  arenaCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: radius.lg,
    padding: 16,
    borderBottomWidth: 5,
    borderBottomColor: colors.line,
  },
  actionSection: {
    alignItems: 'center',
    gap: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.inkSoft,
  },
  slotContainer: { marginVertical: 14, alignItems: 'center' },
  keyboardContainer: {
    paddingHorizontal: 8,
    paddingTop: 8,
    alignItems: 'center',
  },
  completeBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  completeTitle: {
    fontFamily: fonts.black,
    fontSize: 28,
    color: colors.ink,
    textAlign: 'center',
  },
  completeSubtitle: {
    fontFamily: fonts.heavy,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
  },
  completeSub2: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  completeBtnRow: { width: '100%', gap: 12 },
});
