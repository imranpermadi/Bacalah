import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { bubblePalette, colors, fonts } from '../../../core/theme';
import { Wobble } from '../../components/common/Motion';
import { BigButton } from '../../components/common/ui';
import { GameShell, useGameSession } from '../GameShell';
import { useLetterRound } from '../useLetterRound';

/** 📦 Masukkan surat huruf kecil ke kotak pos huruf kapital yang tepat (b ≠ d, p ≠ q!). */
export function KotakPosHuruf({ onExit }: { onExit: () => void }) {
  const session = useGameSession('pos', 30);
  const { q, answer, hear, wobble, locked } = useLetterRound(session, 3);

  return (
    <GameShell title="Kotak Pos Huruf" emoji="📦" color={colors.sunny} session={session} onExit={onExit}>
      <View style={styles.letterWrap}>
        <View style={styles.envelope}>
          <Text style={styles.env}>✉️</Text>
          <Text style={styles.small}>{q.target.toLowerCase()}</Text>
        </View>
        <Text style={styles.q}>Masukkan surat ke kotak pos huruf besarnya!</Text>
      </View>
      <View style={styles.boxes}>
        {q.options.map((l, i) => {
          const [bg, edge] = bubblePalette[(i + 3) % bubblePalette.length];
          return (
            <Wobble key={l + session.round} token={wobble.letter === l ? wobble.token : 0}>
              <Pressable disabled={locked} onPress={() => answer(l)} style={[styles.box, { backgroundColor: bg, borderBottomColor: edge }]}>
                <Text style={styles.slot}>📮</Text>
                <Text style={styles.cap}>{l}</Text>
              </Pressable>
            </Wobble>
          );
        })}
      </View>
      <View style={{ padding: 16 }}>
        <BigButton label="🔊 Dengar Cici" color={colors.mint} edge={colors.mintDark} onPress={hear} />
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  letterWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  envelope: { alignItems: 'center', justifyContent: 'center' },
  env: { fontSize: 120 },
  small: { position: 'absolute', fontFamily: fonts.black, fontSize: 56, color: colors.ink, top: 38 },
  q: { fontFamily: fonts.heavy, fontSize: 16, color: colors.inkSoft, textAlign: 'center' },
  boxes: { flexDirection: 'row', justifyContent: 'space-around', padding: 12 },
  box: { width: 96, height: 120, borderRadius: 22, borderBottomWidth: 6, alignItems: 'center', justifyContent: 'center' },
  slot: { fontSize: 30 },
  cap: { fontFamily: fonts.black, fontSize: 52, color: colors.ink },
});

