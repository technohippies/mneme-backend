import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first, then fall back to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: process.env.PORT || 3000,
  xmtpPrivateKey: process.env.PRIVATE_KEY as string,
  groqApiKey: process.env.GROQ_API_KEY as string,
};

