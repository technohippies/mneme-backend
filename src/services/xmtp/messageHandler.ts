import { Buffer } from 'buffer';
import { User, ContentTypeText } from '../../types';
import { Client, DecodedMessage } from '@xmtp/xmtp-js';
import { ContentTypeAttachment, ContentTypeRemoteAttachment } from "@xmtp/content-type-remote-attachment";
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import fs from 'fs';
import { getPhrase } from '../orbis/getPhrase.js';
import { scoreAudio } from '../../utils/scoreAudio.js';

dotenv.config();
const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  throw new Error('GROQ_API_KEY is not set in the environment variables');
}

const groq = new Groq();

async function transcribeAudioData(audioData: Uint8Array): Promise<string> {
  try {
    // Write audio data to a temporary file
    const tempFilePath = './temp_audio.wav';
    fs.writeFileSync(tempFilePath, Buffer.from(audioData));

    // Create a transcription job
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "distil-whisper-large-v3-en",
      response_format: "json",
      language: "en",
    });

    // Delete the temporary file
    fs.unlinkSync(tempFilePath);

    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return 'Error transcribing audio';
  }
}

function getMessageContent(message: DecodedMessage): string | { type: string; content: any } {
  if (message.contentType.sameAs(ContentTypeText)) {
    return message.content as string;
  } else if (message.contentType.sameAs(ContentTypeRemoteAttachment)) {
    return { type: 'remoteAttachment', content: message.content };
  } else if (message.contentType.sameAs(ContentTypeAttachment)) {
    return { type: 'nativeAttachment', content: message.content };
  }
  return message.contentFallback || 'Unsupported content type';
}

async function handleAttachment(content: any, type: 'remoteAttachment' | 'nativeAttachment'): Promise<Uint8Array | null> {
  try {
    let attachment = content;
    if (attachment.mimeType.startsWith('audio/')) {
      console.log(`Received audio attachment: ${attachment.filename}`);
      return new Uint8Array(attachment.data);
    }
  } catch (error) {
    console.error('Error handling attachment:', error);
  }

  return null;
}

// Add this at the top of the file, outside of any function
const messageCache = new Map<string, { streamId: string, originalPhrase: string }>();

export async function handleMessage(message: DecodedMessage, contentString: string): Promise<User | null> {
  console.log('[handleMessage] Received message:');
  console.log('[handleMessage] Sender:', message.senderAddress);
  console.log('[handleMessage] Sent at:', message.sent);
  console.log('[handleMessage] Content type:', message.contentType.toString());

  const content = getMessageContent(message);
  console.log('[handleMessage] Parsed content:', content);

  if (typeof content === 'string') {
    console.log('[handleMessage] Content (Text):', content);
    try {
      const parsedContent = JSON.parse(content);
      const { stream_id, pairId } = parsedContent;
      if (stream_id && pairId) {
        const originalPhrase = await getPhrase(stream_id);
        if (originalPhrase) {
          console.log('[handleMessage] Original phrase:', originalPhrase);
          messageCache.set(pairId, { streamId: stream_id, originalPhrase });
        } else {
          console.log('[handleMessage] No original phrase found for stream ID:', stream_id);
        }
      }
    } catch (error) {
      console.error('[handleMessage] Error parsing content:', error);
    }
  } else if (content.type === 'remoteAttachment' || content.type === 'nativeAttachment') {
    console.log(`[handleMessage] Content (${content.type}):`, content.content);
    const audioData = await handleAttachment(content.content, content.type);
    if (audioData) {
      console.log('[handleMessage] Audio data received, transcribing...');
      const transcript = await transcribeAudioData(audioData);
      console.log('[handleMessage] Transcription:', transcript);

      const pairId = content.content.filename.split('.')[0];
      const cachedData = messageCache.get(pairId);

      if (cachedData) {
        const { streamId, originalPhrase } = cachedData;
        console.log('[handleMessage] Found matching text message. Stream ID:', streamId);
        const score = await scoreAudio(transcript, originalPhrase);
        console.log('[handleMessage] Audio score:', score);
        // Clean up the cache after use
        messageCache.delete(pairId);
      } else {
        console.log('[handleMessage] No matching text message found for pairId:', pairId);
      }
    }
  } else {
    console.log('[handleMessage] Content (Unknown type):', content);
  }

  console.log('[handleMessage] Raw message content:', message.content);
  console.log('---');

  return null;
}

