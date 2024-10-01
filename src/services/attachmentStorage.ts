import fs from 'fs/promises';
import path from 'path';

const ATTACHMENT_DIR = path.join(process.cwd(), 'attachments');

export async function storeAttachmentData(id: string, data: Uint8Array): Promise<void> {
  await fs.mkdir(ATTACHMENT_DIR, { recursive: true });
  const filePath = path.join(ATTACHMENT_DIR, `${id}.bin`);
  await fs.writeFile(filePath, Buffer.from(data));
}

export async function getAttachmentData(id: string): Promise<Uint8Array | null> {
  const filePath = path.join(ATTACHMENT_DIR, `${id}.bin`);
  try {
    const data = await fs.readFile(filePath);
    return new Uint8Array(data);
  } catch (error) {
    console.error(`Failed to read attachment ${id}:`, error);
    return null;
  }
}