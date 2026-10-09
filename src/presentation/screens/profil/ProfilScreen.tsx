import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { container } from '../../../core/di/container';
import { colors, fonts, radius, raised, spacing } from '../../../core/theme';
import { ALPHABET, letterInfo } from '../../../data/content/alphabet';
import { LetterAccuracyStats } from '../../../domain/entities/LetterAccuracyStats';
import { AlphabetMasteryEngine } from '../../../domain/services/AlphabetMasteryEngine';
import { LanguageMasteryService } from '../../../domain/services/LanguageMasteryService';
import { BigButton, ScreenTitle, Stars } from '../../components/common/ui';
import { MascotCici } from '../../components/play/MascotCici';
import { useAppStore } from '../../stores/useAppStore';

const { width } = Dimensions.get('window');

export function ProfilScreen() {
  const profile = useAppStore((s) => s.profile);
  const stats = useAppStore((s) => s.stats);
  const levels = useAppStore((s) => s.levels);
  const voice = useAppStore((s) => s.voice);
  const confusions = useAppStore((s) => s.confusions);
  const googleAccount = useAppStore((s) => s.googleAccount);
  const isSyncing = useAppStore((s) => s.isSyncing);
  const lastSyncMessage = useAppStore((s) => s.lastSyncMessage);

  const setMode = useAppStore((s) => s.setMode);
  const loginGoogle = useAppStore((s) => s.loginGoogle);
  const logoutGoogle = useAppStore((s) => s.logoutGoogle);
  const syncCloud = useAppStore((s) => s.syncCloud);
  const restoreCloud = useAppStore((s) => s.restoreCloud);
  const reset = useAppStore((s) => s.reset);

  const [selectedStat, setSelectedStat] = useState<LetterAccuracyStats | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  // Diagnosis Penguasaan Bahasa
  const diagnosis = LanguageMasteryService.diagnose(stats, levels, confusions, voice);

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

  const handleConnectGoogle = async () => {
    await loginGoogle(
      googleEmailInput.trim() || 'orangtua@gmail.com',
      googleNameInput.trim() || 'Orang Tua Hebat'
    );
    setShowLoginModal(false);
    container.sound.sfx('chime');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenTitle sub="Rapor Penguasaan Bahasa, Leveling & Cloud Sync">
        Profil & Rapor Belajar 👤
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
            message={`Hai ${profile.name}! Cici terus mencatat perkembangan membaca dan lafal suaramu! 😸`}
            size={68}
          />
        </View>

        {/* Cloud Sync & Google Account Status */}
        <View style={[styles.sectionCard, { backgroundColor: '#F0F9FF', borderColor: colors.sky }]}>
          <View style={styles.syncHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>☁️ Sinkronisasi Akun Google</Text>
              <Text style={styles.sectionSubtitle}>
                Skor bintang dan level tersimpan di cloud agar tidak terhapus saat pembaruan aplikasi.
              </Text>
            </View>
          </View>

          {googleAccount ? (
            <View style={styles.googleConnectedBox}>
              <View style={styles.googleUserRow}>
                <View style={styles.googleAvatarBadge}>
                  <Text style={styles.googleAvatarText}>G</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.googleUserName}>{googleAccount.name}</Text>
                  <Text style={styles.googleUserEmail}>{googleAccount.email}</Text>
                </View>
                <Text style={styles.syncedBadge}>✓ Terhubung</Text>
              </View>

              {lastSyncMessage ? (
                <Text style={styles.syncMsg}>{lastSyncMessage}</Text>
              ) : null}

              <View style={styles.syncBtnRow}>
                <BigButton
                  label={isSyncing ? '⏳ Menyimpan…' : '☁️ Simpan ke Cloud'}
                  small
                  color={colors.mint}
                  edge={colors.mintDark}
                  disabled={isSyncing}
                  onPress={async () => {
                    await syncCloud();
                    container.sound.sfx('chime');
                  }}
                />
                <BigButton
                  label={isSyncing ? '⏳ Memulihkan…' : '🔄 Pulihkan Data'}
                  small
                  color={colors.sky}
                  edge={colors.skyDark}
                  disabled={isSyncing}
                  onPress={async () => {
                    await restoreCloud();
                    container.sound.sfx('chime');
                  }}
                />
              </View>
              <Pressable onPress={logoutGoogle} style={styles.disconnectBtn}>
                <Text style={styles.disconnectText}>Putuskan Akun</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.googlePromptBox}>
              <Text style={styles.googlePromptText}>
                Belum terhubung ke Akun Google. Masuk agar seluruh bintang & catatan belajar anak tetap aman saat HP diperbarui!
              </Text>
              <BigButton
                label="🌐 Hubungkan Akun Google"
                color={colors.sunny}
                edge={colors.sunnyDark}
                onPress={() => setShowLoginModal(true)}
              />
            </View>
          )}
        </View>

        {/* Leveling Penguasaan Bahasa Anak (Poin 3) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🏆 Leveling Penguasaan Bahasa</Text>
          <Text style={styles.sectionSubtitle}>
            Peta kemajuan anak memahami huruf, suku kata, kata, hingga kalimat.
          </Text>

          {/* Overall Progress Gauge */}
          <View style={styles.stageHeroBox}>
            <View style={styles.stageHeader}>
              <Text style={styles.stageTitle}>{diagnosis.currentMilestoneStage}</Text>
              <Text style={styles.stageScore}>{diagnosis.overallMasteryPercent}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.max(8, diagnosis.overallMasteryPercent)}%` },
                ]}
              />
            </View>
            <Text style={styles.stageSub}>
              {diagnosis.totalLettersLearned} dari 26 huruf sudah dilatih secara aktif.
            </Text>
          </View>

          {/* 6 Jenjang Kurikulum Milestone Cards */}
          <View style={styles.milestoneList}>
            {diagnosis.levels.map((lvl) => {
              const isCompleted = lvl.status === 'completed';
              const isInProgress = lvl.status === 'in_progress';
              return (
                <View
                  key={lvl.level}
                  style={[
                    styles.milestoneCard,
                    isCompleted && styles.milestoneCardCompleted,
                    isInProgress && styles.milestoneCardActive,
                  ]}
                >
                  <Text style={styles.milestoneEmoji}>{lvl.emoji}</Text>
                  <View style={styles.milestoneInfo}>
                    <View style={styles.milestoneTopRow}>
                      <Text style={styles.milestoneTitle}>
                        L{lvl.level}: {lvl.title}
                      </Text>
                      {lvl.bestStars > 0 ? (
                        <Stars count={lvl.bestStars} size={16} />
                      ) : (
                        <Text style={styles.milestoneStatusLabel}>
                          {isInProgress ? 'Sedang Dilatih' : 'Terkunci'}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.milestoneDesc}>{lvl.description}</Text>
                    <Text style={styles.milestoneSessions}>
                      {lvl.sessions > 0
                        ? `Sudah diselesaikan ${lvl.sessions} kali latihan`
                        : 'Belum pernah diselesaikan'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Diagnosis Huruf Rawan Tertukar & Huruf Lemah (Poin 3) */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🔍 Diagnosis Kesalahan & Huruf Tertukar</Text>
          <Text style={styles.sectionSubtitle}>
            Mengetahui di mana letak kesulitan anak agar orang tua dapat membimbing dengan tepat.
          </Text>

          {diagnosis.confusions.length > 0 ? (
            <View style={styles.confusionBox}>
              <Text style={styles.confusionHeader}>⚠️ Huruf yang Sering Tertukar:</Text>
              {diagnosis.confusions.map((c, idx) => (
                <View key={idx} style={styles.confusionRow}>
                  <View style={styles.confusionLetters}>
                    <Text style={styles.confusionTarget}>{c.expected}</Text>
                    <Text style={styles.confusionArrow}> tertukar dengan </Text>
                    <Text style={styles.confusionMistake}>{c.pressed}</Text>
                  </View>
                  <Text style={styles.confusionTimes}>{c.times}x keliru</Text>
                </View>
              ))}
              <View style={styles.parentTipBox}>
                <Text style={styles.parentTipTitle}>💡 Tip Cici untuk Orang Tua:</Text>
                <Text style={styles.parentTipText}>
                  Anak usia dini wajar tertukar huruf yang bentuknya mirip/cermin (seperti B dan D, atau M dan N).
                  Latih anak memperhatikan arah lengkungan dan dengarkan suaranya berulang-ulang!
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyWeakBox}>
              <Text style={styles.emptyWeakText}>
                ✨ Luar biasa! Belum ada pola huruf yang tertukar secara konsisten.
              </Text>
            </View>
          )}

          {/* Huruf Lemah yang Perlu Dilatih */}
          {diagnosis.weakestLetters.length > 0 ? (
            <View style={{ marginTop: 14 }}>
              <Text style={styles.subSectionTitle}>🎯 Huruf yang Perlu Penguatan:</Text>
              <View style={styles.weakList}>
                {diagnosis.weakestLetters.map((item) => {
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
            </View>
          ) : null}
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

      {/* Google Connect Modal */}
      {showLoginModal && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setShowLoginModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalLetter}>🌐</Text>
              <Text style={styles.modalWord}>Hubungkan Akun Google</Text>
              <Text style={styles.googleModalDesc}>
                Data progres belajar anak akan dicadangkan secara aman. Kamu bisa mengaksesnya kembali kapan pun aplikasi diperbarui.
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Email Google (mis. orangtua@gmail.com)"
                placeholderTextColor={colors.inkSoft}
                value={googleEmailInput}
                onChangeText={setGoogleEmailInput}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Nama Orang Tua / Anak"
                placeholderTextColor={colors.inkSoft}
                value={googleNameInput}
                onChangeText={setGoogleNameInput}
              />
              <BigButton
                label="✅ Simpan & Sinkronkan"
                color={colors.sunny}
                edge={colors.sunnyDark}
                onPress={handleConnectGoogle}
              />
              <BigButton
                label="Batal"
                color="#EEE"
                edge="#DDD"
                onPress={() => setShowLoginModal(false)}
              />
            </View>
          </View>
        </Modal>
      )}

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
                color="#EEE"
                edge="#DDD"
                onPress={() => setSelectedStat(null)}
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
  scroll: { paddingHorizontal: 16, paddingBottom: 100, gap: 16 },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 5,
    borderBottomColor: colors.line,
  },
  avatar: { fontSize: 50 },
  profileInfo: { flex: 1, gap: 4 },
  name: { fontFamily: fonts.black, fontSize: 22, color: colors.ink },
  starRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  starCount: { fontFamily: fonts.heavy, fontSize: 16, color: colors.sunnyDark },
  modeBadge: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.inkSoft,
    backgroundColor: '#F3EFE0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 16,
    borderBottomWidth: 5,
    borderBottomColor: colors.line,
  },
  sectionTitle: { fontFamily: fonts.black, fontSize: 18, color: colors.ink },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 2,
    marginBottom: 12,
  },
  subSectionTitle: {
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.ink,
    marginBottom: 8,
  },
  syncHeaderRow: { marginBottom: 8 },
  googleConnectedBox: { gap: 10 },
  googleUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: radius.md,
  },
  googleAvatarBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleAvatarText: { fontFamily: fonts.black, fontSize: 20, color: '#FFF' },
  googleUserName: { fontFamily: fonts.heavy, fontSize: 14, color: colors.ink },
  googleUserEmail: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft },
  syncedBadge: {
    fontFamily: fonts.heavy,
    fontSize: 12,
    color: colors.mintDark,
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  syncMsg: {
    fontFamily: fonts.heavy,
    fontSize: 12,
    color: colors.skyDark,
    textAlign: 'center',
  },
  syncBtnRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  disconnectBtn: { alignSelf: 'center', paddingVertical: 4 },
  disconnectText: { fontFamily: fonts.regular, fontSize: 12, color: '#D93838' },
  googlePromptBox: { gap: 10 },
  googlePromptText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
  },
  stageHeroBox: {
    backgroundColor: '#FAF7ED',
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E8E1CF',
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageTitle: { fontFamily: fonts.black, fontSize: 16, color: colors.ink },
  stageScore: { fontFamily: fonts.black, fontSize: 20, color: colors.sunnyDark },
  progressBarBg: {
    height: 12,
    backgroundColor: '#E2DCBE',
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.mint,
    borderRadius: radius.pill,
  },
  stageSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft },
  milestoneList: { gap: 8 },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F6EE',
    borderRadius: radius.md,
    padding: 10,
    gap: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.line,
  },
  milestoneCardActive: {
    backgroundColor: '#FFFDF0',
    borderLeftColor: colors.sunny,
  },
  milestoneCardCompleted: {
    backgroundColor: '#F0FAF4',
    borderLeftColor: colors.mint,
  },
  milestoneEmoji: { fontSize: 24 },
  milestoneInfo: { flex: 1 },
  milestoneTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneTitle: { fontFamily: fonts.black, fontSize: 13, color: colors.ink },
  milestoneStatusLabel: {
    fontFamily: fonts.heavy,
    fontSize: 11,
    color: colors.inkSoft,
  },
  milestoneDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.inkSoft,
    marginVertical: 2,
  },
  milestoneSessions: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.mintDark,
  },
  confusionBox: {
    backgroundColor: '#FFF8F0',
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FFE0B2',
    gap: 8,
  },
  confusionHeader: { fontFamily: fonts.heavy, fontSize: 13, color: colors.coralDark },
  confusionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: radius.sm,
  },
  confusionLetters: { flexDirection: 'row', alignItems: 'center' },
  confusionTarget: {
    fontFamily: fonts.black,
    fontSize: 18,
    color: colors.ink,
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confusionArrow: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft },
  confusionMistake: {
    fontFamily: fonts.black,
    fontSize: 18,
    color: colors.coralDark,
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  confusionTimes: { fontFamily: fonts.heavy, fontSize: 12, color: colors.inkSoft },
  parentTipBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: radius.sm,
    marginTop: 4,
    gap: 4,
  },
  parentTipTitle: { fontFamily: fonts.black, fontSize: 12, color: colors.ink },
  parentTipText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 16,
  },
  emptyWeakBox: {
    backgroundColor: '#F5FAF5',
    padding: 12,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  emptyWeakText: {
    fontFamily: fonts.heavy,
    fontSize: 13,
    color: colors.mintDark,
    textAlign: 'center',
  },
  weakList: { gap: 8 },
  weakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDFBF7',
    padding: 10,
    borderRadius: radius.md,
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#EFE9D7',
  },
  weakLetterBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weakLetterText: { fontFamily: fonts.black, fontSize: 24, color: '#FFFFFF' },
  weakDetails: { flex: 1 },
  weakWord: { fontFamily: fonts.black, fontSize: 14, color: colors.ink },
  weakStats: { fontFamily: fonts.regular, fontSize: 12, color: colors.coralDark },
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  gridLetterCell: {
    width: (width - 76) / 5,
    aspectRatio: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridLetterText: { fontFamily: fonts.black, fontSize: 20, color: colors.ink },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendLabel: { fontFamily: fonts.heavy, fontSize: 12, color: colors.inkSoft },
  voiceStatsRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  voiceStatBox: {
    flex: 1,
    backgroundColor: '#FAF7ED',
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8E1CF',
  },
  voiceStatNum: { fontFamily: fonts.black, fontSize: 26, color: colors.ink },
  voiceStatLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  modalLetter: { fontSize: 48 },
  modalWord: { fontFamily: fonts.black, fontSize: 22, color: colors.ink },
  googleModalDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#FAF7ED',
    borderWidth: 1.5,
    borderColor: '#E8E1CF',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.ink,
  },
  modalStatGrid: { flexDirection: 'row', gap: 20, marginVertical: 8 },
  modalStatItem: { alignItems: 'center' },
  modalStatValue: { fontFamily: fonts.black, fontSize: 24, color: colors.ink },
  modalStatKey: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft },
});
