import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { container } from '../../../core/di/container';
import { colors, fonts, radius, raised, spacing } from '../../../core/theme';
import { ALPHABET, letterInfo } from '../../../data/content/alphabet';
import { LetterAccuracyStats } from '../../../domain/entities/LetterAccuracyStats';
import {
  accuracyOf,
  AlphabetMasteryEngine,
} from '../../../domain/services/AlphabetMasteryEngine';
import { BigButton, ScreenTitle, Stars } from '../../components/common/ui';
import { MascotCici } from '../../components/play/MascotCici';
import { useAppStore } from '../../stores/useAppStore';

const { width } = Dimensions.get('window');

export function ProfilScreen() {
  const profile = useAppStore((s) => s.profile);
  const stats = useAppStore((s) => s.stats);
  const voice = useAppStore((s) => s.voice);
  const setMode = useAppStore((s) => s.setMode);
  const reset = useAppStore((s) => s.reset);

  const [selectedStat, setSelectedStat] = useState<LetterAccuracyStats | null>(null);

  const weakestList = AlphabetMasteryEngine.weakest(stats, 5);

  const getStatusColor = (s?: LetterAccuracyStats) => {
    const mastery = AlphabetMasteryEngine.mastery(s);
    if (mastery === 'hebat') return { bg: colors.mint, border: colors.mintDark, label: 'Hebat 🌟' };
    if (mastery === 'hampir') return { bg: colors.sky, border: colors.skyDark, label: 'Hampir 👍' };
    if (mastery === 'belajar') return { bg: colors.sunny, border: colors.sunnyDark, label: 'Belajar 📖' };
    return { bg: '#EAE6D6', border: '#D0C9B2', label: 'Baru ✨' };
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Progres Belajar',
      'Apakah kamu yakin ingin mengulang seluruh data skor huruf, bintang, dan level kembali dari awal?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Reset',
          style: 'destructive',
          onPress: async () => {
            await reset();
            container.sound.sfx('chime');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenTitle sub="Rapor Penguasaan 26 Huruf A-Z & Prestasi Belajar">
        Profil & Rapor Alfabet 👤
      </ScreenTitle>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Child Profile Card */}
        <View style={styles.profileHeader}>
          <Text style={styles.avatar}>🐱</Text>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{profile.name}</Text>
            <View style={styles.starRow}>
              <Text style={{ fontSize: 24 }}>⭐</Text>
              <Text style={styles.starCount}>{profile.stars} Bintang</Text>
            </View>
            <Text style={styles.modeBadge}>
              Mode: {profile.mode === 'pemula' ? '🐣 Pemula (4 Pilihan)' : '🦁 Mandiri (A–Z Lengkap)'}
            </Text>
          </View>
        </View>

        {/* Mascot Cici Encouragement */}
        <View style={{ marginVertical: 4 }}>
          <MascotCici
            mood="talk"
            message={`Hai ${profile.name}! Cici terus memantau huruf yang kamu kuasai. Semangat selalu ya! 😸`}
            size={68}
          />
        </View>

        {/* Priority Focus Section: Weak Letters (Universal Dynamic Tracking) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🎯 Prioritas Latihan Cici</Text>
          <Text style={styles.sectionSubtitle}>
            Huruf dengan tingkat kesalahan tertinggi akan otomatis lebih sering diujikan oleh Cici.
          </Text>

          {weakestList.length === 0 ? (
            <View style={styles.emptyWeakBox}>
              <Text style={styles.emptyWeakText}>
                🎉 Hebat sekali! Belum ada huruf yang sering salah. Terus pertahankan ya!
              </Text>
            </View>
          ) : (
            <View style={styles.weakList}>
              {weakestList.map((item) => {
                const acc = Math.round(((item.correct / item.attempts) || 0) * 100);
                const info = letterInfo(item.letter);
                return (
                  <View key={item.letter} style={styles.weakItem}>
                    <Pressable
                      onPress={() => container.sound.hear(info.speak)}
                      style={[
                        styles.weakLetterBubble,
                        raised(colors.coralDark),
                        { backgroundColor: colors.coral },
                      ]}
                    >
                      <Text style={styles.weakLetterText}>{item.letter}</Text>
                    </Pressable>
                    <View style={styles.weakDetails}>
                      <Text style={styles.weakWord}>
                        {info.emoji} {item.letter} = {info.word}
                      </Text>
                      <Text style={styles.weakStats}>
                        Akurasi: {acc}% ({item.correct} benar / {item.wrong} keliru)
                      </Text>
                    </View>
                    <BigButton
                      label="🔊 Bunyi"
                      small
                      color={colors.sunny}
                      edge={colors.sunnyDark}
                      onPress={() => container.sound.hear(info.speak)}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 26 Letters Alphabet Map (A through Z) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🔤 Peta Penguasaan 26 Huruf (A–Z)</Text>
          <Text style={styles.sectionSubtitle}>
            Ketuk salah satu huruf untuk melihat catatan akurasi dan mendengarkan bunyinya!
          </Text>

          <View style={styles.letterGrid}>
            {ALPHABET.map((alpha) => {
              const stat = stats.find((s) => s.letter === alpha.letter);
              const colorInfo = getStatusColor(stat);
              return (
                <Pressable
                  key={alpha.letter}
                  onPress={() => {
                    setSelectedStat(stat || {
                      letter: alpha.letter,
                      correct: 0,
                      wrong: 0,
                      attempts: 0,
                      streak: 0,
                      lastSeen: null,
                    });
                    container.sound.hear(alpha.speak);
                  }}
                  style={[
                    styles.gridLetterCell,
                    raised(colorInfo.border),
                    { backgroundColor: colorInfo.bg },
                  ]}
                >
                  <Text style={styles.gridLetterText}>{alpha.letter}</Text>
                  <Text style={{ fontSize: 10 }}>{alpha.emoji}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.mint }]} />
              <Text style={styles.legendLabel}>Hebat</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.sky }]} />
              <Text style={styles.legendLabel}>Hampir</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.sunny }]} />
              <Text style={styles.legendLabel}>Belajar</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EAE6D6' }]} />
              <Text style={styles.legendLabel}>Baru</Text>
            </View>
          </View>
        </View>

        {/* Voice Challenge Activity */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🎤 Aktivitas Evaluasi Suara</Text>
          <Text style={styles.sectionSubtitle}>
            Catatan latihan menirukan ucapan Cici lewat mikrofon.
          </Text>
          <View style={styles.voiceStatsRow}>
            <View style={styles.voiceStatBox}>
              <Text style={styles.voiceStatNum}>{voice.attempts}</Text>
              <Text style={styles.voiceStatLabel}>Kali Bicara</Text>
            </View>
            <View style={styles.voiceStatBox}>
              <Text style={styles.voiceStatNum}>
                {voice.avgStars ? voice.avgStars.toFixed(1) : '0'} ⭐
              </Text>
              <Text style={styles.voiceStatLabel}>Rata-Rata Bintang</Text>
            </View>
          </View>
        </View>

        {/* Settings & Reset */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⚙️ Pengaturan Pembelajaran</Text>
          <View style={{ gap: 10, marginTop: 8 }}>
            <BigButton
              label={
                profile.mode === 'pemula'
                  ? 'Ganti ke Mode Mandiri (26 Huruf) 🦁'
                  : 'Ganti ke Mode Pemula (4 Huruf) 🐣'
              }
              color={colors.peach}
              edge={colors.peachDark}
              onPress={() =>
                setMode(profile.mode === 'pemula' ? 'mandiri' : 'pemula')
              }
            />
            <BigButton
              label="🗑️ Reset Seluruh Data & Bintang"
              color="#FFF0F0"
              edge="#FFAAAA"
              textColor="#D93838"
              onPress={handleReset}
            />
          </View>
        </View>
      </ScrollView>

      {/* Letter Detail Modal */}
      {selectedStat && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedStat(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalLetter}>{selectedStat.letter}</Text>
              <Text style={styles.modalWord}>
                {letterInfo(selectedStat.letter).emoji}{' '}
                {letterInfo(selectedStat.letter).word}
              </Text>

              <View style={styles.modalStatGrid}>
                <View style={styles.modalStatItem}>
                  <Text style={styles.modalStatValue}>{selectedStat.attempts}</Text>
                  <Text style={styles.modalStatKey}>Dicoba</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Text style={[styles.modalStatValue, { color: colors.mintDark }]}>
                    {selectedStat.correct}
                  </Text>
                  <Text style={styles.modalStatKey}>Benar</Text>
                </View>
                <View style={styles.modalStatItem}>
                  <Text style={[styles.modalStatValue, { color: colors.coralDark }]}>
                    {selectedStat.wrong}
                  </Text>
                  <Text style={styles.modalStatKey}>Keliru</Text>
                </View>
              </View>

              <BigButton
                label={`🔊 Dengarkan Bunyi "${letterInfo(selectedStat.letter).speak}"`}
                color={colors.mint}
                edge={colors.mintDark}
                onPress={() =>
                  container.sound.hear(letterInfo(selectedStat.letter).speak)
                }
              />
              <BigButton
                label="Tutup"
                small
                color="#EEEEEE"
                edge="#DDDDDD"
                onPress={() => setSelectedStat(null)}
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, gap: 14, paddingBottom: 60 },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: colors.line,
  },
  avatar: { fontSize: 60, marginRight: 16 },
  profileInfo: { flex: 1 },
  name: { fontFamily: fonts.black, fontSize: 24, color: colors.ink },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 2 },
  starCount: { fontFamily: fonts.black, fontSize: 18, color: '#E0A000' },
  modeBadge: {
    fontFamily: fonts.heavy,
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 16,
    borderBottomWidth: 4,
    borderBottomColor: colors.line,
  },
  sectionTitle: { fontFamily: fonts.black, fontSize: 18, color: colors.ink },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkSoft,
    marginVertical: 4,
  },
  emptyWeakBox: {
    backgroundColor: '#E7FFF3',
    borderRadius: radius.md,
    padding: 14,
    marginTop: 8,
  },
  emptyWeakText: {
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.mintDark,
    textAlign: 'center',
  },
  weakList: { gap: 10, marginTop: 10 },
  weakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 10,
  },
  weakLetterBubble: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  weakLetterText: { fontFamily: fonts.black, fontSize: 22, color: colors.ink },
  weakDetails: { flex: 1 },
  weakWord: { fontFamily: fonts.black, fontSize: 15, color: colors.ink },
  weakStats: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft },
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
  },
  gridLetterCell: {
    width: (width - 80) / 6,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLetterText: { fontFamily: fonts.black, fontSize: 20, color: colors.ink },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 14,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontFamily: fonts.heavy, fontSize: 12, color: colors.inkSoft },
  voiceStatsRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  voiceStatBox: {
    flex: 1,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
  },
  voiceStatNum: { fontFamily: fonts.black, fontSize: 26, color: colors.ink },
  voiceStatLabel: {
    fontFamily: fonts.heavy,
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },
  modalLetter: { fontFamily: fonts.black, fontSize: 72, color: colors.ink },
  modalWord: {
    fontFamily: fonts.black,
    fontSize: 22,
    color: colors.inkSoft,
    marginBottom: 6,
  },
  modalStatGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 10,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
  },
  modalStatItem: { alignItems: 'center' },
  modalStatValue: { fontFamily: fonts.black, fontSize: 22, color: colors.ink },
  modalStatKey: { fontFamily: fonts.heavy, fontSize: 12, color: colors.inkSoft },
});

