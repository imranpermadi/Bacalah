import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { container } from '../../../core/di/container';
import { colors, fonts, radius } from '../../../core/theme';
import { VoiceResult } from '../../../core/sound/VoiceEvaluatorService';
import { BigButton, Stars } from '../common/ui';
import { useAppStore } from '../../stores/useAppStore';
import { encouragement } from '../../../data/content/feedback';

interface Props {
  /** Teks yang harus ditirukan (huruf/suku kata/kata). */
  target: string;
  /** Ucapan Cici yang diperdengarkan sebelum anak menirukan. */
  speakText?: string;
  /** Teks-teks lain yang dianggap benar (mis. nama huruf). */
  accepted?: string[];
  /** Tampilkan tombol Dengar Cici di samping mic (default false agar tidak duplikat dengan pemutar suara utama). */
  showHearButton?: boolean;
  onResult?: (r: VoiceResult) => void;
}

/** Tombol mikrofon: anak menirukan Cici, dinilai 1–3 bintang dengan Golden Rules. */
export function VoiceMicButton({
  target,
  speakText,
  accepted,
  showHearButton = false,
  onResult,
}: Props) {
  const saveVoice = useAppStore((s) => s.saveVoice);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [note, setNote] = useState('');
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = listening
      ? withRepeat(
          withSequence(
            withSpring(1.15, { damping: 8, stiffness: 250 }),
            withSpring(1.0, { damping: 8, stiffness: 250 })
          ),
          -1
        )
      : withSpring(1.0, { damping: 10, stiffness: 200 });
  }, [listening, pulse]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  useEffect(() => {
    setResult(null);
    setNote('');
  }, [target]);

  const msgFor = (stars: number) =>
    stars === 3 ? encouragement.high : stars === 2 ? encouragement.mid : encouragement.low;

  const start = async () => {
    setResult(null);
    try {
      setListening(true);
      setNote('Cici mendengarkan… ayo bicara! 👂');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const r = await container.voice.listenAndScore(target, accepted ?? [target]);
      setResult(r);
      setNote(msgFor(r.stars));
      saveVoice(target, r.transcript || target, r.similarity, r.stars);

      if (r.stars >= 2) {
        container.sound.sfx('tada_magic');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        container.sound.sfx('pop');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onResult?.(r);
    } catch (e: any) {
      setNote(
        e?.message === 'permission'
          ? 'Cici butuh izin mikrofon ya. Pilih "Saat aplikasi digunakan"! 🎤'
          : 'Bagus sekali usahanya! Ayo coba bicara lagi bersama Cici! 🐱💛'
      );
    } finally {
      setListening(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {showHearButton && (
          <BigButton
            label="🔊 Dengar Cici"
            color={colors.mint}
            edge={colors.mintDark}
            small
            onPress={() => container.sound.hear(speakText ?? target.toLowerCase())}
          />
        )}
        <Animated.View style={anim}>
          <BigButton
            label={listening ? '🔴 Mendengarkan…' : '🎤 Ucapkan'}
            color={colors.coral}
            edge={colors.coralDark}
            onPress={start}
            disabled={listening}
          />
        </Animated.View>
      </View>

      {note ? <Text style={styles.note}>{note}</Text> : null}

      {result && result.transcript ? (
        <View style={styles.heardBadge}>
          <Text style={styles.heard}>Cici dengar: “{result.transcript}”</Text>
        </View>
      ) : null}

      {result ? <Stars count={result.stars} size={42} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  note: { fontFamily: fonts.heavy, fontSize: 15, color: colors.ink, textAlign: 'center' },
  heardBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  heard: { fontFamily: fonts.bold, fontSize: 14, color: colors.inkSoft },
});
