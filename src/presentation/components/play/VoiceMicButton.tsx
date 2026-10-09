import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { container } from '../../../core/di/container';
import { colors, fonts } from '../../../core/theme';
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
  onResult?: (r: VoiceResult) => void;
}

/** Tombol mikrofon: anak menirukan Cici, dinilai 1–3 bintang. */
export function VoiceMicButton({ target, speakText, accepted, onResult }: Props) {
  const saveVoice = useAppStore((s) => s.saveVoice);
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<VoiceResult | null>(null);
  const [note, setNote] = useState('');
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = listening
      ? withRepeat(withSequence(withTiming(1.15, { duration: 400 }), withTiming(1, { duration: 400 })), -1)
      : withTiming(1);
  }, [listening, pulse]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  useEffect(() => {
    setResult(null);
    setNote('');
  }, [target]);

  const msgFor = (stars: number) => (stars === 3 ? encouragement.high : stars === 2 ? encouragement.mid : encouragement.low);

  const start = async () => {
    setResult(null);
    if (!container.voice.isAvailable()) {
      // Mode latihan (tanpa mikrofon / Expo Go): anak menirukan lalu menilai diri bersama Cici.
      setNote('Mikrofon belum tersedia di perangkat ini. Ayo berlatih menirukan Cici, lalu tekan "Sudah"!');
      return;
    }
    try {
      setListening(true);
      setNote('Cici mendengarkan… ayo bicara! 👂');
      const r = await container.voice.listenAndScore(target, accepted ?? [target]);
      setResult(r);
      setNote(msgFor(r.stars));
      saveVoice(target, r.transcript, r.similarity, r.stars);
      container.sound.sfx(r.stars >= 2 ? 'chime' : 'pop');
      onResult?.(r);
    } catch (e: any) {
      setNote(
        e?.message === 'permission'
          ? 'Cici butuh izin mikrofon dulu ya. Minta tolong orang tuamu! 🎤'
          : 'Hmm, Cici belum dengar. Ayo coba lagi! 💛'
      );
    } finally {
      setListening(false);
    }
  };

  const practiceDone = () => {
    const r: VoiceResult = { transcript: '(latihan)', similarity: 0, stars: 2 };
    setResult(r);
    setNote('Hebat sudah berlatih! Terus semangat ya! 🌟');
    onResult?.(r);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <BigButton label="🔊 Dengar Cici" color={colors.mint} edge={colors.mintDark} small onPress={() => container.sound.hear(speakText ?? target.toLowerCase())} />
        <Animated.View style={anim}>
          <BigButton label={listening ? '🎤 Mendengarkan…' : '🎤 Tirukan Cici'} color={colors.coral} edge={colors.coralDark} onPress={start} disabled={listening} />
        </Animated.View>
        {!container.voice.isAvailable() && note ? <BigButton label="✅ Sudah" small onPress={practiceDone} /> : null}
      </View>
      {note ? <Text style={styles.note}>{note}</Text> : null}
      {result && result.transcript !== '(latihan)' ? (
        <Text style={styles.heard}>Cici dengar: “{result.transcript || '…'}”</Text>
      ) : null}
      {result ? <Stars count={result.stars} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  note: { fontFamily: fonts.heavy, fontSize: 15, color: colors.ink, textAlign: 'center' },
  heard: { fontFamily: fonts.regular, fontSize: 14, color: colors.inkSoft },
});

