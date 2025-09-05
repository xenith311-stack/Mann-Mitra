// Browser-Compatible Google AI Integration for MannMitra
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Configuration
const GEMINI_API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY as string || 'demo-key';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface MentalHealthContext {
  userId: string;
  sessionId: string;
  userProfile: {
    age: number;
    gender: string;
    location: string;
    preferredLanguage: 'hi' | 'en' | 'mixed';
    culturalBackground: string;
    interests: string[];
    comfortEnvironment: string;
    previousSessions: number;
  };
  currentState: {
    mood: string;
    stressLevel: 'low' | 'moderate' | 'high' | 'severe';
    energyLevel: 'low' | 'moderate' | 'high';
    crisisRisk: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    emotionalTone: string;
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: any;
  }>;
  therapeuticGoals: string[];
  assessmentScores: {
    phq9: number;
    gad7: number;
    overallWellness: number;
  };
}

export interface AIResponse {
  message: string;
  originalLanguage: string;
  translatedMessage?: string;
  emotionalTone: 'supportive' | 'empathetic' | 'encouraging' | 'calming' | 'urgent';
  suggestedActions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    category: 'immediate' | 'short_term' | 'long_term';
  }>;
  copingStrategies: string[];
  followUpQuestions: string[];
  riskAssessment: {
    level: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    indicators: string[];
    recommendedIntervention: string;
  };
  culturalReferences: string[];
  audioResponse?: string; // Base64 encoded audio
  confidence: number;
}

export interface VoiceAnalysis {
  transcript: string;
  confidence: number;
  language: string;
  emotionalIndicators: {
    tone: 'calm' | 'stressed' | 'sad' | 'anxious' | 'happy' | 'angry';
    intensity: number;
    speechRate: 'slow' | 'normal' | 'fast';
    volume: 'quiet' | 'normal' | 'loud';
  };
  linguisticFeatures: {
    wordCount: number;
    sentimentScore: number;
    complexityScore: number;
    hesitationMarkers: number;
  };
}

export interface EmotionAnalysis {
  faceDetected: boolean;
  emotions: {
    joy: number;
    sorrow: number;
    anger: number;
    surprise: number;
    fear: number;
    disgust: number;
  };
  primaryEmotion: string;
  confidence: number;
  wellnessIndicators: {
    stressLevel: number;
    fatigueLevel: number;
    engagementLevel: number;
  };
  facialFeatures: {
    eyeContact: boolean;
    facialTension: number;
    microExpressions: string[];
  };
}

export class GoogleCloudMentalHealthAI {
  private model: any;
  private isInitialized = false;

  constructor() {
    this.initializeServices();
  }

