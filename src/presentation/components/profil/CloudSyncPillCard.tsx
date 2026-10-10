import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { colors, fonts, radius } from '../../../core/theme';

interface Props {
  googleAccount?: { name: string; email: string } | null;
  lastSyncMessage?: string | null;
  isSyncing: boolean;
  onSyncCloud: () => Promise<void>;
  onRestoreCloud: () => Promise<void>;
  onLoginGoogleSSO: () => Promise<void>;
  onOpenManualModal: () => void;
  onLogoutGoogle: () => void;
}

/**
 * Requirement 4: Card 'Sinkronisasi Cloud'
 * - Tombol Soft UI / Pill shape.
 * - Saat simpan berhasil: Tombol berubah warna hijau + Spring Bounce Besar + Haptics.NotificationFeedbackType.Success.
 * - Multisensori: scale 0.92 saat ditekan, getaran taktil, audio sound effect.
 */
export function CloudSyncPillCard({
  googleAccount,
  lastSyncMessage,
  isSyncing,
  onSyncCloud,
  onRestoreCloud,
  onLoginGoogleSSO,
  onOpenManualModal,
  onLogoutGoogle,
}: Props) {
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  // Reanimated Spring Values for Sync Button
  const syncBtnScale = useSharedValue(1);
  const syncBtnElevation = useSharedValue(6);

  // Reanimated Spring Values for Restore Button
  const restoreBtnScale = useSharedValue(1);
  const restoreBtnElevation = useSharedValue(6);

  // 1. Simpan ke Cloud Handler dengan Spring Bounce Besar
  const handleSavePress = async () => {
    try {
      await onSyncCloud();

      // Trigger Spring Bounce Besar: 1 -> 1.18 -> 1
      syncBtnScale.value = withSequence(
        withSpring(1.18, { damping: 4, stiffness: 220, mass: 0.8 }),
        withSpring(1, { damping: 8, stiffness: 180 })
      );

      // Picu getaran sukses & audio chime
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      container.sound.sfx('chime');

      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3500);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      container.sound.sfx('boop');
    }
  };

  // 2. Pulihkan Data Handler
  const handleRestorePress = async () => {
    try {
      await onRestoreCloud();

      // Spring Bounce: 1 -> 1.15 -> 1
      restoreBtnScale.value = withSequence(
        withSpring(1.15, { damping: 5, stiffness: 200 }),
        withSpring(1, { damping: 8, stiffness: 180 })
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      container.sound.sfx('chime');

      setRestoreSuccess(true);
      setTimeout(() => setRestoreSuccess(false), 3500);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      container.sound.sfx('boop');
    }
  };

  const syncAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: syncBtnScale.value }],
    shadowRadius: syncBtnElevation.value * 1.5,
    elevation: syncBtnElevation.value,
  }));

  const restoreAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: restoreBtnScale.value }],
    shadowRadius: restoreBtnElevation.value * 1.5,
    elevation: restoreBtnElevation.value,
  }));

  return (
    <View style={styles.cardContainer}>
      {/* Header Card with Depth */}
      <LinearGradient
        colors={['#F0FDF4', '#DCFCE7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.topHighlight} />

        <View style={styles.headerRow}>
          <View style={styles.cloudIconBadge}>
            <Text style={{ fontSize: 24 }}>☁️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Sinkronisasi Cloud & Akun</Text>
            <Text style={styles.subtitle}>
              Bintang, progres level, dan rapor tersimpan aman di cloud Google.
            </Text>
          </View>
        </View>

        {googleAccount ? (
          <View style={styles.accountBox}>
            {/* Connected User Pill */}
            <View style={styles.userRow}>
              <View style={styles.avatarG}>
                <Text style={styles.avatarGText}>G</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{googleAccount.name}</Text>
                <Text style={styles.userEmail}>{googleAccount.email}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>✓ Terhubung</Text>
              </View>
            </View>

            {lastSyncMessage ? (
              <Text style={styles.syncMsgText}>ℹ️ {lastSyncMessage}</Text>
            ) : null}

            {/* Pill Shape Action Buttons Row */}
            <View style={styles.buttonRow}>
              {/* Button 1: Simpan ke Cloud (Soft UI Pill Shape) */}
              <Pressable
                disabled={isSyncing}
                onPressIn={() => {
                  syncBtnScale.value = withSpring(0.92, { damping: 10, stiffness: 220 });
                  syncBtnElevation.value = withSpring(2, { damping: 12, stiffness: 200 });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  container.sound.sfx('pop');
                }}
                onPressOut={() => {
                  syncBtnScale.value = withSpring(1, { damping: 8, stiffness: 180 });
                  syncBtnElevation.value = withSpring(6, { damping: 10, stiffness: 180 });
                }}
                onPress={handleSavePress}
                style={{ flex: 1 }}
              >
                <Animated.View style={[styles.pillBtnWrapper, syncAnimStyle]}>
                  <LinearGradient
                    colors={
                      syncSuccess
                        ? ['#10B981', '#059669'] // Green on success
                        : isSyncing
                        ? ['#CBD5E1', '#94A3B8']
                        : ['#34D399', '#059669'] // Emerald green Soft UI
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.pillGradient}
                  >
                    <View style={styles.btnTopLight} />
                    <Text style={styles.pillBtnText}>
                      {syncSuccess
                        ? '🎉 Tersimpan!'
                        : isSyncing
                        ? '⏳ Menyimpan…'
                        : '☁️ Simpan ke Cloud'}
                    </Text>
                  </LinearGradient>
                </Animated.View>
              </Pressable>

              {/* Button 2: Pulihkan Data (Soft UI Pill Shape) */}
              <Pressable
                disabled={isSyncing}
                onPressIn={() => {
                  restoreBtnScale.value = withSpring(0.92, { damping: 10, stiffness: 220 });
                  restoreBtnElevation.value = withSpring(2, { damping: 12, stiffness: 200 });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  container.sound.sfx('pop');
                }}
                onPressOut={() => {
                  restoreBtnScale.value = withSpring(1, { damping: 8, stiffness: 180 });
                  restoreBtnElevation.value = withSpring(6, { damping: 10, stiffness: 180 });
                }}
                onPress={handleRestorePress}
                style={{ flex: 1 }}
              >
                <Animated.View style={[styles.pillBtnWrapper, restoreAnimStyle]}>
                  <LinearGradient
                    colors={
                      restoreSuccess
                        ? ['#38BDF8', '#0284C7'] // Blue success
                        : isSyncing
                        ? ['#CBD5E1', '#94A3B8']
                        : ['#60A5FA', '#2563EB'] // Sky blue Soft UI
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.pillGradient}
                  >
                    <View style={styles.btnTopLight} />
                    <Text style={styles.pillBtnText}>
                      {restoreSuccess
                        ? '✨ Terpulihkan!'
                        : isSyncing
                        ? '⏳ Memulihkan…'
                        : '🔄 Pulihkan Data'}
                    </Text>
                  </LinearGradient>
                </Animated.View>
              </Pressable>
            </View>

            {/* Logout / Putuskan Akun */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                container.sound.sfx('boop');
                onLogoutGoogle();
              }}
              style={styles.disconnectBtn}
            >
              <Text style={styles.disconnectText}>Putuskan Akun Google</Text>
            </Pressable>
          </View>
        ) : (
          /* When NOT connected */
          <View style={styles.connectPromptBox}>
            <Text style={styles.connectPromptText}>
              Belum terhubung ke Akun Google. Masuk agar seluruh bintang & catatan belajar anak tidak hilang saat ganti perangkat!
            </Text>
            <View style={{ gap: 10, marginTop: 10 }}>
              <Pressable
                disabled={isSyncing}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  container.sound.sfx('chime');
                  onLoginGoogleSSO();
                }}
                style={styles.ssoBtn}
              >
                <LinearGradient
                  colors={['#FB7185', '#E11D48']}
                  style={styles.pillGradient}
                >
                  <Text style={styles.pillBtnText}>
                    {isSyncing ? '⏳ Menghubungkan Google…' : '🌐 Masuk dengan SSO Google'}
                  </Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  container.sound.sfx('pop');
                  onOpenManualModal();
                }}
                style={styles.manualBtn}
              >
                <Text style={styles.manualBtnText}>✏️ Masukkan Email Akun Manual</Text>
              </Pressable>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  cardGradient: {
    padding: 18,
    position: 'relative',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cloudIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  title: {
    fontFamily: fonts.black,
    fontSize: 17,
    color: '#065F46',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
  },
  accountBox: {
    gap: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  avatarG: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGText: {
    fontFamily: fonts.black,
    fontSize: 18,
    color: '#FFFFFF',
  },
  userName: {
    fontFamily: fonts.heavy,
    fontSize: 14,
    color: colors.ink,
  },
  userEmail: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.inkSoft,
  },
  statusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#059669',
  },
  syncMsgText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: '#047857',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pillBtnWrapper: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  pillGradient: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  btnTopLight: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  pillBtnText: {
    fontFamily: fonts.black,
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  disconnectBtn: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  disconnectText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#DC2626',
    textDecorationLine: 'underline',
  },
  connectPromptBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
  },
  connectPromptText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#065F46',
    lineHeight: 18,
  },
  ssoBtn: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  manualBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  manualBtnText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.ink,
  },
});

