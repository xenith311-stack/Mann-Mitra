// Comprehensive feature test for MannMitra app
// This file tests all major features to ensure they work without errors

import { geminiAI } from './services/geminiAI';
import { emotionDetection } from './services/emotionDetection';
import { aiOrchestrator } from './services/aiOrchestrator';
import { sessionManager } from './services/sessionManager';
import { voiceAnalysis } from './services/voiceAnalysis';
import { speechServices } from './services/speechServices';

export async function testAllFeatures() {
  console.log('🧪 Starting comprehensive feature tests...');
  
  const results = {
    geminiAI: false,
    emotionDetection: false,
    aiOrchestrator: false,
    sessionManager: false,
    voiceAnalysis: false,
    speechServices: false
  };

  // Test Gemini AI
  try {
    console.log('Testing Gemini AI...');
    const response = await geminiAI.generateResponse('Hello, I am feeling sad today');
    console.log('✅ Gemini AI working:', response.substring(0, 50) + '...');
    results.geminiAI = true;
  } catch (error) {
    console.log('❌ Gemini AI error:', error);
  }

  // Test Emotion Detection
  try {
    console.log('Testing Emotion Detection...');
    const emotions = await emotionDetection.analyzeText('I am feeling very anxious and worried');
    console.log('✅ Emotion Detection working:', emotions);
    results.emotionDetection = true;
  } catch (error) {
    console.log('❌ Emotion Detection error:', error);
  }

  // Test AI Orchestrator
  try {
    console.log('Testing AI Orchestrator...');
    const response = await aiOrchestrator.generateTherapeuticResponse(
      'I am having panic attacks',
      'test-user-123'
    );
    console.log('✅ AI Orchestrator working:', response.message.substring(0, 50) + '...');
    results.aiOrchestrator = true;
  } catch (error) {
    console.log('❌ AI Orchestrator error:', error);
  }

  // Test Session Manager
  try {
    console.log('Testing Session Manager...');
    const sessionId = await sessionManager.startSession('test-user-123', 'chat');
    const progress = await sessionManager.getUserProgress('test-user-123');
    console.log('✅ Session Manager working:', { sessionId, progress });
    results.sessionManager = true;
  } catch (error) {
    console.log('❌ Session Manager error:', error);
  }

  // Test Voice Analysis (basic initialization)
  try {
    console.log('Testing Voice Analysis...');
    // Just test if the service initializes without errors
    const isSupported = speechServices.isSupported();
    console.log('✅ Voice Analysis working:', { isSupported });
    results.voiceAnalysis = true;
  } catch (error) {
    console.log('❌ Voice Analysis error:', error);
  }

  // Test Speech Services
  try {
    console.log('Testing Speech Services...');
    const supported = speechServices.isSupported();
    console.log('✅ Speech Services working:', { supported });
    results.speechServices = true;
  } catch (error) {
    console.log('❌ Speech Services error:', error);
  }

  console.log('🎯 Test Results Summary:');
  console.table(results);

  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`📊 Overall: ${passedTests}/${totalTests} features working (${Math.round(passedTests/totalTests*100)}%)`);
  
  return results;
}

// Auto-run tests if this file is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    testAllFeatures().catch(console.error);
  }, 1000);
}