  private async initializeServices() {
    try {
      // Initialize Gemini model for browser
      this.model = genAI.getGenerativeModel({
        model: 'gemini-pro',
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      this.isInitialized = true;
      console.log('Google AI services initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google AI services:', error);
      throw error;
    }
  }

  async generateEmpathicResponse(
    userMessage: string,
    context: MentalHealthContext
  ): Promise<AIResponse> {
    if (!this.isInitialized) {
      await this.initializeServices();
    }

    try {
      // 1. Detect and translate if needed
      const { detectedLanguage, translatedMessage } = await this.handleLanguageDetectionAndTranslation(
        userMessage,
        context.userProfile.preferredLanguage
      );

      // 2. Build comprehensive prompt for Gemini
      const prompt = this.buildAdvancedTherapeuticPrompt(translatedMessage, context);

      // 3. Generate response using Vertex AI Gemini
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      // 4. Parse and structure the response
      const structuredResponse = await this.parseAndEnhanceResponse(
        generatedText,
        context,
        detectedLanguage
      );

      // 5. Generate audio response if needed
      if (context.userProfile.preferredLanguage !== 'en') {
        structuredResponse.audioResponse = await this.generateAudioResponse(
          structuredResponse.message,
          context.userProfile.preferredLanguage
        );
      }

      return structuredResponse;
    } catch (error) {
      console.error('Error generating empathic response:', error);
      return this.getFallbackResponse(context);
    }
  }

  private async handleLanguageDetectionAndTranslation(
    message: string,
    preferredLanguage: string
  ): Promise<{ detectedLanguage: string; translatedMessage: string }> {
    try {
      // Simple language detection based on script
      const hindiPattern = /[\u0900-\u097F]/;
      const englishPattern = /[a-zA-Z]/;

      const hasHindi = hindiPattern.test(message);
      const hasEnglish = englishPattern.test(message);

      let detectedLanguage = 'en';
      if (hasHindi && hasEnglish) {
        detectedLanguage = 'mixed';
      } else if (hasHindi) {
        detectedLanguage = 'hi';
      }

      // For now, we'll work with the original message
      // In production, you'd integrate with Google Translate API
      return { detectedLanguage, translatedMessage: message };
    } catch (error) {
      console.error('Language detection error:', error);
      return { detectedLanguage: 'en', translatedMessage: message };
    }
  }

  private buildAdvancedTherapeuticPrompt(message: string, context: MentalHealthContext): string {
    return `
You are "MannMitra" (मन मित्र), an advanced AI mental health companion specifically designed for Indian youth. You are trained in evidence-based therapeutic approaches including CBT, DBT, mindfulness, and culturally adapted interventions.

COMPREHENSIVE USER CONTEXT:
Demographics:
- Age: ${context.userProfile.age}
- Gender: ${context.userProfile.gender}
- Location: ${context.userProfile.location}
- Cultural Background: ${context.userProfile.culturalBackground}
- Preferred Language: ${context.userProfile.preferredLanguage}
- Previous Sessions: ${context.userProfile.previousSessions}

Current Mental State:
- Mood: ${context.currentState.mood}
- Stress Level: ${context.currentState.stressLevel}
- Energy Level: ${context.currentState.energyLevel}
- Crisis Risk: ${context.currentState.crisisRisk}
- Emotional Tone: ${context.currentState.emotionalTone}

Assessment Scores:
- PHQ-9 (Depression): ${context.assessmentScores.phq9}/27
- GAD-7 (Anxiety): ${context.assessmentScores.gad7}/21
- Overall Wellness: ${context.assessmentScores.overallWellness}/100

Therapeutic Goals: ${context.therapeuticGoals.join(', ')}

Recent Conversation History:
${context.conversationHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

CULTURAL SENSITIVITY GUIDELINES:
- Understand Indian family dynamics, academic pressure, and social expectations
- Be aware of mental health stigma in Indian society
- Reference appropriate cultural concepts: dharma, karma, family honor, community support
- Use respectful language addressing generational differences
- Acknowledge festivals, traditions, and spiritual beliefs
- Understand concepts like "log kya kahenge" (what will people say)
- Be sensitive to economic disparities and accessibility issues

THERAPEUTIC APPROACH:
Based on the user's current state and history, employ:
1. Cognitive Behavioral Therapy (CBT) techniques for thought restructuring
2. Dialectical Behavior Therapy (DBT) skills for emotional regulation
3. Mindfulness and meditation practices adapted for Indian context
4. Solution-focused brief therapy for goal-oriented support
5. Narrative therapy to help reframe personal stories
6. Cultural adaptation of Western therapeutic models

CRISIS ASSESSMENT:
Current Risk Level: ${context.currentState.crisisRisk}
${context.currentState.crisisRisk !== 'none' ? `
IMPORTANT: User shows ${context.currentState.crisisRisk} crisis risk. 
- Provide immediate safety planning
- Offer crisis resources (Indian helplines)
- Use de-escalation techniques
- Encourage professional help
- Follow up with safety checks
` : ''}

USER MESSAGE: "${message}"

RESPONSE REQUIREMENTS:
Generate a comprehensive therapeutic response in JSON format:

{
  "message": "Your empathetic, culturally sensitive response (150-200 words)",
  "emotionalTone": "supportive|empathetic|encouraging|calming|urgent",
  "suggestedActions": [
    {
      "action": "Specific actionable step",
      "priority": "high|medium|low",
      "category": "immediate|short_term|long_term"
    }
  ],
  "copingStrategies": ["Strategy 1", "Strategy 2", "Strategy 3"],
  "followUpQuestions": ["Question 1", "Question 2"],
  "riskAssessment": {
    "level": "none|low|moderate|high|severe",
    "indicators": ["Indicator 1", "Indicator 2"],
    "recommendedIntervention": "Specific recommendation"
  },
  "culturalReferences": ["Relevant cultural element or wisdom"],
  "confidence": 0.85
}

LANGUAGE INSTRUCTIONS:
- Primary language: ${context.userProfile.preferredLanguage}
- If "mixed": Use natural Hinglish (Hindi-English code-switching)
- If "hi": Respond primarily in Hindi with Devanagari script
- If "en": Use English with occasional Hindi phrases for warmth
- Include culturally appropriate greetings and expressions
- Use respectful forms of address (आप, जी, etc.)

THERAPEUTIC TECHNIQUES TO EMPLOY:
1. Validation and normalization of emotions
2. Cognitive restructuring for negative thought patterns
3. Behavioral activation for depression
4. Grounding techniques for anxiety
5. Mindfulness exercises adapted for Indian context
6. Problem-solving strategies
7. Social support mobilization
8. Strength-based interventions
9. Cultural pride and identity affirmation
10. Spiritual/philosophical integration when appropriate

Remember: You are not just providing information, but engaging in a therapeutic relationship that honors the user's cultural identity while providing evidence-based mental health support.
`;
  }

  private async parseAndEnhanceResponse(
    generatedText: string,
    context: MentalHealthContext,
    originalLanguage: string
  ): Promise<AIResponse> {
    try {
      // Try to parse JSON response
      const cleanedResponse = generatedText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);

      // Enhance with additional processing
      const enhanced: AIResponse = {
        message: parsed.message,
        originalLanguage,
        emotionalTone: parsed.emotionalTone || 'supportive',
        suggestedActions: parsed.suggestedActions || [],
        copingStrategies: parsed.copingStrategies || [],
        followUpQuestions: parsed.followUpQuestions || [],
        riskAssessment: parsed.riskAssessment || {
          level: 'none',
          indicators: [],
          recommendedIntervention: 'Continue supportive conversation'
        },
        culturalReferences: parsed.culturalReferences || [],
        confidence: parsed.confidence || 0.8
      };

      // Translation would be handled here if needed
      // For now, we work with the original message since Gemini can handle multilingual responses

      return enhanced;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getFallbackResponse(context);
    }
  }

  async analyzeVoiceInput(audioBuffer: ArrayBuffer, context: MentalHealthContext): Promise<VoiceAnalysis> {
    try {
      // For demo purposes, we'll simulate voice analysis
      // In production, this would use Google Cloud Speech-to-Text API

      // Simulate transcription (in real app, this would be actual speech recognition)
      const transcript = "I'm feeling stressed today"; // This would come from actual speech recognition
      const confidence = 0.85;

      // Analyze emotional indicators from speech patterns
      const emotionalIndicators = this.analyzeVoiceEmotions(
        transcript,
        [], // Would contain word timing data in real implementation
        context
      );

      // Analyze linguistic features
      const linguisticFeatures = this.analyzeLinguisticFeatures(transcript);

      return {
        transcript,
        confidence,
        language: context.userProfile.preferredLanguage === 'hi' ? 'hi-IN' : 'en-IN',
        emotionalIndicators,
        linguisticFeatures
      };
    } catch (error) {
      console.error('Voice analysis error:', error);
      throw error;
    }
  }

  private analyzeVoiceEmotions(
    transcript: string,
    words: any[],
    context: MentalHealthContext
  ) {
    // Analyze speech patterns for emotional indicators
    const lowerTranscript = transcript.toLowerCase();

    // Detect emotional keywords
    const stressKeywords = ['stressed', 'tension', 'pressure', 'तनाव', 'परेशान', 'चिंता'];
    const sadKeywords = ['sad', 'depressed', 'down', 'उदास', 'दुखी', 'निराश'];
    const anxietyKeywords = ['anxious', 'worried', 'nervous', 'चिंतित', 'घबराहट', 'डर'];
    const happyKeywords = ['happy', 'good', 'great', 'खुश', 'अच्छा', 'बेहतर'];

    let tone: 'calm' | 'stressed' | 'sad' | 'anxious' | 'happy' | 'angry' = 'calm';
    let intensity = 0.5;

    if (stressKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      tone = 'stressed';
      intensity = 0.7;
    } else if (sadKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      tone = 'sad';
      intensity = 0.8;
    } else if (anxietyKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      tone = 'anxious';
      intensity = 0.7;
    } else if (happyKeywords.some(keyword => lowerTranscript.includes(keyword))) {
      tone = 'happy';
      intensity = 0.6;
    }

    // Analyze speech rate from word timing
    const speechRate = words.length > 0 ? this.calculateSpeechRate(words) : 'normal';

    return {
      tone,
      intensity,
      speechRate,
      volume: 'normal' as const // Would need audio analysis for actual volume
    };
  }

  private calculateSpeechRate(words: any[]): 'slow' | 'normal' | 'fast' {
    if (words.length < 2) return 'normal';

    const firstWord = words[0];
    const lastWord = words[words.length - 1];

    if (!firstWord.startTime || !lastWord.endTime) return 'normal';

    const duration = parseFloat(lastWord.endTime.seconds || '0') - parseFloat(firstWord.startTime.seconds || '0');
    const wordsPerSecond = words.length / duration;

    if (wordsPerSecond < 1.5) return 'slow';
    if (wordsPerSecond > 3) return 'fast';
    return 'normal';
  }

  private analyzeLinguisticFeatures(transcript: string) {
    const words = transcript.split(/\s+/);
    const sentences = transcript.split(/[.!?]+/);

    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'happy', 'better', 'अच्छा', 'खुश', 'बेहतर'];
    const negativeWords = ['bad', 'sad', 'terrible', 'worse', 'बुरा', 'उदास', 'खराब'];

    const positiveCount = positiveWords.filter(word =>
      transcript.toLowerCase().includes(word)
    ).length;

    const negativeCount = negativeWords.filter(word =>
      transcript.toLowerCase().includes(word)
    ).length;

    const sentimentScore = (positiveCount - negativeCount) / Math.max(words.length, 1);

    // Detect hesitation markers
    const hesitationMarkers = (transcript.match(/\b(um|uh|er|आ|उम्म)\b/gi) || []).length;

    return {
      wordCount: words.length,
      sentimentScore,
      complexityScore: sentences.length / words.length, // Simple complexity measure
      hesitationMarkers
    };
  }

