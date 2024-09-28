import { distance } from 'fastest-levenshtein';
import { doubleMetaphone } from 'double-metaphone';

export async function scoreAudio(transcription: string, originalPhrase: string): Promise<number> {
  // Normalize strings: trim whitespace and convert to lowercase
  const normalizedTranscription = transcription.trim().toLowerCase();
  const normalizedOriginal = originalPhrase.trim().toLowerCase();

  // Calculate Levenshtein distance
  const levenshteinDistance = distance(normalizedTranscription, normalizedOriginal);

  // Calculate similarity based on Levenshtein distance
  const maxLength = Math.max(normalizedTranscription.length, normalizedOriginal.length);
  const levenshteinSimilarity = 1 - levenshteinDistance / maxLength;

  // Calculate Double Metaphone codes
  const [transcriptionCode1, transcriptionCode2] = doubleMetaphone(normalizedTranscription);
  const [originalCode1, originalCode2] = doubleMetaphone(normalizedOriginal);

  // Compare Double Metaphone codes
  const metaphoneSimilarity = (
    (transcriptionCode1 === originalCode1 || transcriptionCode1 === originalCode2 ? 1 : 0) +
    (transcriptionCode2 === originalCode1 || transcriptionCode2 === originalCode2 ? 1 : 0)
  ) / 2;

  // Combine Levenshtein and Double Metaphone scores (equal weight)
  const combinedScore = (levenshteinSimilarity + metaphoneSimilarity) / 2;

  // Convert to a score out of 100 and round to 2 decimal places
  const finalScore = Math.round(combinedScore * 100 * 100) / 100;

  return finalScore;
}
