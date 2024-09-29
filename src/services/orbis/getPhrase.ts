import { db } from './orbisConfig.js';
import dotenv from 'dotenv';

dotenv.config();

export async function getPhrase(streamId: string): Promise<string | null> {
  try {
    const modelId = process.env.ORBIS_PHRASE_MODEL_ID;
    if (!modelId) {
      throw new Error('ORBIS_PHRASE_MODEL_ID is not set in the environment variables');
    }

    const { rows } = await db
      .select()
      .from(modelId)
      .where({ stream_id: streamId })
      .run();

    if (rows.length > 0) {
      return rows[0].text;
    } else {
      console.log(`No phrase found for stream ID: ${streamId}`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching phrase from Orbis:', error);
    return null;
  }
}