  async analyzeEmotionFromImage(imageBase64: string): Promise<EmotionAnalysis> {
    try {
      // For demo purposes, simulate emotion analysis
      // In production, this would use Google Cloud Vision API

      // Simulate realistic emotion detection
      const emotions = {
        joy: Math.random() * 0.4 + 0.1,
        sorrow: Math.random() * 0.3,
        anger: Math.random() * 0.2,
        surprise: Math.random() * 0.3,
        fear: Math.random() * 0.2,
        disgust: Math.random() * 0.1
      };

      // Normalize emotions
      const total = Object.values(emotions).reduce((sum, val) => sum + val, 0);
      Object.keys(emotions).forEach(key => {
        emotions[key as keyof typeof emotions] /= total;
      });

      // Find primary emotion
      const primaryEmotion = Object.entries(emotions)
        .reduce((a, b) => emotions[a[0] as keyof typeof emotions] > emotions[b[0] as keyof typeof emotions] ? a : b)[0];

      const confidence = emotions[primaryEmotion as keyof typeof emotions];

      // Calculate wellness indicators
      const stressLevel = (emotions.anger + emotions.fear) / 2;
      const fatigueLevel = 1 - (emotions.joy + emotions.surprise) / 2;
      const engagementLevel = (emotions.joy + emotions.surprise + emotions.anger) / 3;

      return {
        faceDetected: true,
        emotions,
        primaryEmotion,
        confidence,
        wellnessIndicators: {
          stressLevel,
          fatigueLevel,
          engagementLevel
        },
        facialFeatures: {
          eyeContact: Math.random() > 0.5,
          facialTension: stressLevel,
          microExpressions: ['slight_frown', 'eye_tension']
        }
      };
    } catch (error) {
      console.error('Emotion analysis error:', error);
      throw error;
    }
  }

