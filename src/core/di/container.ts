import { DatabaseService } from '../../data/database/DatabaseService';
import { SqliteReadingRepository } from '../../data/repositories/SqliteReadingRepository';
import { ReadingRepository } from '../../domain/repositories/ReadingRepository';
import { SoundService } from '../sound/SoundService';
import { VoiceEvaluatorService } from '../sound/VoiceEvaluatorService';

/** Composition root sederhana (singleton). */
const database = new DatabaseService();
export const container = {
  database,
  repository: new SqliteReadingRepository(database) as ReadingRepository,
  sound: new SoundService(),
  voice: new VoiceEvaluatorService(),
};

