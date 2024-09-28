import { Client } from '@xmtp/xmtp-js';
import { Wallet } from 'ethers';
import { config } from '../../config/environment';

export async function setupXMTP() {
  const privateKey = config.xmtpPrivateKey;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not found in environment variables');
  }
  const wallet = new Wallet(privateKey);
  console.log('Setting up XMTP client...');
  const client = await Client.create(wallet, { env: 'production' });
  console.log('XMTP client created successfully');
  return client;
}