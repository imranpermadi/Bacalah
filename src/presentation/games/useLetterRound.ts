import { useEffect, useRef, useState } from 'react';
import { container } from '../../core/di/container';
import { letterInfo } from '../../data/content/alphabet';
import { WORDS } from '../../data/content/curriculum';
import { WordItem } from '../../domain/entities/DictationExercise';
import { AlphabetMasteryEngine } from '../../domain/services/AlphabetMasteryEngine';
import { DictationGenerator } from '../../domain/services/DictationGenerator';
import { useAppStore } from '../stores/useAppStore';
import { useGameSession } from './GameShell';

type Session = ReturnType<typeof useGameSession>;

/**
 * Soal huruf untuk mini games: huruf target dipilih berbobot (huruf lemah lebih sering),
 * target diucapkan otomatis, dan hasil dicatat ke letter_accuracy_stats.
 */
export function useLetterRound(session: Session, optionCount: number) {
  const recordLetter = useAppStore((s) => s.recordLetter);
  const make = (avoid?: string) => DictationGenerator.letterQuestion(useAppStore.getState().weights, optionCount, avoid);
  const [q, setQ] = useState(() => make());
  const [locked, setLocked] = useState(false);
  const [wobble, setWobble] = useState<{ letter: string | null; token: number }>({ letter: null, token: 0 });
  const prev = useRef(q.target);

  useEffect(() => {
    if (session.finished) return;
    const nq = make(prev.current);
    prev.current = nq.target;
    setQ(nq);
    setLocked(false);
    const t = setTimeout(() => container.sound.hear(letterInfo(nq.target).speak), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.round, session.finished]);

  const hear = () => container.sound.hear(letterInfo(q.target).speak);

  /** Mengembalikan true bila benar. */
  const answer = (letter: string): boolean => {
    if (locked) return false;
    const ok = letter === q.target;
    recordLetter(q.target, ok, letter);
    if (ok) {
      setLocked(true);
      session.correct();
    } else {
      setWobble((w) => ({ letter, token: w.token + 1 }));
      session.wrong();
    }
    return ok;
  };

  return { q, answer, hear, wobble, locked, info: letterInfo(q.target) };
}

export function pickWord(minSyllables = 2): WordItem {
  const weights = useAppStore.getState().weights;
  const pool = WORDS.filter((w) => w.syllables.length >= minSyllables);
  return AlphabetMasteryEngine.weightedPick(pool, (w) => w.word.split('').reduce((a, c) => a + (weights[c] ?? 1), 0) / w.word.length);
}

