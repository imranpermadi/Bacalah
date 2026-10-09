import { DatabaseService } from '../../data/database/DatabaseService';
import { SqliteReadingRepository } from '../../data/repositories/SqliteReadingRepository';
import { ReadingRepository } from '../../domain/repositories/ReadingRepository';
import { SoundService } from '../sound/SoundService';
import { VoiceEvaluatorService } from '../sound/VoiceEvaluatorService';
import { CloudSyncService } from '../sync/CloudSyncService';

/** Composition root sederhana (singleton). */
const database = new DatabaseService();
const repository = new SqliteReadingRepository(database) as ReadingRepository;

export const container = {
  database,
  repository,
  sound: new SoundService(),
  voice: new VoiceEvaluatorService(),
  sync: new CloudSyncService(repository),
};

