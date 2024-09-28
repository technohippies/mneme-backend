import { setupXMTP } from './client';
import { handleMessage } from './messageHandler';

function getMessageContent(content: any): string {
  if (typeof content === 'string') {
    return content;
  } else if ('filename' in content && 'data' in content) {
    return `Attachment: ${content.filename}`;
  } else if ('url' in content) {
    return `Remote Attachment: ${content.url}`;
  }
  return 'Unknown content type';
}

export async function startXMTPListener() {
  const xmtp = await setupXMTP();
  
  for await (const message of await xmtp.conversations.streamAllMessages()) {
    if (message.senderAddress === xmtp.address) continue;

    const contentString = getMessageContent(message.content);
    const updatedUser = await handleMessage(message, contentString);
    console.log(`Processed message from ${message.senderAddress}: ${contentString}`);
  }
}