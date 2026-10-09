import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { bubblePalette, colors, fonts } from '../../../core/theme';
import { AlphabetLetter } from '../../../domain/entities/AlphabetLetter';
import { BigButton, HearButtons } from '../common/ui';
import { container } from '../../../core/di/container';

/** Kartu huruf besar: huruf kapital + kecil, bunyi fonik, dan kata bergambar. */
export function AlphabetCard({ item, index }: { item: AlphabetLetter; index: number }) {
  const [bg, edge] = bubblePalette[index % bubblePalette.length];
  return (
    <View style={[styles.card, { backgroundColor: bg, borderBottomColor: edge }]}>
      <Text style={styles.big}>
        {item.letter}
        <Text style={styles.small}> {item.letter.toLowerCase()}</Text>
      </Text>
      <Text style={styles.type}>{item.isVowel ? 'Huruf vokal' : 'Huruf konsonan'}</Text>
      <View style={styles.wordBox}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <Text style={styles.word}>
          <Text style={{ color: edge }}>{item.word[0]}</Text>
          {item.word.slice(1)}
        </Text>
      </View>
      <BigButton label={`🎵 Bunyi huruf ${item.letter}`} color="#FFFFFF" edge="#DDD" onPress={() => container.sound.hear(item.speak)} style={{ alignSelf: 'stretch', marginBottom: 10 }} />
      <HearButtons text={item.word.toLowerCase()} slowParts={item.word.toLowerCase().split('')} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 32, borderBottomWidth: 8, padding: 18, alignItems: 'center', margin: 16 },
  big: { fontFamily: fonts.black, fontSize: 120, color: colors.ink, lineHeight: 130 },
  small: { fontSize: 70 },
  type: { fontFamily: fonts.heavy, fontSize: 15, color: colors.ink, opacity: 0.7, marginBottom: 8 },
  wordBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFFCC', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 12 },
  emoji: { fontSize: 64, marginRight: 12 },
  word: { fontFamily: fonts.black, fontSize: 32, color: colors.ink },
});

