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
import { BigButton, ScreenTitle, Stars } from '../../components/common/ui';
import { MascotCici } from '../../components/play/MascotCici';
import { useAppStore } from '../../stores/useAppStore';

const { width } = Dimensions.get('window');

const AVAILABLE_AVATARS = [
  { emoji: '🐱', label: 'Cici Kucing' },
  { emoji: '🦁', label: 'Singa Berani' },
  { emoji: '🐰', label: 'Kelinci Ceria' },
  { emoji: '🐼', label: 'Panda Lucu' },
  { emoji: '🐻', label: 'Beruang Ramah' },
  { emoji: '🦖', label: 'Dino Cilik' },
  { emoji: '👨‍🚀', label: 'Astronot Cilik' },
  { emoji: '🦉', label: 'Burung Hantu' },
  { emoji: '🐬', label: 'Lumba-Lumba' },
  { emoji: '🦊', label: 'Rubah Cerdik' },
];

export function ProfileSelectScreen() {
  const profiles = useAppStore((s) => s.profiles);
  const selectProfile = useAppStore((s) => s.selectProfile);
  const createProfile = useAppStore((s) => s.createProfile);
  const deleteProfile = useAppStore((s) => s.deleteProfile);
  const googleAccount = useAppStore((s) => s.googleAccount);
  const logoutGoogle = useAppStore((s) => s.logoutGoogle);

  const [showAddModal, setShowAddModal] = useState(false);
  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🐱');

  const handleSelect = async (profileId: number) => {
    container.sound.sfx('pop');
    await selectProfile(profileId);
    container.sound.sfx('chime');
  };

  const handleCreate = async () => {
    if (!childName.trim()) {
      Alert.alert('Perhatian', 'Silakan masukkan nama panggilan anak terlebih dahulu ya! 😊');
      return;
    }
    container.sound.sfx('pop');
    await createProfile(childName.trim(), birthDate.trim() || undefined, selectedAvatar);
    setChildName('');
    setBirthDate('');
    setShowAddModal(false);
    container.sound.sfx('clap');
  };

  const handleDelete = (profileId: number, name: string) => {
    if (profiles.length <= 1) {
      Alert.alert('Tidak Bisa Dihapus', 'Minimal harus ada 1 profil anak di aplikasi.');
      return;
    }
    Alert.alert(
      'Hapus Profil Anak?',
      `Seluruh bintang dan catatan belajar ${name} akan dihapus secara permanen. Lanjutkan?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Hapus',
          style: 'destructive',
          onPress: async () => {
            await deleteProfile(profileId);
            container.sound.sfx('boop');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Siapa yang Mau Belajar Hari Ini? 🎓</Text>
        <Text style={styles.headerSubtitle}>
          Pilih profil anak untuk melanjutkan belajar dan memantau skor mandiri.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Child Profile Cards Grid */}
        <View style={styles.grid}>
          {profiles.map((p) => (
            <View key={p.id} style={styles.cardWrapper}>
              <Pressable
                onPress={() => handleSelect(p.id)}
                style={({ pressed }) => [
                  styles.profileCard,
                  raised(colors.sunnyDark),
                  pressed && { transform: [{ scale: 0.97 }] },
                ]}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarEmoji}>{p.avatar || '🐱'}</Text>
                </View>

                <Text style={styles.childName} numberOfLines={1}>
                  {p.name}
                </Text>

                {p.birthDate ? (
                  <Text style={styles.birthDateText}>🎂 {p.birthDate}</Text>
                ) : null}

                {/* Stars and Level Badge */}
                <View style={styles.statRow}>
                  <View style={styles.starPill}>
                    <Text style={{ fontSize: 13 }}>⭐</Text>
                    <Text style={styles.starText}>{p.stars}</Text>
                  </View>
                  <View style={styles.levelPill}>
                    <Text style={styles.levelText}>L{p.unlockedLevel || 1}</Text>
                  </View>
                </View>

                <View style={styles.playButtonPill}>
                  <Text style={styles.playButtonText}>Mulai Belajar ➔</Text>
                </View>
              </Pressable>

              {profiles.length > 1 && (
                <Pressable
                  onPress={() => handleDelete(p.id, p.name)}
                  style={styles.deleteBtn}
                  hitSlop={8}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </Pressable>
              )}
            </View>
          ))}

          {/* Add Profile Card */}
          <Pressable
            onPress={() => {
              container.sound.sfx('tap');
              setShowAddModal(true);
            }}
            style={({ pressed }) => [
              styles.addCard,
              raised(colors.line),
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
          >
            <View style={styles.addCircle}>
              <Text style={styles.addPlus}>＋</Text>
            </View>
            <Text style={styles.addTitle}>Tambah Anak</Text>
            <Text style={styles.addSub}>Kakak / Adik baru</Text>
          </Pressable>
        </View>

        {/* Mascot Encouragement */}
        <View style={{ marginTop: 14 }}>
          <MascotCici
            mood="talk"
            message="Data skor bintang, akurasi huruf, dan game tersimpan mandiri di tiap profil anak! 🐱"
            size={74}
          />
        </View>

        {/* Account Info and Logout */}
        <View style={styles.accountBox}>
          <Text style={styles.accountText}>
            Akun Terhubung: {googleAccount ? googleAccount.email : 'Orang Tua Hebat'}
          </Text>
          <Pressable onPress={logoutGoogle} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>🚪 Ganti Akun / Keluar</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Add Profile Modal */}
      {showAddModal && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalHeader}>👶 Tambah Profil Anak Baru</Text>

              {/* Avatar Selection */}
              <Text style={styles.label}>Pilih Karakter Lucu:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.avatarRow}
              >
                {AVAILABLE_AVATARS.map((av) => {
                  const isSelected = selectedAvatar === av.emoji;
                  return (
                    <Pressable
                      key={av.emoji}
                      onPress={() => {
                        setSelectedAvatar(av.emoji);
                        container.sound.sfx('pop');
                      }}
                      style={[
                        styles.avatarOption,
                        isSelected && styles.avatarOptionSelected,
                      ]}
                    >
                      <Text style={{ fontSize: 32 }}>{av.emoji}</Text>
                      <Text style={styles.avatarLabel}>{av.label.split(' ')[0]}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Child Name Input */}
              <Text style={styles.label}>Nama Panggilan Anak:</Text>
              <TextInput
                style={styles.input}
                placeholder="mis. Rafi, Aisyah, Kenzi..."
                placeholderTextColor={colors.inkSoft}
                value={childName}
                onChangeText={setChildName}
              />

              {/* Birthdate Input */}
              <Text style={styles.label}>Tanggal Lahir (Opsional):</Text>
              <TextInput
                style={styles.input}
                placeholder="mis. 15 Mei 2020 / YYYY-MM-DD"
                placeholderTextColor={colors.inkSoft}
                value={birthDate}
                onChangeText={setBirthDate}
              />

              <View style={{ gap: 8, marginTop: 8, width: '100%' }}>
                <BigButton
                  label="✅ Simpan Profil Anak"
                  color={colors.mint}
                  edge={colors.mintDark}
                  onPress={handleCreate}
                />
                <BigButton
                  label="Batal"
                  color="#EEE"
                  edge="#DDD"
                  onPress={() => setShowAddModal(false)}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontFamily: fonts.black, fontSize: 22, color: colors.ink },
  headerSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 4,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 14 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardWrapper: {
    width: (width - 54) / 2,
    position: 'relative',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: '#FFE082',
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.sunnyDark,
  },
  avatarEmoji: { fontSize: 40 },
  childName: {
    fontFamily: fonts.black,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
  },
  birthDateText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.inkSoft,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  starPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  starText: { fontFamily: fonts.heavy, fontSize: 12, color: colors.sunnyDark },
  levelPill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  levelText: { fontFamily: fonts.heavy, fontSize: 12, color: colors.mintDark },
  playButtonPill: {
    backgroundColor: colors.sunny,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: 4,
    width: '100%',
    alignItems: 'center',
  },
  playButtonText: {
    fontFamily: fonts.black,
    fontSize: 12,
    color: colors.ink,
  },
  deleteBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  deleteText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: fonts.black,
    lineHeight: 14,
  },
  addCard: {
    width: (width - 54) / 2,
    backgroundColor: '#F7F5EE',
    borderRadius: radius.xl,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: colors.line,
    borderStyle: 'dashed',
    minHeight: 180,
  },
  addCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.line,
  },
  addPlus: { fontSize: 26, color: colors.inkSoft, fontFamily: fonts.black },
  addTitle: { fontFamily: fonts.black, fontSize: 15, color: colors.ink },
  addSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.inkSoft },
  accountBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  accountText: { fontFamily: fonts.regular, fontSize: 12, color: colors.inkSoft },
  logoutBtn: { paddingVertical: 4 },
  logoutText: { fontFamily: fonts.heavy, fontSize: 12, color: colors.coralDark },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    gap: 10,
    alignItems: 'flex-start',
  },
  modalHeader: {
    fontFamily: fonts.black,
    fontSize: 18,
    color: colors.ink,
    alignSelf: 'center',
    marginBottom: 4,
  },
  label: { fontFamily: fonts.heavy, fontSize: 13, color: colors.ink },
  avatarRow: { gap: 10, paddingVertical: 6 },
  avatarOption: {
    alignItems: 'center',
    padding: 8,
    borderRadius: radius.md,
    backgroundColor: '#F8F6EE',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarOptionSelected: {
    borderColor: colors.sunnyDark,
    backgroundColor: '#FFF8E1',
  },
  avatarLabel: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.inkSoft,
    marginTop: 2,
  },
  input: {
    width: '100%',
    backgroundColor: '#F8F6EE',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.ink,
    borderWidth: 1.5,
    borderColor: '#E8E1CF',
  },
});

