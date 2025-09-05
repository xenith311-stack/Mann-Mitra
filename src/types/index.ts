// Global type definitions for MannMitra

export type Screen = 'onboarding' | 'home' | 'post-quiz-home' | 'quiz' | 'stats' | 'dashboard' | 'calm-down' | 'journal' | 'chatbot' | 'ai-companion';

export interface UserPreferences {
  interests: string[];
  comfortEnvironment: string;
  preferredLanguage: string;
  avatarStyle: string;
}

export interface UserData {
  onboardingCompleted: boolean;
  preferences?: UserPreferences;
  quizCompleted: boolean;
  currentQuizQuestion: number;
  quizAnswers: number[];
  overallScore: number;
  metrics: {
    stress: number;
    sleep: number;
    happiness: number;
    productivity: number;
    activity: number;
    phq9: number;
    gad7: number;
  };
  streaks: {
    current: number;
    longest: number;
  };
  milestones: string[];
}

// Advanced types for new features
export interface User {
  id: string;
  name: string;
  email: string;
  onboardingComplete: boolean;
  preferences: {
    language: 'hindi' | 'english' | 'mixed';
    culturalBackground: string;
    communicationStyle: 'formal' | 'casual';
  };
  mentalHealthProfile: {
    primaryConcerns: string[];
    goals: string[];
    riskFactors: string[];
    protectiveFactors: string[];
  };
}

export interface VoiceAnalysis {
  transcript: string;
  confidence: number;
  language: string;
  emotionalIndicators: {
    tone: string;
    intensity: number;
    speechRate: string;
    volume: string;
  };
  linguisticFeatures: {
    wordCount: number;
    sentimentScore: number;
    hesitationMarkers: number;
    fillerWords: number;
  };
  mentalHealthIndicators: {
    stressLevel: number;
    anxietyLevel: number;
    depressionIndicators: string[];
  };
}

export interface EmotionAnalysis {
  primaryEmotion: string;
  confidence: number;
  intensity: number;
  valence: number;
  arousal: number;
  culturalContext: {
    respectLevel: number;
    formalityLevel: number;
    culturalReferences: string[];
  };
}

export interface CrisisAssessment {
  level: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  indicators: string[];
  immediateActions: string[];
  resources: {
    helplines: Array<{
      name: string;
      number: string;
      availability: string;
    }>;
    professionals: string[];
    emergencyContacts: string[];
  };
}