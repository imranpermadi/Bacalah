import React, { useState } from 'react';
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
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { colors, fonts, radius, raised, spacing } from '../../../core/theme';
import { BigButton } from '../common/ui';
import { NATURE_SCIENCE_FACTS, NatureScienceFact } from '../../../data/content/natureScienceData';
import { ScienceAnimatedStage } from './ScienceAnimatedStage';

const { width } = Dimensions.get('window');

const CATEGORIES = ['Semua', 'Antariksa', 'Hewan', 'Alam & Cuaca', 'Tubuh Kita', 'Tumbuhan'];

export function PengetahuanAlamModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activeFact, setActiveFact] = useState<NatureScienceFact | null>(null);

  const filteredFacts =
    selectedCategory === 'Semua'
      ? NATURE_SCIENCE_FACTS
      : NATURE_SCIENCE_FACTS.filter((f) => f.category === selectedCategory);

  const handleOpenFact = (fact: NatureScienceFact) => {
    setActiveFact(fact);
    container.sound.sfx('pop');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSpeak = (text: string) => {
    container.sound.hear(text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.root}>
        {/* Header Bar */}
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              if (activeFact) {
                setActiveFact(null);
              } else {
                onClose();
              }
              container.sound.sfx('boop');
            }}
            style={styles.backBtn}
          >
            <Text style={styles.backBtnText}>← {activeFact ? 'Daftar Ensiklopedia' : 'Tutup'}</Text>
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {activeFact ? activeFact.title : '🌍 Ensiklopedia Sains & Alam'}
          </Text>
          <Pressable
            onPress={() => {
              setActiveFact(null);
              onClose();
              container.sound.sfx('pop');
            }}
            style={styles.homeBtn}
          >
            <Text style={styles.homeBtnText}>🏠 Beranda</Text>
          </Pressable>
        </View>

        {!activeFact ? (
          /* List View */
          <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
            {/* Banner */}
            <View style={styles.bannerBox}>
              <Text style={styles.bannerEmoji}>🌍🔭🔬</Text>
              <Text style={styles.bannerTitle}>Pengetahuan Alam Anak Pintar</Text>
              <Text style={styles.bannerSubtitle}>
                Membaca 20 fakta sains seru tentang bumi, antariksa, hewan unik, dan tubuh kita!
              </Text>
            </View>

            {/* Category Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      setSelectedCategory(cat);
                      container.sound.sfx('pop');
                      Haptics.selectionAsync();
                    }}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Facts Grid */}
            <View style={styles.grid}>
              {filteredFacts.map((fact, idx) => (
                <Pressable
                  key={fact.id}
                  onPress={() => handleOpenFact(fact)}
                  style={[
                    styles.factCard,
                    { borderTopColor: fact.accentColor, borderTopWidth: 5 },
                    raised(colors.line),
                  ]}
                >
                  <View style={styles.factCardHeader}>
                    <Text style={styles.factEmoji}>{fact.emoji}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{fact.category}</Text>
                    </View>
                  </View>
                  <Text style={styles.factTitle}>{fact.title}</Text>
                  <Text style={styles.factQuestion} numberOfLines={2}>
                    ❓ {fact.question}
                  </Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardFooterText}>Baca Selengkapnya →</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : (
          /* Fact Detail Reader View */
          <ScrollView contentContainerStyle={styles.readerContainer} showsVerticalScrollIndicator={false}>
            {/* Animated Science Stage */}
            <ScienceAnimatedStage fact={activeFact} />

            {/* Question & Short Summary Card */}
            <View style={[styles.heroCard, { borderColor: activeFact.accentColor }]}>
              <View style={styles.categoryBadgeHero}>
                <Text style={styles.categoryBadgeTextHero}>{activeFact.category}</Text>
              </View>
              <Text style={styles.heroFactTitle}>{activeFact.title}</Text>
              <View style={styles.questionBubble}>
                <Text style={styles.questionBubbleText}>❓ {activeFact.question}</Text>
              </View>
              <Text style={styles.summaryText}>{activeFact.shortSummary}</Text>
            </View>

            {/* Audio Explanation Button */}
            <Pressable
              onPress={() => handleSpeak(activeFact.speakText)}
              style={[styles.listenFactBtn, { backgroundColor: activeFact.accentColor }]}
            >
              <Text style={styles.listenFactText}>🔊 Dengarkan Penjelasan Cici</Text>
            </Pressable>

            {/* Fun Fact Card (Tahukah Kamu?) */}
            <View style={styles.funFactBox}>
              <Text style={styles.funFactTitle}>💡 Tahukah Kamu?</Text>
              <Text style={styles.funFactContent}>{activeFact.funFact}</Text>
            </View>

            {/* Bite-sized Key Knowledge Cards */}
            <View style={styles.detailBox}>
              <Text style={styles.detailHeader}>🔍 Rangkuman Sains Anak Pintar:</Text>
              {activeFact.detailParagraphs.map((para, i) => (
                <View key={i} style={styles.pointRow}>
                  <Text style={styles.pointBullet}>✨</Text>
                  <Text style={styles.paragraphText}>{para}</Text>
                </View>
              ))}
            </View>

            <View style={{ gap: 10, width: '100%', marginTop: 8 }}>
              <BigButton
                label="← Kembali ke Daftar Sains"
                color={colors.mint}
                edge={colors.mintDark}
                onPress={() => setActiveFact(null)}
              />
              <BigButton
                label="🏠 Kembali ke Beranda"
                color={colors.sky}
                edge={colors.skyDark}
                onPress={() => {
                  setActiveFact(null);
                  onClose();
                }}
              />
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
  backBtnText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
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
    backgroundColor: '#ECFDF5',
    borderRadius: radius.xl,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A7F3D0',
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
  chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  chipSelected: {
    backgroundColor: colors.coral,
    borderColor: colors.coralDark,
  },
  chipText: { fontFamily: fonts.bold, fontSize: 13, color: colors.inkSoft },
  chipTextSelected: { color: '#FFFFFF' },
  grid: { gap: 12 },
  factCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  factCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factEmoji: { fontSize: 36 },
  categoryBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  categoryBadgeText: { fontFamily: fonts.bold, fontSize: 11, color: colors.inkSoft },
  factTitle: {
    fontFamily: fonts.black,
    fontSize: 17,
    color: colors.ink,
    marginTop: 6,
  },
  factQuestion: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 4,
    lineHeight: 18,
  },
  cardFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  cardFooterText: { fontFamily: fonts.bold, fontSize: 12, color: colors.coral },
  readerContainer: { padding: 18, gap: 16 },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderBottomWidth: 5,
  },
  bigHeroEmoji: { fontSize: 72 },
  categoryBadgeHero: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: 4,
  },
  categoryBadgeTextHero: { fontFamily: fonts.bold, fontSize: 12, color: colors.inkSoft },
  heroFactTitle: {
    fontFamily: fonts.black,
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 8,
  },
  questionBubble: {
    backgroundColor: '#FFFBEB',
    borderRadius: radius.md,
    padding: 12,
    marginTop: 10,
    width: '100%',
  },
  questionBubbleText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 16,
    borderLeftWidth: 5,
    borderLeftColor: colors.coral,
    borderWidth: 1,
    borderColor: colors.line,
  },
  summaryHeader: { fontFamily: fonts.black, fontSize: 14, color: colors.coral, marginBottom: 4 },
  summaryText: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink, lineHeight: 24 },
  listenFactBtn: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  listenFactText: { fontFamily: fonts.bold, fontSize: 14, color: '#FFFFFF' },
  detailBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 12,
  },
  detailHeader: { fontFamily: fonts.black, fontSize: 16, color: colors.ink },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pointBullet: {
    fontSize: 16,
    marginTop: 2,
  },
  paragraphText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
    lineHeight: 24,
    textAlign: 'left',
  },
  funFactBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  funFactTitle: { fontFamily: fonts.black, fontSize: 14, color: '#C2410C', marginBottom: 4 },
  funFactContent: { fontFamily: fonts.bold, fontSize: 15, color: '#9A3412', lineHeight: 22 },
});

