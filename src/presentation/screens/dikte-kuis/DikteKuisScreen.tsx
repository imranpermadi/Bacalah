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
const SESSION_SIZE = 5;

export function DikteKuisScreen() {
  const profile = useAppStore((s) => s.profile);
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
  const sessionSaved = useRef(false);

  // Load exercises when level changes or after restarting
  const loadExercises = (lvl: number) => {
    const list = DictationGenerator.generate(lvl, SESSION_SIZE, weights);
    setExercises(list);
    setCurrentIndex(0);
    setTyped('');
    setMistakesThisQuestion(0);
    setTotalCorrectFirstTry(0);
    setIsSessionComplete(false);
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

  const handleCompleteSession = () => {
    setIsSessionComplete(true);
    const starsWon =
      totalCorrectFirstTry >= 4 ? 3 : totalCorrectFirstTry >= 2 ? 2 : 1;
    if (!sessionSaved.current) {
      sessionSaved.current = true;
      finishSession(activeLevel, starsWon);
      container.sound.sfx('clap');
    }
  };

  // Handle voice speech recognition result in Dictation
  const handleVoiceResult = (res: VoiceResult) => {
    if (!currentExercise || isSessionComplete) return;
    if (res.similarity >= 0.55 || res.stars >= 2) {
      // Tepat atau mendekati: langsung anggap benar
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
    // Pemula mode: 3-4 options around the current expected letter
    const targetChar = currentExercise.target[typed.length] || currentExercise.target[0];
    return DictationGenerator.choices(targetChar, 4, weights);
  }, [currentExercise, typed, profile.mode, weights]);

  // Visual hint: highlight expected letter if kid struggled twice
  const highlightChar =
    mistakesThisQuestion >= 2 && currentExercise
      ? currentExercise.target[typed.length]
      : null;

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
          {levelMeta.slice(0, 5).map((l) => {
            const isSelected = activeLevel === l.level;
            return (
              <Pressable
                key={l.level}
                onPress={() => {
                  setActiveLevel(l.level);
                  container.sound.sfx('pop');
                }}
                style={[
                  styles.levelPill,
                  { backgroundColor: isSelected ? l.color : '#FFFFFF' },
                  raised(isSelected ? colors.sunnyDark : colors.line),
                ]}
              >
                <Text style={styles.levelPillEmoji}>{l.emoji}</Text>
                <Text style={styles.levelPillText}>L{l.level}: {l.title}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isSessionComplete ? (
        <View style={styles.completeBox}>
          <Text style={styles.completeTitle}>Sesi Dikte Selesai! 🎉</Text>
          <Stars
            count={
              totalCorrectFirstTry >= 4 ? 3 : totalCorrectFirstTry >= 2 ? 2 : 1
            }
            size={58}
          />
          <Text style={styles.completeSubtitle}>
            Tepat tanpa salah: {totalCorrectFirstTry} dari {SESSION_SIZE} soal!
          </Text>
          <Text style={styles.completeSub2}>
            Hebat! Huruf yang kamu latih otomatis tercatat di Rapor Alfabet.
          </Text>
          <View style={styles.completeBtnRow}>
            <BigButton
              label="🔁 Latih Lagi Level Ini"
              color={colors.mint}
              edge={colors.mintDark}
              onPress={() => loadExercises(activeLevel)}
            />
            {activeLevel < 5 && (
              <BigButton
                label="Lanjut ke Level Berikutnya 🚀"
                color={colors.sunny}
                edge={colors.sunnyDark}
                onPress={() => setActiveLevel((lvl) => lvl + 1)}
              />
            )}
          </View>
          <Celebration visible />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollWrapper}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Cici Mascot Bubble */}
          <MascotCici
            mood={ciciMood}
            moodToken={ciciMoodToken}
            message={ciciMessage}
            size={72}
          />

          {/* Exercise Arena */}
          {currentExercise ? (
            <View style={styles.arenaCard}>
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  Soal {currentIndex + 1} dari {exercises.length}
                </Text>
                {currentExercise.emoji ? (
                  <Text style={{ fontSize: 32 }}>{currentExercise.emoji}</Text>
                ) : null}
              </View>

              {/* Blinking Interactive Input Slots */}
              <View style={styles.slotContainer}>
                <DictationInputSlot
                  target={currentExercise.target}
                  typed={typed}
                  wobbleToken={slotWobbleToken}
                />
              </View>

              {/* Hear and Voice Mic Section */}
              <View style={styles.actionSection}>
                <HearButtons
                  text={currentExercise.speakText}
                  slowParts={currentExercise.slowParts}
                />
                <View style={{ marginTop: 8 }}>
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
    fontSize: 32,
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
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 16,
  },
  completeBtnRow: { width: '100%', gap: 12 },
});

