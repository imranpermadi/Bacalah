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
import { colors, fonts, radius, raised, spacing } from '../../../core/theme';
import { BigButton } from '../common/ui';
import { MascotCici } from '../play/MascotCici';
import { VoiceMicButton } from '../play/VoiceMicButton';
import { EDUCATIONAL_STORIES, EducationalStory } from '../../../data/content/storiesData';
import { AnimatedStoryScene } from './AnimatedStoryScene';

const { width } = Dimensions.get('window');

export function CeritaMendidikModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [selectedStory, setSelectedStory] = useState<EducationalStory | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [pageCompleted, setPageCompleted] = useState<Record<number, boolean>>({});

  // Floating breathing animation for story illustration character
  const floatAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);

  useEffect(() => {
    floatAnim.set(
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedIllustrationStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnim.get() }, { scale: scaleAnim.get() }],
  }));

  const handleOpenStory = (story: EducationalStory) => {
    setSelectedStory(story);
    setCurrentPage(0);
    setPageCompleted({});
    setIsCompleted(false);
    container.sound.sfx('pop');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePlayAudio = (text: string) => {
    setIsNarrating(true);
    scaleAnim.set(withSequence(withTiming(1.1, { duration: 200 }), withTiming(1, { duration: 200 })));
    container.sound.hear(text);
    setTimeout(() => setIsNarrating(false), 3000);
  };

  const handleNextPage = () => {
    if (!selectedStory) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentPage + 1 < selectedStory.pages.length) {
      setCurrentPage((p) => p + 1);
      container.sound.sfx('pop');
    } else {
      setIsCompleted(true);
      container.sound.sfx('chime');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentPage((p) => p - 1);
      container.sound.sfx('pop');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.root}>
        {/* Header Bar */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (selectedStory) {
                setSelectedStory(null);
              } else {
                onClose();
              }
              container.sound.sfx('boop');
            }}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>← {selectedStory ? 'Daftar Cerita' : 'Tutup'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {selectedStory ? selectedStory.title : '📖 20 Cerita Mendidik'}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Story List View */}
        {!selectedStory ? (
          <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.bannerBox}>
              <Text style={styles.bannerEmoji}>📚✨</Text>
              <Text style={styles.bannerTitle}>Koleksi 20 Cerita Bergambar</Text>
              <Text style={styles.bannerSubtitle}>
                Melatih anak membaca kalimat panjang dengan nilai kejujuran, tolong-menolong, dan persahabatan!
              </Text>
            </View>

            <View style={styles.storyGrid}>
              {EDUCATIONAL_STORIES.map((story, idx) => (
                <Pressable
                  key={story.id}
                  onPress={() => handleOpenStory(story)}
                  style={[
                    styles.storyCard,
                    { borderTopColor: story.themeColor, borderTopWidth: 6 },
                    raised(colors.line),
                  ]}
                >
                  <View style={styles.storyCardTop}>
                    <Text style={styles.storyCoverEmoji}>{story.coverEmoji}</Text>
                    <View style={styles.badgeCategory}>
                      <Text style={styles.badgeCategoryText}>{story.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.storyCardNumber}>Cerita #{idx + 1}</Text>
                  <Text style={styles.storyCardTitle} numberOfLines={2}>
                    {story.title}
                  </Text>
                  <Text style={styles.storyMoralText} numberOfLines={2}>
                    💡 {story.moral}
                  </Text>
                  <View style={styles.readNowRow}>
                    <Text style={styles.readNowText}>Baca Cerita →</Text>
                    <Text style={styles.pageCountBadge}>{story.pages.length} Halaman</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : isCompleted ? (
          /* Completion Celebration View */
          <View style={styles.completeContainer}>
            <Text style={{ fontSize: 80 }}>🏆🌟🎉</Text>
            <Text style={styles.completeTitle}>Hebat Sekali!</Text>
            <Text style={styles.completeDesc}>
              Kamu telah menyelesaikan cerita <Text style={{ fontFamily: fonts.black }}>"{selectedStory.title}"</Text>!
            </Text>
            <View style={styles.moralBox}>
              <Text style={styles.moralHeader}>💡 Pesan Budi Pekerti:</Text>
              <Text style={styles.moralContent}>{selectedStory.moral}</Text>
            </View>
            <BigButton
              label="📖 Pilih Cerita Lainnya"
              color={colors.mint}
              edge={colors.mintDark}
              onPress={() => setSelectedStory(null)}
            />
          </View>
        ) : (
          /* Story Reader View */
          <ScrollView contentContainerStyle={styles.readerContainer}>
            {/* Story Top Progress */}
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>
                Halaman {currentPage + 1} dari {selectedStory.pages.length}
              </Text>
              <View style={styles.pageDots}>
                {selectedStory.pages.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === currentPage && [styles.dotActive, { backgroundColor: selectedStory.themeColor }],
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Cartoon Anime Animated Illustration Scene */}
            <View style={styles.sceneWrapper}>
              <AnimatedStoryScene
                storyId={selectedStory.id}
                pageIndex={currentPage}
                coverEmoji={selectedStory.coverEmoji}
                illustrationEmoji={selectedStory.pages[currentPage].illustrationEmoji}
                characterMood={selectedStory.pages[currentPage].characterMood}
                themeColor={selectedStory.themeColor}
              />
              <Pressable
                onPress={() => handlePlayAudio(selectedStory.pages[currentPage].text)}
                style={[styles.listenNarratorBtn, { backgroundColor: selectedStory.themeColor }]}
              >
                <Text style={styles.listenNarratorText}>
                  {isNarrating ? '🔊 Sedang Menceritakan…' : '🔊 Dengarkan Cerita Cici'}
                </Text>
              </Pressable>
            </View>

            {/* Story Text Box (Big Readable Typography) */}
            <View style={styles.storyTextBox}>
              <Text style={styles.storyParagraph}>
                {selectedStory.pages[currentPage].text}
              </Text>
            </View>

            {/* Interactive Voice Mic Section */}
            <View style={styles.micSection}>
              <Text style={styles.micInstruction}>
                🎙️ Giliranmu membaca! Tekan mikrofon di bawah:
              </Text>
              <VoiceMicButton
                target={selectedStory.pages[currentPage].text.slice(0, 30)}
                speakText={selectedStory.pages[currentPage].text}
                onResult={(score) => {
                  if (score.stars >= 1) {
                    setPageCompleted((prev) => ({ ...prev, [currentPage]: true }));
                    container.sound.sfx('chime');
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                }}
              />
            </View>

            {/* Navigation Buttons: Locked until child reads with mic */}
            <View style={styles.navRow}>
              <Pressable
                onPress={handlePrevPage}
                disabled={currentPage === 0}
                style={[styles.navBtn, currentPage === 0 && { opacity: 0.3 }]}
              >
                <Text style={styles.navBtnText}>← Sebelumnya</Text>
              </Pressable>

              {pageCompleted[currentPage] ? (
                <Pressable
                  onPress={handleNextPage}
                  style={[
                    styles.navBtn,
                    styles.navBtnPrimary,
                    { backgroundColor: selectedStory.themeColor },
                    raised(colors.sunnyDark),
                  ]}
                >
                  <Text style={styles.navBtnTextPrimary}>
                    {currentPage + 1 === selectedStory.pages.length ? 'Selesai! 🏆' : 'Halaman Berikutnya ➡️'}
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.lockedHintBox}>
                  <Text style={styles.lockedHintText}>
                    🔒 Baca & rekam suara di atas untuk membuka halaman berikutnya!
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
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
    fontSize: 17,
    color: colors.ink,
  },
  listContainer: { padding: 16, gap: 16 },
  bannerBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: radius.xl,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
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
  storyGrid: { gap: 14 },
  storyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  storyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyCoverEmoji: { fontSize: 36 },
  badgeCategory: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  badgeCategoryText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#2563EB',
  },
  storyCardNumber: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 6,
  },
  storyCardTitle: {
    fontFamily: fonts.black,
    fontSize: 17,
    color: colors.ink,
    marginTop: 2,
  },
  storyMoralText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 4,
    fontStyle: 'italic',
  },
  readNowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  readNowText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.coral,
  },
  pageCountBadge: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.inkSoft,
  },
  readerContainer: { padding: 18, gap: 16, alignItems: 'center' },
  progressRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkSoft },
  pageDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#CBD5E1' },
  dotActive: { width: 22 },
  illustrationCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 5,
  },
  illustrationBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  bigIllustrationEmoji: { fontSize: 80 },
  ciciMiniMascot: { fontSize: 32, marginTop: -14 },
  actionAudioRow: { marginTop: 12 },
  listenNarratorBtn: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  listenNarratorText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: '#92400E',
  },
  storyTextBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.line,
  },
  storyParagraph: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.ink,
    lineHeight: 32,
    textAlign: 'left',
  },
  micSection: {
    width: '100%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: radius.lg,
    gap: 8,
  },
  micInstruction: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  sceneWrapper: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  lockedHintBox: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedHintText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
  },
  navRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  navBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: '#E2E8F0',
  },
  navBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.ink,
  },
  navBtnPrimary: {
    paddingHorizontal: 24,
  },
  navBtnTextPrimary: {
    fontFamily: fonts.black,
    fontSize: 14,
    color: '#FFFFFF',
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  completeTitle: {
    fontFamily: fonts.black,
    fontSize: 26,
    color: colors.ink,
  },
  completeDesc: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 24,
  },
  moralBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: '#FDE68A',
    width: '100%',
  },
  moralHeader: {
    fontFamily: fonts.black,
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  moralContent: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: '#78350F',
    lineHeight: 22,
  },
});
