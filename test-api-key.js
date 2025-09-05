#!/usr/bin/env node

// Quick API Key Test Script
// Run with: node test-api-key.js

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Gemini API Key Setup...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ No .env file found!');
  console.log('📝 Create a .env file in your project root');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

let geminiKey = null;
for (const line of lines) {
  if (line.startsWith('VITE_GEMINI_API_KEY=')) {
    geminiKey = line.split('=')[1];
    break;
  }
}

console.log('📋 Current API Key Status:');
console.log('─'.repeat(40));

if (!geminiKey) {
  console.log('❌ VITE_GEMINI_API_KEY not found in .env file');
  console.log('📝 Add this line to your .env file:');
  console.log('   VITE_GEMINI_API_KEY=your-actual-api-key-here');
} else if (geminiKey === 'demo-key-for-development' || geminiKey.startsWith('demo-')) {
  console.log('⚠️  Using demo key (no real AI responses)');
  console.log('🔑 Current key:', geminiKey);
  console.log('');
  console.log('🚀 To enable real AI responses:');
  console.log('1. Go to: https://makersuite.google.com/app/apikey');
  console.log('2. Create a new API key');
  console.log('3. Replace the demo key in .env with your real key');
  console.log('4. Restart your development server');
} else if (geminiKey.startsWith('AIza')) {
  console.log('✅ Valid Gemini API key detected!');
  console.log('🔑 Key format: AIza***' + '*'.repeat(geminiKey.length - 8));
  console.log('🎉 Real AI responses should be working!');
} else {
  console.log('⚠️  Unusual API key format detected');
  console.log('🔑 Current key:', geminiKey.substring(0, 10) + '...');
  console.log('💡 Gemini API keys typically start with "AIza"');
}

console.log('');
console.log('🔧 Next steps:');
console.log('1. Restart your dev server: npm run dev');
console.log('2. Open the app and test AI chat');
console.log('3. Check browser console for AI request logs');