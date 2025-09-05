// Real Google AI Integration - Browser Compatible
import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuration
const GEMINI_API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY as string;
const PROJECT_ID = (import.meta as any).env.VITE_GOOGLE_CLOUD_PROJECT_ID as string;

// Initialize Google AI
let genAI: GoogleGenerativeAI | null = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'demo-key-for-development') {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

export interface MentalHealthResponse {
  message: string;
  suggestedActions: string[];
  riskAssessment: string;
  culturalReferences: string[];
  confidence: number;
  isRealAI: boolean;
}

export interface ConversationContext {
  language: 'hi' | 'en' | 'mixed';
  culturalBackground: string;
  currentMood: string;
  stressLevel: string;
  conversationHistory: string[];
  userInterests: string[];
  crisisLevel: string;
}

export class RealGoogleAI {
  private model: any = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (!genAI) {
      console.warn('⚠️ Gemini API key not configured. Using fallback responses');
      return;
    }

    try {
      this.model = genAI.getGenerativeModel({
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });
      this.isInitialized = true;
      console.log('✅ Real Google AI initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Google AI:', error);
    }
  }

  async generateMentalHealthResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<MentalHealthResponse> {
    if (!this.isInitialized || !this.model) {
      return this.getFallbackResponse(context);
    }

    try {
      const prompt = this.buildMentalHealthPrompt(userMessage, context);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;

      return this.parseResponse(response.text(), context);
    } catch (error) {
      console.error('Google AI API Error:', error);
      return this.getFallbackResponse(context);
    }
  }

  private buildMentalHealthPrompt(userMessage: string, context: ConversationContext): string {
    return `
You are MannMitra, an AI mental health companion for Indian youth. Respond empathetically and culturally sensitively.

Context:
- Language preference: ${context.language}
- Current mood: ${context.currentMood}
- Stress level: ${context.stressLevel}
- Crisis level: ${context.crisisLevel}
- User interests: ${context.userInterests.join(', ')}

User message: "${userMessage}"

Provide a JSON response with:
{
  "message": "Empathetic response in ${context.language} language",
  "suggestedActions": ["Action 1", "Action 2", "Action 3"],
  "riskAssessment": "Assessment of user's mental state",
  "culturalReferences": ["Relevant cultural wisdom or phrases"],
  "confidence": 0.8
}
`;
  }

  private parseResponse(responseText: string, context: ConversationContext): MentalHealthResponse {
    try {
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);

      return {
        message: parsed.message || responseText,
        suggestedActions: parsed.suggestedActions || [],
        riskAssessment: parsed.riskAssessment || 'neutral',
        culturalReferences: parsed.culturalReferences || [],
        confidence: parsed.confidence || 0.7,
        isRealAI: true
      };
    } catch (error) {
      return {
        message: responseText,
        suggestedActions: ['Take deep breaths', 'Talk to someone you trust'],
        riskAssessment: 'neutral',
        culturalReferences: [],
        confidence: 0.6,
        isRealAI: true
      };
    }
  }

  private getFallbackResponse(context: ConversationContext): MentalHealthResponse {
    const fallbackMessages = {
      hi: "मैं यहाँ आपको सुनने के लिए हूँ। आपकी भावनाएं महत्वपूर्ण हैं।",
      en: "I'm here to listen to you. Your feelings matter.",
      mixed: "मैं यहाँ हूँ आपके लिए। Your feelings are important।"
    };

    return {
      message: fallbackMessages[context.language] || fallbackMessages.mixed,
      suggestedActions: ['Take deep breaths / गहरी सांस लें', 'Talk to someone / किसी से बात करें'],
      riskAssessment: 'supportive_needed',
      culturalReferences: ['सब ठीक हो जाएगा (Everything will be okay)'],
      confidence: 0.5,
      isRealAI: false
    };
  }

  isConfigured(): boolean {
    return this.isInitialized && !!this.model;
  }
}

// Export singleton instance
export const realGoogleAI = new RealGoogleAI();