import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { bubblePalette, colors, fonts } from '../../../core/theme';
import { Float, Wobble } from '../../components/common/Motion';
import { BigButton } from '../../components/common/ui';
import { GameShell, useGameSession } from '../GameShell';
import { useLetterRound } from '../useLetterRound';

/** 🎈 Cici menyebut bunyi huruf, anak memecahkan balon huruf yang cocok. */
export function TangkapBalonHuruf({ onExit }: { onExit: () => void }) {
  const session = useGameSession(6);
  const { q, answer, hear, wobble } = useLetterRound(session, 5);
  const [popped, setPopped] = useState<string | null>(null);

  const tap = (l: string) => {
    if (answer(l)) setPopped(l);
  };
  React.useEffect(() => setPopped(null), [session.round]);

  return (
    <GameShell title="Tangkap Balon Huruf" emoji="🎈" color={colors.sky} session={session} onExit={onExit}>
      <View style={styles.sky}>
        {q.options.map((l, i) => {
          const [bg, edge] = bubblePalette[i % bubblePalette.length];
          if (popped === l) return <Text key={l} style={styles.pop}>💥</Text>;
          return (
            <Wobble key={l + session.round} token={wobble.letter === l ? wobble.token : 0}>
              <Float delay={i * 200} amplitude={10} duration={1100 + i * 150}>
                <Pressable onPress={() => tap(l)}>
                  <View style={[styles.balloon, { backgroundColor: bg, borderBottomColor: edge }]}>
                    <Text style={styles.letter}>{l}</Text>
                  </View>
                  <View style={styles.string} />
                </Pressable>
              </Float>
            </Wobble>
          );
        })}
      </View>
      <View style={{ padding: 16 }}>
        <BigButton label="🔊 Dengar Cici lagi" color={colors.mint} edge={colors.mintDark} onPress={hear} />
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  sky: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', alignContent: 'space-around', padding: 12 },
  balloon: { width: 96, height: 116, borderRadius: 58, borderBottomWidth: 5, alignItems: 'center', justifyContent: 'center' },
  letter: { fontFamily: fonts.black, fontSize: 52, color: colors.ink },
  string: { width: 2, height: 28, backgroundColor: colors.inkSoft, alignSelf: 'center' },
  pop: { fontSize: 72, width: 96, textAlign: 'center' },
});