  async generateAudioResponse(text: string, language: string): Promise<string> {
    try {
      // For demo purposes, we'll use Web Speech API for text-to-speech
      // In production, this would use Google Cloud Text-to-Speech API

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        // Find appropriate voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice =>
          voice.lang.startsWith(language === 'hi' ? 'hi' : 'en')
        );

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        speechSynthesis.speak(utterance);

        // Return empty string as we're using direct speech synthesis
        return '';
      }

      throw new Error('Speech synthesis not supported');
    } catch (error) {
      console.error('Audio generation error:', error);
      throw error;
    }
  }

  async generatePersonalizedCopingStrategies(
    context: MentalHealthContext,
    currentSituation: string
  ): Promise<string[]> {
    const prompt = `
Generate 5 personalized coping strategies for an Indian youth with the following context:

User Profile:
- Age: ${context.userProfile.age}
- Interests: ${context.userProfile.interests.join(', ')}
- Comfort Environment: ${context.userProfile.comfortEnvironment}
- Cultural Background: ${context.userProfile.culturalBackground}
- Current Situation: ${currentSituation}
- Stress Level: ${context.currentState.stressLevel}
- Energy Level: ${context.currentState.energyLevel}

Requirements:
1. Culturally appropriate for Indian context
2. Practical and immediately actionable
3. Based on their interests and preferences
4. Suitable for their current emotional state
5. Include both traditional and modern approaches
6. Consider family and social dynamics
7. Be specific and detailed

Format as a JSON array of strings.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const strategies = JSON.parse(response.text());
      return Array.isArray(strategies) ? strategies : [];
    } catch (error) {
      console.error('Coping strategies generation error:', error);
      return [
        'Practice deep breathing for 5 minutes / 5 मिनट गहरी सांस लें',
        'Listen to calming music or bhajans / शांत संगीत या भजन सुनें',
        'Talk to a trusted family member or friend / किसी भरोसेमंद व्यक्ति से बात करें',
        'Take a walk in nature or on the terrace / प्रकृति में या छत पर टहलें',
        'Practice gratitude by listing 3 good things / 3 अच्छी बातों की सूची बनाएं'
      ];
    }
  }

  async generateCulturalStory(
    theme: string,
    context: MentalHealthContext
  ): Promise<string> {
    const prompt = `
Create a short, inspiring story (2-3 paragraphs) for an Indian youth dealing with ${theme}.

Context:
- User's cultural background: ${context.userProfile.culturalBackground}
- Current emotional state: ${context.currentState.mood}
- Preferred language: ${context.userProfile.preferredLanguage}

Requirements:
- Include Indian cultural elements (festivals, family values, traditions, mythology)
- Reference appropriate philosophical concepts (dharma, karma, resilience)
- Positive, hopeful message that resonates with Indian youth
- Relatable to modern challenges while honoring tradition
- Include a practical lesson or insight
- Use ${context.userProfile.preferredLanguage} language appropriately

Theme: ${theme}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Cultural story generation error:', error);
      return 'एक समय की बात है... / Once upon a time, there was a young person who learned that every challenge is an opportunity to grow stronger, just like how a lotus blooms beautifully even in muddy water. 🌸';
    }
  }

  private getFallbackResponse(context: MentalHealthContext): AIResponse {
    const language = context.userProfile.preferredLanguage;

    const fallbackMessages = {
      en: "I'm here to listen and support you. Your feelings are valid, and you're not alone in this journey. Let's work through this together.",
      hi: "मैं यहाँ आपको सुनने और सहारा देने के लिए हूँ। आपकी भावनाएं सही हैं, और इस सफर में आप अकेले नहीं हैं। आइए मिलकर इसका समाधान करते हैं।",
      mixed: "मैं यहाँ हूँ आपके साथ। Your feelings are valid और आप alone नहीं हैं। Let's work through this together।"
    };

    return {
      message: fallbackMessages[language],
      originalLanguage: language,
      emotionalTone: 'supportive',
      suggestedActions: [
        {
          action: 'Take 5 deep breaths / 5 गहरी सांसें लें',
          priority: 'high',
          category: 'immediate'
        }
      ],
      copingStrategies: ['Deep breathing', 'Mindful observation', 'Gentle self-talk'],
      followUpQuestions: ['How are you feeling right now?', 'What would help you most today?'],
      riskAssessment: {
        level: 'none',
        indicators: [],
        recommendedIntervention: 'Continue supportive conversation'
      },
      culturalReferences: ['Remember: हर रात के बाद सुबह होती है (After every night comes morning)'],
      confidence: 0.7
    };
  }
}

// Export singleton instance
export const googleCloudAI = new GoogleCloudMentalHealthAI();