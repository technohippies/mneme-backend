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

function sanitizeLogContent(content: any): any {
  if (content && typeof content === 'object') {
    const sanitized = { ...content };
    for (const key in sanitized) {
      if (sanitized[key] instanceof Uint8Array) {
        sanitized[key] = `Uint8Array(${sanitized[key].length})`;
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeLogContent(sanitized[key]);
      }
    }
    return sanitized;
  }
  return content;
}

export async function startXMTPListener() {
  while (true) {
    try {
      console.log('Starting XMTP listener...');
      const xmtp = await setupXMTP();
      console.log(`XMTP client set up for address: ${xmtp.address}`);
      
      console.log('Beginning to stream all messages...');
      const stream = await xmtp.conversations.streamAllMessages();
      console.log('Stream created successfully');

      for await (const message of stream) {
        console.log('--------------------');
        console.log(`Received a message at ${new Date().toISOString()}`);
        console.log(`Sender address: ${message.senderAddress}`);
        console.log(`Recipient address: ${message.recipientAddress}`);
        console.log(`Message content type: ${typeof message.content}`);
        console.log(`Raw message content:`, sanitizeLogContent(message.content));
        
        if (message.senderAddress === xmtp.address) {
          console.log('Skipping message from self');
          continue;
        }

        const contentString = getMessageContent(message.content);
        console.log(`Processing message: ${contentString}`);
        
        try {
          await handleMessage(message, contentString);
          console.log(`Successfully processed message from ${message.senderAddress}: ${contentString}`);
        } catch (error) {
          console.error('Error handling message:', error);
        }
      }
    } catch (error) {
      console.error('Error in XMTP listener:', error);
      console.log('Attempting to reconnect in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}