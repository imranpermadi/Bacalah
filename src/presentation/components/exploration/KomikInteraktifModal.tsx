import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { colors, fonts, radius, raised } from '../../../core/theme';
import { BigButton } from '../common/ui';
import { VoiceMicButton } from '../play/VoiceMicButton';
import { INTERACTIVE_COMICS, InteractiveComic } from '../../../data/content/comicsData';

const { width } = Dimensions.get('window');

/**
 * 🎨 KomikInteraktifModal
 * Format Komik Asli:
 * - Balon dialog terletak TEPAT DI ATAS kepala karakter (dengan ekor segitiga percakapan komik).
 * - Karakter A dan Karakter B berhadapan dalam panel komik dan memiliki animasi bergerak hidup (bobbing/breathing).
 * - TIDAK ADA tombol pintasan/curang: Balasan Karakter B HANYA bisa terbuka jika anak merekam suara membaca dialog Karakter A dengan benar.
 * - Saat benar: Karakter B melompat gembira, balon balasan membesar (pop-in), dan suaranya otomatis berbunyi!
 */
export function KomikInteraktifModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [selectedComic, setSelectedComic] = useState<InteractiveComic | null>(null);
  const [panelIndex, setPanelIndex] = useState(0);
  const [replyRevealed, setReplyRevealed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Reanimated values for live animated comic characters
  const charAY = useSharedValue(0);
  const charBY = useSharedValue(0);
  const charBScale = useSharedValue(1);

  // Reanimated values for reply speech bubble pop-in
  const replyBubbleScale = useSharedValue(0.7);
  const replyBubbleOpacity = useSharedValue(0);

  useEffect(() => {
    // Idle breathing/bobbing for Character A
    charAY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 700 }),
        withTiming(0, { duration: 700 })
      ),
      -1,
      true
    );

    // Idle breathing/bobbing for Character B
    charBY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 750 }),
        withTiming(0, { duration: 750 })
      ),
      -1,
      true
    );
  }, []);

  const handleOpenComic = (comic: InteractiveComic) => {
    setSelectedComic(comic);
    setPanelIndex(0);
    setReplyRevealed(false);
    setIsCompleted(false);
    replyBubbleScale.set(0.7);
    replyBubbleOpacity.set(0);
    container.sound.sfx('pop');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const currentPanel = selectedComic?.panels[panelIndex];

  // Callback saat anak berhasil membaca dialog Karakter A via rekaman mic
  const handleVoiceSuccess = () => {
    if (replyRevealed || !currentPanel) return;

    setReplyRevealed(true);

    // Karakter B melompat gembira
    charBY.value = withSequence(
      withTiming(-20, { duration: 180 }),
      withSpring(0, { dampingRatio: 0.6 })
    );
    charBScale.value = withSequence(
      withTiming(1.2, { duration: 180 }),
      withSpring(1, { dampingRatio: 0.6 })
    );

    // Balon percakapan Karakter B membesar dengan pop spring
    replyBubbleScale.set(withSpring(1, { dampingRatio: 0.65 }));
    replyBubbleOpacity.set(withTiming(1, { duration: 200 }));

    container.sound.sfx('chime');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Suara Cici otomatis membacakan balasan dari Karakter B
    setTimeout(() => {
      container.sound.hear(currentPanel.replyText);
    }, 350);
  };

  const handleNextPanel = () => {
    if (!selectedComic) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (panelIndex + 1 < selectedComic.panels.length) {
      setPanelIndex((p) => p + 1);
      setReplyRevealed(false);
      replyBubbleScale.set(0.7);
      replyBubbleOpacity.set(0);
      container.sound.sfx('pop');
    } else {
      setIsCompleted(true);
      container.sound.sfx('chime');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const animatedCharAStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: charAY.value }],
  }));

  const animatedCharBStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: charBY.value },
      { scale: charBScale.value },
    ],
  }));

  const animatedReplyBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: replyBubbleScale.value }],
    opacity: replyBubbleOpacity.value,
  }));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (selectedComic) {
                setSelectedComic(null);
              } else {
                onClose();
              }
              container.sound.sfx('boop');
            }}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>← {selectedComic ? 'Pilih Komik' : 'Tutup'}</Text>
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {selectedComic ? selectedComic.title : '💬 20 Komik Suara Interaktif'}
          </Text>
          <Pressable
            onPress={() => {
              setSelectedComic(null);
              onClose();
              container.sound.sfx('pop');
            }}
            style={styles.homeBtn}
          >
            <Text style={styles.homeBtnText}>🏠 Beranda</Text>
          </Pressable>
        </View>

        {!selectedComic ? (
          /* Comic Selection List */
          <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.bannerBox}>
              <Text style={styles.bannerEmoji}>🎙️💬✨</Text>
              <Text style={styles.bannerTitle}>20 Komik Percakapan Suara</Text>
              <Text style={styles.bannerSubtitle}>
                Format komik kartun asli! Baca balon percakapan di atas karakter dengan mikrofon. Jika benar, lawan bicara akan merespons dengan animasi dan suara!
              </Text>
            </View>

            <View style={styles.comicGrid}>
              {INTERACTIVE_COMICS.map((comic) => (
                <Pressable
                  key={comic.id}
                  onPress={() => handleOpenComic(comic)}
                  style={[
                    styles.comicCard,
                    { borderLeftColor: comic.accentColor, borderLeftWidth: 6 },
                    raised(colors.line),
                  ]}
                >
                  <View style={styles.comicCardLeft}>
                    <Text style={styles.comicEmoji}>{comic.coverEmoji}</Text>
                  </View>
                  <View style={styles.comicCardRight}>
                    <Text style={styles.comicBadge}>{comic.theme}</Text>
                    <Text style={styles.comicTitleText}>{comic.title}</Text>
                    <Text style={styles.comicPanelCount}>
                      📖 {comic.panels.length} Percakapan Dialog
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : isCompleted ? (
          /* Completion Screen */
          <View style={styles.completeContainer}>
            <Text style={{ fontSize: 72 }}>🌟🎉🏆</Text>
            <Text style={styles.completeTitle}>Hore! Kamu Selesai Membaca Komik!</Text>
            <Text style={styles.completeDesc}>
              Hebat sekali! Kamu sudah melatih membaca percakapan dua arah dengan lafal yang jelas dan percaya diri!
            </Text>
            <View style={{ gap: 10, width: '100%', marginTop: 8 }}>
              <BigButton
                label="📚 Baca Komik Lainnya"
                color={selectedComic.accentColor}
                edge={colors.coralDark}
                onPress={() => {
                  setSelectedComic(null);
                  container.sound.sfx('pop');
                }}
              />
              <BigButton
                label="🏠 Kembali ke Beranda"
                color={colors.sky}
                edge={colors.skyDark}
                onPress={() => {
                  setSelectedComic(null);
                  onClose();
                }}
              />
            </View>
          </View>
        ) : currentPanel ? (
          /* True Comic Panel Reading Canvas */
          <ScrollView contentContainerStyle={styles.comicReaderContainer} showsVerticalScrollIndicator={false}>
            {/* Panel Scene Meta Banner */}
            <View style={styles.sceneMetaRow}>
              <View style={styles.sceneBadge}>
                <Text style={styles.sceneBadgeText}>
                  📍 {currentPanel.setting} • Panel {panelIndex + 1} dari {selectedComic.panels.length}
                </Text>
              </View>
              <Pressable
                onPress={() => container.sound.hear(currentPanel.promptText)}
                style={styles.listenHintBtn}
              >
                <Text style={styles.listenHintText}>🔊 Dengar Contoh</Text>
              </Pressable>
            </View>

            {/* Authentic Comic Strip Stage */}
            <View style={styles.comicStripFrame}>
              {/* TOP DIALOGUE ROW: Speech Bubbles ABOVE Characters */}
              <View style={styles.dialogueRow}>
                {/* Bubble A (Above Character A) */}
                <View style={styles.bubbleColA}>
                  <View style={[styles.comicSpeechBubble, styles.bubbleAActive, replyRevealed && styles.bubbleASolved]}>
                    <Text style={styles.bubbleSpeakerLabel}>
                      {replyRevealed ? '✅ Selesai Dibaca' : `🎙️ ${currentPanel.characterA.name}`}
                    </Text>
                    <Text style={styles.bubbleText}>
                      "{currentPanel.promptText}"
                    </Text>
                  </View>
                  {/* Bubble Pointer Tail pointing to Character A */}
                  <View style={styles.tailA} />
                </View>

                {/* Bubble B (Above Character B) */}
                <View style={styles.bubbleColB}>
                  {replyRevealed ? (
                    <Animated.View style={[styles.comicSpeechBubble, styles.bubbleBActive, animatedReplyBubbleStyle]}>
                      <Text style={[styles.bubbleSpeakerLabel, { color: currentPanel.characterB.color }]}>
                        💬 {currentPanel.characterB.name}
                      </Text>
                      <Text style={styles.bubbleText}>
                        "{currentPanel.replyText}"
                      </Text>
                    </Animated.View>
                  ) : (
                    /* Locked Mystery Bubble */
                    <View style={[styles.comicSpeechBubble, styles.bubbleBLocked]}>
                      <Text style={{ fontSize: 20 }}>🔒❓</Text>
                      <Text style={styles.bubbleBLockedText}>
                        Menunggu balasan {currentPanel.characterB.name}...
                      </Text>
                    </View>
                  )}
                  {/* Bubble Pointer Tail pointing to Character B */}
                  <View style={[styles.tailB, !replyRevealed && { borderTopColor: '#E2E8F0' }]} />
                </View>
              </View>

              {/* BOTTOM CHARACTERS ROW: Animated Characters Facing Each Other */}
              <View style={styles.charactersRow}>
                {/* Character A (Left, Speaker) */}
                <Animated.View style={[styles.characterStageA, animatedCharAStyle]}>
                  <Text style={styles.characterAvatar}>{currentPanel.characterA.avatar}</Text>
                  <View style={[styles.charNameBadge, { backgroundColor: currentPanel.characterA.color }]}>
                    <Text style={styles.charNameBadgeText}>{currentPanel.characterA.name}</Text>
                  </View>
                  <View style={styles.charShadow} />
                </Animated.View>

                <View style={styles.vsDivider}>
                  <Text style={styles.vsText}>💬</Text>
                </View>

                {/* Character B (Right, Listener / Respondent) */}
                <Animated.View style={[styles.characterStageB, animatedCharBStyle]}>
                  <Text style={styles.characterAvatar}>{currentPanel.characterB.avatar}</Text>
                  <View style={[styles.charNameBadge, { backgroundColor: currentPanel.characterB.color }]}>
                    <Text style={styles.charNameBadgeText}>{currentPanel.characterB.name}</Text>
                  </View>
                  <View style={styles.charShadow} />
                </Animated.View>
              </View>
            </View>

            {/* Child Interactive Voice Recording Section */}
            {!replyRevealed ? (
              <View style={styles.voiceStation}>
                <Text style={styles.voiceStationTitle}>
                  🎙️ Baca dialog {currentPanel.characterA.name} di atas ke mikrofon:
                </Text>
                <Text style={styles.voiceStationSub}>
                  (Balasan {currentPanel.characterB.name} akan terbuka otomatis jika kamu membaca dengan benar!)
                </Text>
                <VoiceMicButton
                  target={currentPanel.promptText.slice(0, 30)}
                  speakText={currentPanel.promptText}
                  onResult={(res) => {
                    if (res.stars >= 1) {
                      handleVoiceSuccess();
                    }
                  }}
                />
              </View>
            ) : (
              /* Success / Next Action */
              <View style={styles.unlockedStation}>
                <Text style={styles.unlockedCongratsText}>
                  ✨ Hore! {currentPanel.characterB.name} sudah menjawabmu!
                </Text>
                <BigButton
                  label={
                    panelIndex + 1 === selectedComic.panels.length
                      ? '🎉 Selesai Membaca Komik Ini!'
                      : 'Lanjut ke Percakapan Berikutnya ➡️'
                  }
                  color={selectedComic.accentColor}
                  edge={colors.coralDark}
                  onPress={handleNextPanel}
                />
              </View>
            )}
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: '#F1F5F9',
  },
  backBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.ink,
  },
  headerTitle: {
    fontFamily: fonts.black,
    fontSize: 16,
    color: colors.ink,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  homeBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  homeBtnText: {
    fontFamily: fonts.black,
    fontSize: 12,
    color: colors.ink,
  },
  listContainer: { padding: 16, gap: 14 },
  bannerBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: radius.xl,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },
  bannerEmoji: { fontSize: 44, marginBottom: 4 },
  bannerTitle: { fontFamily: fonts.black, fontSize: 18, color: colors.ink, textAlign: 'center' },
  bannerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  comicGrid: { gap: 12, marginTop: 4 },
  comicCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  comicCardLeft: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comicEmoji: { fontSize: 32 },
  comicCardRight: { flex: 1, gap: 2 },
  comicBadge: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.coral,
    textTransform: 'uppercase',
  },
  comicTitleText: { fontFamily: fonts.black, fontSize: 15, color: colors.ink },
  comicPanelCount: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  completeTitle: {
    fontFamily: fonts.black,
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
  },
  completeDesc: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 22,
  },
  comicReaderContainer: {
    padding: 16,
    gap: 14,
  },
  sceneMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sceneBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sceneBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.ink,
  },
  listenHintBtn: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  listenHintText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#92400E',
  },
  comicStripFrame: {
    backgroundColor: '#FFFDF5',
    borderRadius: radius.xl,
    padding: 14,
    borderWidth: 3,
    borderColor: '#0F172A',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  dialogueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    minHeight: 120,
  },
  bubbleColA: {
    flex: 1,
    alignItems: 'center',
  },
  bubbleColB: {
    flex: 1,
    alignItems: 'center',
  },
  comicSpeechBubble: {
    width: '100%',
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 2,
    borderColor: '#0F172A',
    minHeight: 88,
    justifyContent: 'center',
  },
  bubbleAActive: {
    backgroundColor: '#FEF08A',
  },
  bubbleASolved: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  bubbleBActive: {
    backgroundColor: '#FCE7F3',
    borderColor: '#DB2777',
  },
  bubbleBLocked: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  bubbleBLockedText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  bubbleSpeakerLabel: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#854D0E',
    marginBottom: 4,
  },
  bubbleText: {
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
  },
  tailA: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0F172A',
    alignSelf: 'center',
    marginTop: -2,
  },
  tailB: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0F172A',
    alignSelf: 'center',
    marginTop: -2,
  },
  charactersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingTop: 8,
    paddingBottom: 6,
  },
  characterStageA: {
    alignItems: 'center',
  },
  characterStageB: {
    alignItems: 'center',
  },
  characterAvatar: {
    fontSize: 58,
  },
  charNameBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  charNameBadgeText: {
    fontFamily: fonts.black,
    fontSize: 10,
    color: '#FFFFFF',
  },
  charShadow: {
    width: 44,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginTop: 2,
  },
  vsDivider: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  vsText: {
    fontSize: 22,
    opacity: 0.5,
  },
  voiceStation: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  voiceStationTitle: {
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.ink,
    textAlign: 'center',
  },
  voiceStationSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.inkSoft,
    textAlign: 'center',
    marginBottom: 4,
  },
  unlockedStation: {
    backgroundColor: '#ECFDF5',
    borderRadius: radius.xl,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6EE7B7',
    gap: 10,
  },
  unlockedCongratsText: {
    fontFamily: fonts.black,
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
  },
});
