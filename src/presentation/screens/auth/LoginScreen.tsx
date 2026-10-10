import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { colors, fonts, radius } from '../../../core/theme';
import { BigButton } from '../../components/common/ui';
import { MascotCici } from '../../components/play/MascotCici';
import { StaggeredEntrance } from '../../components/motion/StaggeredEntrance';
import { useAppStore } from '../../stores/useAppStore';

const { width } = Dimensions.get('window');

export function LoginScreen() {
  const isSyncing = useAppStore((s) => s.isSyncing);
  const loginGoogleSSO = useAppStore((s) => s.loginGoogleSSO);
  const loginGoogle = useAppStore((s) => s.loginGoogle);

  const [parentEmail, setParentEmail] = useState('');
  const [parentName, setParentName] = useState('');

  // Spring scale for SSO button
  const ssoScale = useSharedValue(1);
  const ssoAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ssoScale.value }],
  }));

  // Primary Login: Cukup input email dan langsung sync ke Firebase Firestore!
  const handleEmailLogin = async () => {
    const emailTrim = parentEmail.trim();
    if (!emailTrim || !emailTrim.includes('@')) {
      Alert.alert(
        'Format Email Belum Tepat',
        'Silakan masukkan alamat email yang valid (misal: nama@gmail.com) agar data anak bisa disinkronkan ke Cloud. 😊'
      );
      return;
    }

    container.sound.sfx('pop');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const displayName = parentName.trim() || emailTrim.split('@')[0] || 'Orang Tua Hebat';
    await loginGoogle(emailTrim, displayName);

    container.sound.sfx('chime');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleGuestLogin = async () => {
    container.sound.sfx('pop');
    await loginGoogle('keluarga.bacalah@gmail.com', 'Mode Tamu Offline');
    container.sound.sfx('chime');
  };

  const handleSSO = async () => {
    container.sound.sfx('pop');
    await loginGoogleSSO();
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
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. Hero Branding dengan Staggered Entrance */}
          <StaggeredEntrance index={0}>
            <View style={styles.heroSection}>
              <View style={styles.badgePill}>
                <Text style={styles.logoBadge}>🐱 BACALAH</Text>
              </View>
              <Text style={styles.heroTitle}>Selamat Datang!</Text>
              <Text style={styles.heroSubtitle}>
                Belajar Membaca & Dikte Cerdas Berbasis Fonik Indonesia
              </Text>
            </View>
          </StaggeredEntrance>

          {/* 2. Cici Mascot Greeting dengan Staggered Entrance */}
          <StaggeredEntrance index={1}>
            <View style={styles.mascotBox}>
              <MascotCici
                mood="happy"
                message="Halo Ayah & Bunda! Masukkan email Anda agar rapor & bintang seluruh anak tersimpan otomatis di Cloud! ☁️"
                size={84}
              />
            </View>
          </StaggeredEntrance>

          {/* 3. Primary Email Login Card: 3D Neumorphic Surface */}
          <StaggeredEntrance index={2}>
            <View style={styles.loginCard3D}>
              <LinearGradient
                colors={['#FFFFFF', '#FFFBF5']}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeader}>📧 Masuk Akun Orang Tua</Text>
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>Bebas Hambatan</Text>
                  </View>
                </View>

                <Text style={styles.cardSub}>
                  Data skor, level, dan akurasi anak akan otomatis tersinkron ke Firebase Cloud berdasarkan email ini.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Alamat Email:</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="misal: roenscuy@gmail.com"
                    placeholderTextColor={colors.inkSoft}
                    value={parentEmail}
                    onChangeText={setParentEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nama Panggilan Orang Tua (Opsional):</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="misal: Ayah Imran / Bunda"
                    placeholderTextColor={colors.inkSoft}
                    value={parentName}
                    onChangeText={setParentName}
                  />
                </View>

                <View style={{ marginTop: 8 }}>
                  <BigButton
                    label={isSyncing ? '⏳ Menyambungkan ke Cloud…' : '🚀 Masuk & Sinkronkan Data'}
                    color={colors.mint}
                    edge={colors.mintDark}
                    disabled={isSyncing}
                    onPress={handleEmailLogin}
                  />
                </View>
              </LinearGradient>
            </View>
          </StaggeredEntrance>

          {/* 4. Alternative Quick Entry Options */}
          <StaggeredEntrance index={3}>
            <View style={styles.altSection}>
              <BigButton
                label="👤 Masuk Cepat (Mode Offline / Tamu)"
                small
                color={colors.sunny}
                edge={colors.sunnyDark}
                onPress={handleGuestLogin}
              />

              <Animated.View style={ssoAnimStyle}>
                <Pressable
                  onPressIn={() => {
                    ssoScale.value = withSpring(0.92, { damping: 14, stiffness: 350 });
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  onPressOut={() => {
                    ssoScale.value = withSpring(1.0, { damping: 12, stiffness: 220 });
                  }}
                  onPress={handleSSO}
                  style={styles.ssoFallbackBtn}
                >
                  <Text style={styles.ssoFallbackText}>🌐 Atau Masuk dengan Google SSO Browser</Text>
                </Pressable>
              </Animated.View>

              <View style={styles.privacyBadge}>
                <Text style={styles.privacyNote}>
                  🔒 BACALAH mengutamakan privasi keluarga. Seluruh data aman dan bebas iklan pihak ketiga.
                </Text>
              </View>
            </View>
          </StaggeredEntrance>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 14 },
  heroSection: { alignItems: 'center', marginTop: 12 },
  badgePill: {
    backgroundColor: '#FFF0EA',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
  },
  logoBadge: {
    fontFamily: fonts.black,
    fontSize: 22,
    color: colors.coral,
    letterSpacing: 2,
  },
  heroTitle: {
    fontFamily: fonts.black,
    fontSize: 26,
    color: colors.ink,
    marginTop: 6,
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  mascotBox: {
    alignItems: 'center',
    marginVertical: 4,
  },
  loginCard3D: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FED7AA',
    borderBottomWidth: 6,
    borderBottomColor: '#FDBA74',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  cardGradient: {
    padding: 20,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeader: {
    fontFamily: fonts.black,
    fontSize: 16,
    color: colors.ink,
  },
  freeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  freeBadgeText: {
    fontFamily: fonts.black,
    fontSize: 10,
    color: '#15803D',
  },
  cardSub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 17,
  },
  inputGroup: { gap: 4 },
  inputLabel: {
    fontFamily: fonts.heavy,
    fontSize: 13,
    color: colors.ink,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderBottomWidth: 3,
    borderBottomColor: '#94A3B8',
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.ink,
  },
  altSection: {
    gap: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  ssoFallbackBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.md,
  },
  ssoFallbackText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.inkSoft,
    textDecorationLine: 'underline',
  },
  privacyBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
  },
  privacyNote: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 16,
  },
});
