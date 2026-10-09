import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { colors, fonts } from '../../../core/theme';
import { Float, Wobble } from '../../components/common/Motion';
import { BigButton } from '../../components/common/ui';
import { GameShell, useGameSession } from '../GameShell';
import { useLetterRound } from '../useLetterRound';

const TRACK = 6;

function Cici({ pos }: { pos: number }) {
  const a = useAnimatedStyle(() => ({ left: withSpring(`${(pos / TRACK) * 88}%` as any, { damping: 8 }) }));
  return <Animated.Text style={[styles.cici, a]}>🐱</Animated.Text>;
}

/** 🏃 Bantu Cici melompati teratai berhuruf yang benar untuk menyeberangi kolam. */
export function LompatTeratai({ onExit }: { onExit: () => void }) {
  const session = useGameSession(TRACK);
  const { q, answer, hear, wobble } = useLetterRound(session, 3);

  return (
    <GameShell title="Lompat Teratai" emoji="🏃" color={colors.mint} session={session} onExit={onExit}>
      <View style={styles.pond}>
        <Text style={styles.q}>Lompat ke teratai huruf yang Cici ucapkan!</Text>
        <View style={styles.pads}>
          {q.options.map((l, i) => (
            <Wobble key={l + session.round} token={wobble.letter === l ? wobble.token : 0}>
              <Float amplitude={6} duration={1200 + i * 200} delay={i * 250}>
                <Pressable onPress={() => answer(l)} style={styles.pad}>
                  <Text style={styles.padLetter}>{l}</Text>
                </Pressable>
              </Float>
            </Wobble>
          ))}
        </View>
        <View style={styles.track}>
          <Cici pos={session.round + (session.wrongThisRound === 0 && session.mood === 'happy' ? 1 : 0)} />
          <Text style={styles.flag}>🏁</Text>
        </View>
      </View>
      <View style={{ padding: 16 }}>
        <BigButton label="🔊 Dengar Cici lagi" color={colors.sunny} edge={colors.sunnyDark} onPress={hear} />
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  pond: { flex: 1, backgroundColor: '#BDE9FF', margin: 12, borderRadius: 28, justifyContent: 'space-around', padding: 12 },
  q: { fontFamily: fonts.heavy, fontSize: 16, textAlign: 'center', color: colors.ink },
  pads: { flexDirection: 'row', justifyContent: 'space-around' },
  pad: { width: 92, height: 92, borderRadius: 46, backgroundColor: colors.mint, borderBottomWidth: 6, borderBottomColor: colors.mintDark, alignItems: 'center', justifyContent: 'center' },
  padLetter: { fontFamily: fonts.black, fontSize: 48, color: colors.ink },
  track: { height: 64, backgroundColor: '#8ED6A8', borderRadius: 20, justifyContent: 'center' },
  cici: { position: 'absolute', fontSize: 44 },
  flag: { position: 'absolute', right: 10, fontSize: 36 },
});

