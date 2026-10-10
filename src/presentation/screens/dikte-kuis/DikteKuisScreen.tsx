import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
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
const SESSION_SIZE = 30; // 30 varian soal per level
const TIME_LIMIT_SECONDS = 20;

export function DikteKuisScreen() {
  const profile = useAppStore((s) => s.profile);
  const levels = useAppStore((s) => s.levels);
  const weights = useAppStore((s) => s.weights);
  const recordLetter = useAppStore((s) => s.recordLetter);
  const finishSession = useAppStore((s) => s.finishSession);

  // Mode Pengganti: Opsi 2 (Susun Balok Suku Kata) & Opsi 3 (Tantangan Kilat Bintang Emas)
  const [dikteMode, setDikteMode] = useState<'balok' | 'kilat'>('balok');

  const [activeLevel, setActiveLevel] = useState(1);
  const [exercises, setExercises] = useState<DictationExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [mistakesThisQuestion, setMistakesThisQuestion] = useState(0);
  const [totalCorrectFirstTry, setTotalCorrectFirstTry] = useState(0);

  // Timer untuk Opsi 3: Tantangan Kilat (20 detik)
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Mascot Cici Feedback State
  const [ciciMood, setCiciMood] = useState<Mood>('idle');
  const [ciciMoodToken, setCiciMoodToken] = useState(0);
  const [ciciMessage, setCiciMessage] = useState('Dengarkan baik-baik suara Cici, lalu susun jawabannya! 🐱');

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
    return item ? item.unlocked : profile.unlockedLevel >= lvlNum;
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
    setTimeLeft(TIME_LIMIT_SECONDS);
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

  // Timer Effect for Mode Tantangan Kilat (Opsi 3)
  useEffect(() => {
    if (dikteMode !== 'kilat' || isSessionComplete || !currentExercise) return;
    setTimeLeft(TIME_LIMIT_SECONDS);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCiciMood('hint');
          setCiciMessage('Waktu habis! Cici bantu beri petunjuk bunyinya ya! ⏳');
          container.sound.sfx('boop');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, dikteMode, isSessionComplete, currentExercise]);

  // Handle syllable block pressed in Opsi 2 (Susun Balok Suku Kata)
  const handleSyllableBlockPress = (syl: string) => {
    if (!currentExercise || isSessionComplete) return;

    const remainingTarget = currentExercise.target.slice(typed.length);
    if (remainingTarget.toUpperCase().startsWith(syl.toUpperCase())) {
      const nextTyped = typed + syl.toUpperCase();
      setTyped(nextTyped);
      container.sound.sfx('pop');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (nextTyped.length === currentExercise.target.length) {
        handleQuestionCompleted();
      }
    } else {
      setMistakesThisQuestion((m) => m + 1);
      setSlotWobbleToken((t) => t + 1);
      container.sound.sfx('boop');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCiciMood('hint');
      setCiciMessage(randomHint());
    }
  };

  // Handle letter press in Keyboard
  const handleLetterPress = (pressedLetter: string) => {
    if (!currentExercise || isSessionComplete) return;

    const expectedIndex = typed.length;
    const targetChar = currentExercise.target[expectedIndex];

    if (!targetChar) return;

    const isMatch = pressedLetter.toUpperCase() === targetChar.toUpperCase();
    recordLetter(targetChar, isMatch, pressedLetter);

    if (isMatch) {
      const nextTyped = typed + targetChar;
      setTyped(nextTyped);
      container.sound.sfx('pop');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (nextTyped.length === currentExercise.target.length) {
        handleQuestionCompleted();
      }
    } else {
      setMistakesThisQuestion((m) => m + 1);
      setSlotWobbleToken((t) => t + 1);
      setWobbleKey({ letter: pressedLetter, token: wobbleKey.token + 1 });
      container.sound.sfx('boop');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCiciMood('hint');
      setCiciMessage(randomHint());
    }
  };

  const handleQuestionCompleted = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (mistakesThisQuestion === 0) {
      setTotalCorrectFirstTry((prev) => prev + 1);
    }
    setCiciMood('happy');
    setCiciMoodToken((t) => t + 1);
    setCiciMessage(
      dikteMode === 'kilat' && timeLeft > 0
        ? '⚡ Kilat Sekali! Kamu dapat Bonus Bintang Emas! 🌟🌟'
        : randomPraise()
    );
    container.sound.sfx('chime');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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
  };

  const handleVoiceResult = (res: VoiceResult) => {
    if (!currentExercise || isSessionComplete) return;

    if (res.stars >= 2) {
      setTyped(currentExercise.target);
      if (mistakesThisQuestion === 0) {
        setTotalCorrectFirstTry((prev) => prev + 1);
      }
      setCiciMood('happy');
      setCiciMoodToken((t) => t + 1);
      setCiciMessage(`Hebat! Lafalmu jelas sekali (${Math.round(res.similarity * 100)}%)! 🎤✨`);
      container.sound.sfx('chime');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

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

  const handleCompleteSession = async () => {
    if (sessionSaved.current) return;
    sessionSaved.current = true;

    setIsSessionComplete(true);
    const totalQuestions = exercises.length || SESSION_SIZE;
    const finalAccuracy = Math.round((totalCorrectFirstTry / totalQuestions) * 100);
    const passed = finalAccuracy >= 80;

    let starsEarned = 1;
    if (finalAccuracy >= 90) starsEarned = 3;
    else if (finalAccuracy >= 80) starsEarned = 2;

    if (passed) {
      const nextLevelToUnlock = activeLevel + 1;
      if (nextLevelToUnlock <= 6) {
        setUnlockedNextSuccess(true);
      }
    }

    try {
      await finishSession(activeLevel, starsEarned);
    } catch (e) {
      console.warn('Gagal menyimpan sesi:', e);
    }
  };

  // Syllable/Letter tiles generator for Mode Opsi 2 (Susun Balok Suku Kata / Huruf)
  const syllableTiles = useMemo(() => {
    if (!currentExercise) return [];

    // Jika level 1 (Huruf tunggal): pilihan harus berupa huruf, bukan suku kata!
    if (currentExercise.kind === 'letter') {
      const targetChar = currentExercise.target.toUpperCase();
      const choices = DictationGenerator.choices(targetChar, 3, weights);
      return choices.map((c) => c.toUpperCase());
    }

    // Jika level 2 (Suku kata tunggal):
    if (currentExercise.kind === 'syllable') {
      const targetSyl = currentExercise.target.toUpperCase();
      const syllableDistractors = ['BA', 'KI', 'DA', 'MA', 'RO', 'TI', 'SU', 'LE', 'PA'].filter(
        (d) => d !== targetSyl
      ).slice(0, 2);
      return [targetSyl, ...syllableDistractors].sort(() => Math.random() - 0.5);
    }

    // Jika level 3-5 (Kata dengan 2 atau lebih suku kata):
    const parts = (currentExercise.slowParts && currentExercise.slowParts.length > 0
      ? currentExercise.slowParts
      : currentExercise.target.match(/.{1,2}/g) || [currentExercise.target]
    ).map((p) => p.toUpperCase());

    const distractors = ['BA', 'KI', 'DA', 'MA', 'RO', 'TI', 'SU', 'PA', 'LU'].filter(
      (d) => !parts.includes(d)
    ).slice(0, 2);

    return [...parts, ...distractors].sort(() => Math.random() - 0.5);
  }, [currentExercise, weights]);

  const currentKeyLetters = useMemo(() => {
    if (!currentExercise) return [];
    const targetChar = currentExercise.target[typed.length] || currentExercise.target[0];
    return DictationGenerator.choices(targetChar, 4, weights);
  }, [currentExercise, typed, weights]);

  const totalQuestions = exercises.length || SESSION_SIZE;
  const accuracyPercent = Math.round((totalCorrectFirstTry / totalQuestions) * 100);
  const isPassed = accuracyPercent >= 80;
  const earnedStars = accuracyPercent >= 90 ? 3 : accuracyPercent >= 80 ? 2 : 1;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenTitle sub="Dengarkan Suara Cici, Lalu Susun Balok atau Selesaikan Kilat!">
        Dikte Cerdas Cici 📝
      </ScreenTitle>

      {/* Mode Switcher: Opsi 2 vs Opsi 3 */}
      <View style={styles.controlRow}>
        <View style={styles.modeSwitch}>
          <Pressable
            onPress={() => {
              setDikteMode('balok');
              container.sound.sfx('pop');
              Haptics.selectionAsync();
            }}
            style={[
              styles.modeBtn,
              dikteMode === 'balok' && styles.modeBtnActive,
            ]}
          >
            <Text
              style={[
                styles.modeBtnText,
                dikteMode === 'balok' && styles.modeBtnTextActive,
              ]}
            >
              🧩 Susun Suku Kata
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setDikteMode('kilat');
              container.sound.sfx('pop');
              Haptics.selectionAsync();
            }}
            style={[
              styles.modeBtn,
              dikteMode === 'kilat' && styles.modeBtnActive,
            ]}
          >
            <Text
              style={[
                styles.modeBtnText,
                dikteMode === 'kilat' && styles.modeBtnTextActive,
              ]}
            >
              ⚡ Tantangan Kilat (20s)
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Level Buttons Bar */}
      <View style={{ height: 60 }}>
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
                      `Level ${l.level} masih terkunci 🔒! Kamu harus lulus Level ${l.level - 1} dengan minimal 80% (2 ⭐) dahulu ya!`
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
                      : '#E0DDD3',
                    opacity: unlocked ? 1 : 0.65,
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
                onPress={() => setActiveLevel(activeLevel + 1)}
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

              {/* Countdown Bar in Tantangan Kilat (Opsi 3) */}
              {dikteMode === 'kilat' && (
                <View style={styles.timerContainer}>
                  <View style={styles.timerHeaderRow}>
                    <Text style={styles.timerLabel}>⚡ Waktu Kilat: {timeLeft}s</Text>
                    <Text style={styles.timerBonusBadge}>Bonus 🌟🌟</Text>
                  </View>
                  <View style={styles.timerTrack}>
                    <View
                      style={[
                        styles.timerFill,
                        {
                          width: `${(timeLeft / TIME_LIMIT_SECONDS) * 100}%`,
                          backgroundColor: timeLeft <= 5 ? '#EF4444' : '#F59E0B',
                        },
                      ]}
                    />
                  </View>
                </View>
              )}

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

          {/* OPSI 2: Balok Suku Kata / Huruf Picker */}
          {dikteMode === 'balok' ? (
            <View style={styles.syllablePickerArena}>
              <Text style={styles.pickerInstruction}>
                {currentExercise?.kind === 'letter'
                  ? 'Ketuk huruf yang kamu dengar:'
                  : 'Ketuk balok suku kata di bawah secara berurutan:'}
              </Text>
              <View style={styles.syllableGrid}>
                {syllableTiles.map((syl, i) => (
                  <Pressable
                    key={`${syl}-${i}`}
                    onPress={() => handleSyllableBlockPress(syl)}
                    style={[
                      styles.syllableTile,
                      raised('#F59E0B'),
                    ]}
                  >
                    <Text style={styles.syllableTileText}>{syl}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            /* OPSI 3: BubbleKeyboard dengan Timer Kilat */
            <View style={styles.keyboardContainer}>
              <BubbleKeyboard
                letters={currentKeyLetters}
                onPress={handleLetterPress}
                highlightLetter={mistakesThisQuestion >= 2 ? currentExercise?.target[typed.length] || null : null}
                wobbleLetter={wobbleKey.letter}
                wobbleToken={wobbleKey.token}
                width={width}
              />
            </View>
          )}
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
  levelBar: { paddingHorizontal: 16, paddingVertical: 4, gap: 8 },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    gap: 6,
    height: 48,
    minWidth: 80,
  },
  levelPillEmoji: { fontSize: 20 },
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
  timerContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  timerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  timerLabel: {
    fontFamily: fonts.black,
    fontSize: 13,
    color: '#92400E',
  },
  timerBonusBadge: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  timerTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionSection: {
    alignItems: 'center',
    gap: 8,
  },
  slotContainer: { marginVertical: 14, alignItems: 'center' },
  syllablePickerArena: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
  },
  pickerInstruction: {
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  syllableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  syllableTile: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: radius.lg,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syllableTileText: {
    fontFamily: fonts.black,
    fontSize: 26,
    color: '#78350F',
    letterSpacing: 1,
  },
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
