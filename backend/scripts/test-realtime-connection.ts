/**
 * Test script to verify OpenAI Realtime API WebSocket connection
 * Run with: npx tsx scripts/test-realtime-connection.ts
 */

import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.error('OPENAI_API_KEY not found in environment');
  process.exit(1);
}

console.log('Testing OpenAI Realtime API WebSocket connection...');
console.log('API Key present:', !!API_KEY, 'Length:', API_KEY.length);

const url = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';

console.log('\nConnecting to:', url);
console.log('Headers:', {
  'Authorization': 'Bearer ***',
  'OpenAI-Beta': 'realtime=v1',
});

const ws = new WebSocket(url, {
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'OpenAI-Beta': 'realtime=v1',
  },
  perMessageDeflate: false,
});

console.log('WebSocket created, initial state:', ws.readyState);
console.log('State meanings: 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED');

// Monitor state changes
const stateInterval = setInterval(() => {
  console.log(`State check: ${ws.readyState} (${ws.readyState === 0 ? 'CONNECTING' : ws.readyState === 1 ? 'OPEN' : ws.readyState === 2 ? 'CLOSING' : 'CLOSED'})`);
  if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.OPEN) {
    clearInterval(stateInterval);
  }
}, 100);

setTimeout(() => clearInterval(stateInterval), 10000);

ws.on('open', () => {
  console.log('\n✅ CONNECTION OPENED!');
  console.log('Sending session.update...');
  
  const config = {
    type: 'session.update',
    session: {
      modalities: ['text'], // Start with text only
      instructions: 'You are a helpful assistant.',
    },
  };
  
  ws.send(JSON.stringify(config));
  console.log('Session config sent');
});

ws.on('message', (data: Buffer | string) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('\n📨 Message received:', message.type);
    if (message.type === 'error') {
      console.error('❌ Error:', JSON.stringify(message, null, 2));
    } else if (message.type === 'session.created') {
      console.log('✅ Session created!');
    } else if (message.type === 'session.updated') {
      console.log('✅ Session updated!');
    } else {
      console.log('Message:', JSON.stringify(message, null, 2).substring(0, 200));
    }
  } catch (e) {
    console.log('📦 Binary data received:', data.length, 'bytes');
  }
});

ws.on('error', (error: Error) => {
  console.error('\n❌ ERROR:', error.message);
  console.error('Stack:', error.stack);
});

ws.on('close', (code: number, reason: Buffer) => {
  console.log('\n❌ CONNECTION CLOSED');
  console.log('Code:', code);
  console.log('Reason:', reason.toString());
  console.log('Code meanings:');
  console.log('  1000 = Normal closure');
  console.log('  1006 = Abnormal closure');
  console.log('  1008 = Policy violation');
  console.log('  1011 = Internal server error');
  clearInterval(stateInterval);
  process.exit(0);
});

// Keep process alive
setTimeout(() => {
  console.log('\n⏱️ 10 seconds elapsed, closing...');
  ws.close();
  process.exit(0);
}, 10000);

