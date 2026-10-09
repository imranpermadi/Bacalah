import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { BigButton } from '../../components/common/ui';
import { MascotCici } from '../../components/play/MascotCici';
import { useAppStore } from '../../stores/useAppStore';

const { width } = Dimensions.get('window');

export function LoginScreen() {
  const isSyncing = useAppStore((s) => s.isSyncing);
  const loginGoogleSSO = useAppStore((s) => s.loginGoogleSSO);
  const loginGoogle = useAppStore((s) => s.loginGoogle);

  const [showManualLogin, setShowManualLogin] = useState(false);
  const [parentEmail, setParentEmail] = useState('');
  const [parentName, setParentName] = useState('');

  const handleSSO = async () => {
    container.sound.sfx('pop');
    await loginGoogleSSO();
    container.sound.sfx('chime');
  };

  const handleManualSubmit = async () => {
    container.sound.sfx('pop');
    await loginGoogle(
      parentEmail.trim() || 'orangtua.bacalah@gmail.com',
      parentName.trim() || 'Orang Tua Hebat'
    );
    setShowManualLogin(false);
    container.sound.sfx('chime');
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Branding */}
          <View style={styles.heroSection}>
            <Text style={styles.logoBadge}>🐱 BACALAH</Text>
            <Text style={styles.heroTitle}>Selamat Datang!</Text>
            <Text style={styles.heroSubtitle}>
              Aplikasi Belajar Membaca & Dikte Cerdas Berbasis Fonik Indonesia
            </Text>
          </View>

          {/* Cici Mascot Greeting */}
          <View style={styles.mascotBox}>
            <MascotCici
              mood="happy"
              message="Halo Ayah & Bunda! Silakan masuk agar data belajar dan rapor anak tersimpan aman di Cloud! ☁️"
              size={90}
            />
          </View>

          {/* Feature Highlights Card */}
          <View style={styles.featureCard}>
            <Text style={styles.featureHeader}>✨ Keunggulan Akun Cloud BACALAH:</Text>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>👥</Text>
              <Text style={styles.featureText}>
                <Text style={{ fontFamily: fonts.black }}>Multi-Profil Anak:</Text> Simpan data kakak dan adik dalam 1 akun orang tua.
              </Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>☁️</Text>
              <Text style={styles.featureText}>
                <Text style={{ fontFamily: fonts.black }}>Aman di Cloud:</Text> Bintang & level tidak hilang saat ganti perangkat.
              </Text>
            </View>
            <View style={styles.featureRow}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureText}>
                <Text style={{ fontFamily: fonts.black }}>Rapor Mandiri:</Text> Pantau huruf lemah dan kelulusan level tiap anak.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <BigButton
              label={isSyncing ? '⏳ Menghubungkan Google…' : '🌐 Masuk dengan Google SSO'}
              color={colors.coral}
              edge={colors.coralDark}
              disabled={isSyncing}
              onPress={handleSSO}
            />

            <BigButton
              label="🔑 Masuk Cepat Orang Tua (Offline/Manual)"
              small
              color={colors.sunny}
              edge={colors.sunnyDark}
              onPress={() => setShowManualLogin(true)}
            />

            <Text style={styles.privacyNote}>
              🔒 BACALAH mengutamakan privasi keluarga. Tidak ada iklan pihak ketiga dan data anak tersimpan aman.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Manual Login Modal */}
      {showManualLogin && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowManualLogin(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalEmoji}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.modalTitle}>Akses Orang Tua</Text>
              <Text style={styles.modalDesc}>
                Masukkan nama dan email akun orang tua untuk mengelola profil anak:
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Nama Orang Tua (mis. Bunda Aisyah)"
                placeholderTextColor={colors.inkSoft}
                value={parentName}
                onChangeText={setParentName}
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Email (mis. keluarga@gmail.com)"
                placeholderTextColor={colors.inkSoft}
                value={parentEmail}
                onChangeText={setParentEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <BigButton
                label="✅ Lanjut Pilih Profil"
                color={colors.mint}
                edge={colors.mintDark}
                onPress={handleManualSubmit}
              />
              <BigButton
                label="Batal"
                color="#EEE"
                edge="#DDD"
                onPress={() => setShowManualLogin(false)}
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
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  heroSection: { alignItems: 'center', marginTop: 12 },
  logoBadge: {
    fontFamily: fonts.black,
    fontSize: 28,
    color: colors.ink,
    letterSpacing: 2,
    backgroundColor: '#FFE57F',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderBottomWidth: 3,
    borderBottomColor: colors.sunnyDark,
  },
  heroTitle: {
    fontFamily: fonts.black,
    fontSize: 26,
    color: colors.ink,
    marginTop: 10,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  mascotBox: { marginVertical: 6 },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 18,
    gap: 12,
    borderBottomWidth: 5,
    borderBottomColor: colors.line,
  },
  featureHeader: {
    fontFamily: fonts.black,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 4,
  },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  featureIcon: { fontSize: 20 },
  featureText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
  },
  actionSection: { gap: 12, marginTop: 4 },
  privacyNote: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 22,
    width: '100%',
    maxWidth: 360,
    gap: 12,
    alignItems: 'center',
  },
  modalEmoji: { fontSize: 44 },
  modalTitle: { fontFamily: fonts.black, fontSize: 20, color: colors.ink },
  modalDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#F8F6EE',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.ink,
    borderWidth: 2,
    borderColor: '#E8E1CF',
  },
});

