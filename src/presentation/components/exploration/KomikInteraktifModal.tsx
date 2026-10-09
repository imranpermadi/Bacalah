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
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { colors, fonts, radius, raised, spacing } from '../../../core/theme';
import { BigButton } from '../common/ui';
import { VoiceMicButton } from '../play/VoiceMicButton';
import { INTERACTIVE_COMICS, InteractiveComic } from '../../../data/content/comicsData';

const { width } = Dimensions.get('window');

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

  // Animation shared values for reply bubble pop-up
  const replyScale = useSharedValue(0.85);
  const replyOpacity = useSharedValue(0);

  const animatedReplyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: replyScale.get() }],
    opacity: replyOpacity.get(),
  }));

  const handleOpenComic = (comic: InteractiveComic) => {
    setSelectedComic(comic);
    setPanelIndex(0);
    setReplyRevealed(false);
    setIsCompleted(false);
    replyScale.set(0.85);
    replyOpacity.set(0);
    container.sound.sfx('pop');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const currentPanel = selectedComic?.panels[panelIndex];

  const handleRevealReply = () => {
    if (replyRevealed || !currentPanel) return;
    setReplyRevealed(true);
    replyScale.set(withSpring(1, { dampingRatio: 0.7 }));
    replyOpacity.set(withTiming(1, { duration: 250 }));
    container.sound.sfx('chime');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Pronounce the reply text from Character B
    setTimeout(() => {
      container.sound.hear(currentPanel.replyText);
    }, 300);
  };

  const handleNextPanel = () => {
    if (!selectedComic) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (panelIndex + 1 < selectedComic.panels.length) {
      setPanelIndex((p) => p + 1);
      setReplyRevealed(false);
      replyScale.set(0.85);
      replyOpacity.set(0);
      container.sound.sfx('pop');
    } else {
      setIsCompleted(true);
      container.sound.sfx('chime');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

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
          <Text style={styles.headerTitle}>
            {selectedComic ? selectedComic.title : '💬 20 Komik Suara Interaktif'}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {!selectedComic ? (
          /* Comic Selection List */
          <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.bannerBox}>
              <Text style={styles.bannerEmoji}>🎙️💬✨</Text>
              <Text style={styles.bannerTitle}>20 Komik Percakapan Suara</Text>
              <Text style={styles.bannerSubtitle}>
                Baca balon dialog Karakter A dengan mikrofon. Jika benar, balon balasan Karakter B akan terbuka dengan animasi dan suara!
              </Text>
            </View>

            <View style={styles.comicGrid}>
              {INTERACTIVE_COMICS.map((comic, idx) => (
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
                  <View style={{ flex: 1 }}>
                    <View style={styles.comicTagRow}>
                      <Text style={styles.comicIdx}>Komik #{idx + 1}</Text>
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>{comic.theme}</Text>
                      </View>
                    </View>
                    <Text style={styles.comicTitle}>{comic.title}</Text>
                    <Text style={styles.comicPanelCount}>
                      {comic.panels.length} Percakapan Bersuara • Ketuk untuk Mulai →
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : isCompleted ? (
          /* Completed View */
          <View style={styles.completeContainer}>
            <Text style={{ fontSize: 76 }}>🎉✨🐰🐱</Text>
            <Text style={styles.completeTitle}>Komik Selesai Dibaca!</Text>
            <Text style={styles.completeSubtitle}>
              Kamu hebat sekali sudah melatih membaca percakapan dalam komik "{selectedComic.title}" dengan lancar!
            </Text>
            <BigButton
              label="💬 Pilih Komik Lainnya"
              color={colors.sunny}
              edge={colors.sunnyDark}
              onPress={() => setSelectedComic(null)}
            />
          </View>
        ) : currentPanel ? (
          /* Comic Reader Panel View */
          <ScrollView contentContainerStyle={styles.readerContainer}>
            {/* Setting and Panel Indicator */}
            <View style={styles.panelBadgeRow}>
              <Text style={styles.settingText}>📍 {currentPanel.setting}</Text>
              <Text style={styles.panelCounter}>
                Panel {panelIndex + 1} / {selectedComic.panels.length}
              </Text>
            </View>

            {/* Bubble 1: Character A (Prompt to be read by child) */}
            <View style={styles.dialogCardA}>
              <View style={styles.charHeader}>
                <Text style={styles.avatarEmoji}>{currentPanel.characterA.avatar}</Text>
                <View>
                  <Text style={[styles.charName, { color: currentPanel.characterA.color }]}>
                    {currentPanel.characterA.name}
                  </Text>
                  <Text style={styles.readPromptHint}>🎙️ Giliranmu membaca teks di bawah:</Text>
                </View>
              </View>
              <View style={styles.speechBubbleA}>
                <Text style={styles.speechTextA}>"{currentPanel.promptText}"</Text>
              </View>

              {/* Action row to speak or mark as read */}
              <View style={styles.promptActionRow}>
                <Pressable
                  onPress={() => container.sound.hear(currentPanel.promptText)}
                  style={styles.listenCiciBtn}
                >
                  <Text style={styles.listenCiciText}>🔊 Dengar Contoh</Text>
                </Pressable>
                <Pressable
                  onPress={handleRevealReply}
                  style={[styles.confirmReadBtn, replyRevealed && { backgroundColor: '#10B981' }]}
                >
                  <Text style={styles.confirmReadText}>
                    {replyRevealed ? '✅ Sudah Terbuka' : '🎙️ Buka Balasan Lawan Bicara!'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Mic Button for Real Voice Reading */}
            {!replyRevealed && (
              <View style={styles.micBox}>
                <Text style={styles.micNotice}>Ucapkan kalimat di atas ke mikrofon:</Text>
                <VoiceMicButton
                  target={currentPanel.promptText.slice(0, 25)}
                  onResult={(sc) => {
                    if (sc.stars >= 2) handleRevealReply();
                  }}
                />
              </View>
            )}

            {/* Bubble 2: Character B (Hidden until child reads Bubble 1) */}
            {replyRevealed ? (
              <Animated.View style={[styles.dialogCardB, animatedReplyStyle]}>
                <View style={[styles.charHeader, { justifyContent: 'flex-end' }]}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.charName, { color: currentPanel.characterB.color }]}>
                      {currentPanel.characterB.name}
                    </Text>
                    <Text style={styles.readPromptHint}>✨ Menjawab kamu:</Text>
                  </View>
                  <Text style={styles.avatarEmoji}>{currentPanel.characterB.avatar}</Text>
                </View>
                <View style={styles.speechBubbleB}>
                  <Text style={styles.speechTextB}>"{currentPanel.replyText}"</Text>
                </View>
                <Pressable
                  onPress={() => container.sound.hear(currentPanel.replyText)}
                  style={[styles.listenCiciBtn, { alignSelf: 'flex-end', marginTop: 8 }]}
                >
                  <Text style={styles.listenCiciText}>🔊 Ulangi Suara Balasan</Text>
                </Pressable>
              </Animated.View>
            ) : (
              /* Mystery Locked Bubble Placeholder (Cliffhanger) */
              <View style={styles.lockedReplyBox}>
                <Text style={{ fontSize: 36 }}>🔒💬</Text>
                <Text style={styles.lockedReplyTitle}>
                  Balasan {currentPanel.characterB.name} Masih Terkunci!
                </Text>
                <Text style={styles.lockedReplyDesc}>
                  Baca kalimat {currentPanel.characterA.name} di atas untuk mendengar apa kata {currentPanel.characterB.name}!
                </Text>
              </View>
            )}

            {/* Next Panel Button */}
            {replyRevealed && (
              <View style={{ width: '100%', marginTop: 12 }}>
                <BigButton
                  label={
                    panelIndex + 1 === selectedComic.panels.length
                      ? '🎉 Selesai Membaca Komik Ini!'
                      : 'Lanjut ke Percakapan Berikutnya →'
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
  backBtnText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  headerTitle: { fontFamily: fonts.black, fontSize: 16, color: colors.ink },
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
  comicGrid: { gap: 12 },
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
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comicEmoji: { fontSize: 32 },
  comicTagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  comicIdx: { fontFamily: fonts.bold, fontSize: 11, color: colors.inkSoft },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  tagText: { fontFamily: fonts.bold, fontSize: 11, color: colors.inkSoft },
  comicTitle: { fontFamily: fonts.black, fontSize: 16, color: colors.ink, marginTop: 2 },
  comicPanelCount: { fontFamily: fonts.bold, fontSize: 12, color: colors.coral, marginTop: 4 },
  readerContainer: { padding: 18, gap: 16, alignItems: 'center' },
  panelBadgeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkSoft },
  panelCounter: {
    fontFamily: fonts.black,
    fontSize: 12,
    color: '#2563EB',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  dialogCardA: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FED7AA',
    borderBottomWidth: 5,
  },
  charHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarEmoji: { fontSize: 36 },
  charName: { fontFamily: fonts.black, fontSize: 15 },
  readPromptHint: { fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft },
  speechBubbleA: {
    backgroundColor: '#FFF7ED',
    borderRadius: radius.lg,
    padding: 16,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FB923C',
  },
  speechTextA: {
    fontFamily: fonts.black,
    fontSize: 20,
    color: colors.ink,
    lineHeight: 30,
  },
  promptActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  listenCiciBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  listenCiciText: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkSoft },
  confirmReadBtn: {
    backgroundColor: colors.coral,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  confirmReadText: { fontFamily: fonts.bold, fontSize: 12, color: '#FFFFFF' },
  micBox: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  micNotice: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkSoft },
  dialogCardB: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 2,
    borderColor: '#BBF7D0',
    borderBottomWidth: 5,
  },
  speechBubbleB: {
    backgroundColor: '#F0FDF4',
    borderRadius: radius.lg,
    padding: 16,
    marginTop: 10,
    borderRightWidth: 4,
    borderRightColor: '#22C55E',
  },
  speechTextB: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.ink,
    lineHeight: 28,
  },
  lockedReplyBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.xl,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    gap: 6,
  },
  lockedReplyTitle: {
    fontFamily: fonts.black,
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  lockedReplyDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 18,
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  completeTitle: { fontFamily: fonts.black, fontSize: 24, color: colors.ink },
  completeSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 22,
  },
});
