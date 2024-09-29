import { Client } from '@xmtp/xmtp-js';
import { Wallet } from 'ethers';
import { config } from '../../config/environment';
import { RemoteAttachmentCodec, AttachmentCodec } from "@xmtp/content-type-remote-attachment";

let xmtpClient: Client | null = null;

export async function setupXMTP() {
  const privateKey = config.xmtpPrivateKey;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not found in environment variables');
  }
  const wallet = new Wallet(privateKey);
  console.log('Setting up XMTP client...');
  xmtpClient = await Client.create(wallet, { 
    env: 'dev',
    codecs: [new RemoteAttachmentCodec(), new AttachmentCodec()]
  });
  console.log('XMTP client created successfully');
  return xmtpClient;
}

export function getXMTPClient() {
  if (!xmtpClient) {
    throw new Error('XMTP client not initialized. Call setupXMTP first.');
  }
  return xmtpClient;
}