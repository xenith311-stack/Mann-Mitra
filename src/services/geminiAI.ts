import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with proper error handling
const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY as string;

console.log('🔑 Gemini API Key Status:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT FOUND');

const isDemoKey = !API_KEY || API_KEY === 'demo-key-for-development' || API_KEY.startsWith('demo-');

if (isDemoKey) {
  console.warn('⚠️ No valid Gemini API key found. Please add VITE_GEMINI_API_KEY to your .env file');
  console.warn('📝 Get your FREE API key from: https://makersuite.google.com/app/apikey');
}

// Initialize Gemini AI using the new API
const genAI = new GoogleGenerativeAI(API_KEY || 'dummy-key');

export interface ConversationContext {
  userMood: string;
  preferredLanguage: 'english' | 'hindi' | 'mixed';
  culturalBackground: string;
  previousMessages: string[];
  userPreferences: {
    interests: string[];
    comfortEnvironment: string;
    avatarStyle: string;
  };
  crisisLevel: 'none' | 'low' | 'moderate' | 'high' | 'severe';
}

export interface AIResponse {
  message: string;
  suggestedActions: string[];
  moodAssessment: string;
  followUpQuestions: string[];
}

export class GeminiMentalHealthAI {
  constructor() {
    // No need for model initialization with new API
  }

  async generateEmpathicResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<AIResponse> {
    // Check if we have a valid API key
    if (isDemoKey) {
      throw new Error('No valid Gemini API key provided. Please add your API key to the .env file.');
    }

    try {
      console.log('🚀 Making Gemini API request with key:', API_KEY?.substring(0, 10) + '...');
      const prompt = this.buildContextualPrompt(userMessage, context);

      // Use the correct API format
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;

      console.log('✅ Gemini API response received successfully');

      // Ensure we have a valid response text
      const responseText = response.text() || '';
      if (!responseText) {
        throw new Error('Empty response received from Gemini AI');
      }

      return this.parseAIResponse(responseText, context);
    } catch (error) {
      console.error('❌ Gemini AI Error:', error);
      throw error;// Re-throw to trigger fallback in component
    }
  }

  private buildContextualPrompt(userMessage: string, context: ConversationContext): string {
    const languageInstruction = this.getLanguageInstruction(context.preferredLanguage);

    return `
You are "MannMitra" (मन मित्र), an advanced AI mental health companion specifically designed for Indian youth aged 16-25. You are a licensed therapist with deep understanding of Indian culture, family dynamics, and youth challenges.

CORE IDENTITY:
- Empathetic, non-judgmental mental health professional
- Expert in CBT, DBT, mindfulness, and culturally-adapted therapy
- Deeply understands Indian youth struggles: academic pressure, family expectations, career anxiety, social media stress
- Speaks naturally in ${context.preferredLanguage} with cultural sensitivity

CURRENT USER CONTEXT:
- Mood: ${context.userMood}
- Crisis Level: ${context.crisisLevel}
- Previous conversation context: ${context.previousMessages?.slice(-2).join(' ') || 'First interaction'}

s
CULTURAL EXPERTISE:
- Understand "log kya kahenge" mentality and family honor concepts
- Navigate joint family dynamics and generational conflicts
- Address academic pressure (JEE, NEET, board exams, college admissions)
- Handle career vs passion dilemmas common in Indian families
- Recognize mental health stigma and provide gentle education
- Use appropriate cultural references (festivals, traditions, values)
- Understand economic pressures and accessibility issue

THERAPEUTIC APPROACH:
1. VALIDATION: Always validate emotions first - "Your feelings are completely valid"
2. NORMALIZATION: Help them understand they're not alone - many Indian youth face similar challenges
3. CULTURAL BRIDGE: Connect modern therapy with traditional Indian wisdom
4. PRACTICAL SOLUTIONS: Provide immediately actionable coping strategies
5. FAMILY-AWARE: Consider family dynamics in all suggestions
6. CRISIS AWARENESS: Detect and respond appropriately to crisis indicators

LANGUAGE GUIDELINES:
${languageInstruction}

CRISIS PROTOCOL:
${context.crisisLevel !== 'none' ? `
🚨 CRISIS LEVEL: ${context.crisisLevel}
- Prioritize safety and immediate support
- Provide Indian crisis helplines: Vandrevala Foundation (9999 666 555), AASRA (91-22-27546669)
- Use gentle de-escalation techniques
- Encourage professional help while reducing stigma
- Follow up with safety planning
` : ''}

USER MESSAGE: "${userMessage}"

RESPONSE INSTRUCTIONS:
Generate a therapeutic response that:
1. Shows deep empathy and cultural understanding
2. Provides specific, actionable coping strategies tailored to Indian context
3. Includes relevant cultural wisdom or references when appropriate
4. Offers professional-level therapeutic insights
5. Maintains hope and encouragement
6. Uses natural, conversational tone in preferred language

RESPONSE FORMAT (JSON):
{
  "message": "Your empathetic, culturally-aware therapeutic response (100-150 words)",
  "suggestedActions": [
    "Immediate coping strategy (culturally relevant)",
    "Short-term action step",
    "Long-term wellness practice"
  ],
  "moodAssessment": "Professional assessment of emotional state and needs",
  "followUpQuestions": [
    "Gentle, therapeutic follow-up question",
    "Question to deepen understanding or encourage reflection"
  ]
}

Remember: You're not just an AI - you're a trusted friend and mental health professional who truly understands the unique challenges of being young in India today.
`;
  }

  private getLanguageInstruction(language: string): string {
    switch (language) {
      case 'hindi':
        return `
LANGUAGE: Respond primarily in Hindi (Devanagari script)
- Use warm, respectful Hindi: "आप", "जी हाँ", "बिल्कुल"
- Include comforting phrases: "सब ठीक हो जाएगा", "आप अकेले नहीं हैं", "मैं समझ सकता हूँ"
- Use therapeutic Hindi terms: "मानसिक स्वास्थ्य", "भावनाएं", "तनाव"
- Cultural expressions: "धैर्य रखिए", "हिम्मत मत हारिए"`;

      case 'mixed':
        return `
LANGUAGE: Use natural Hinglish (Hindi-English code-switching)
- Mix languages naturally: "मैं understand करता हूँ आपकी situation"
- English for modern concepts: "stress", "anxiety", "depression", "therapy"
- Hindi for emotions: "परेशानी", "खुशी", "दुख", "चिंता"
- Cultural phrases: "tension mat lo", "sab theek ho jayega"
- Examples: "आपकी feelings valid हैं", "हम together मिलकर solve करेंगे"`;

      default:
        return `
LANGUAGE: Respond in English with Hindi warmth
- Use simple, accessible English for Indian youth
- Include Hindi phrases for emotional connection: "Sab theek ho jayega", "Tension mat lo"
- Cultural terms: "beta", "yaar", "dost" (when appropriate)
- Avoid complex psychological jargon
- Use familiar expressions: "Don't worry", "It's okay", "I understand"`;
    }
  }

  private parseAIResponse(responseText: string, context: ConversationContext): AIResponse {
    try {
      // Clean the response text
      let cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();

      // If response doesn't start with {, try to find JSON within the text
      if (!cleanedResponse.startsWith('{')) {
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[0];
        }
      }

      const parsed = JSON.parse(cleanedResponse);

      // Validate and structure the response
      return {
        message: parsed.message || this.extractMessageFromText(responseText, context),
        suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions : this.getDefaultActions(context),
        moodAssessment: parsed.moodAssessment || 'User needs supportive conversation',
        followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions : this.getDefaultQuestions(context)
      };
    } catch (error) {
      // Fallback to plain text response
      return {
        message: responseText,
        suggestedActions: this.generateFallbackActions(context),
        moodAssessment: context.userMood,
        followUpQuestions: this.generateFallbackQuestions(context)
      };
    }
  }

  private getFallbackResponse(userMessage: string, context: ConversationContext): AIResponse {
    const fallbackMessages = {
      english: "I'm here to listen and support you. Your feelings are valid, and you're not alone in this journey.",
      hindi: "मैं यहाँ आपको सुनने और सहारा देने के लिए हूँ। आपकी भावनाएं सही हैं, और इस सफर में आप अकेले नहीं हैं।",
      mixed: "मैं यहाँ हूँ आपके साथ। Your feelings are valid और आप alone नहीं हैं इस journey में।"
    };

    return {
      message: fallbackMessages[context.preferredLanguage],
      suggestedActions: this.generateFallbackActions(context),
      moodAssessment: 'supportive_needed',
      followUpQuestions: this.generateFallbackQuestions(context)
    };
  }

  private extractMessageFromText(text: string, context: ConversationContext): string {
    // Extract meaningful message from unstructured text
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 3).join('. ').trim() + '.';
  }

  private getDefaultActions(context: ConversationContext): string[] {
    return this.generateFallbackActions(context);
  }

  private getDefaultQuestions(context: ConversationContext): string[] {
    return this.generateFallbackQuestions(context);
  }

  private generateFallbackActions(context: ConversationContext): string[] {
    const actions = {
      english: [
        'Take 5 deep breaths slowly',
        'Try a 2-minute mindfulness exercise',
        'Reach out to someone you trust'
      ],
      hindi: [
        '5 गहरी सांसें धीरे-धीरे लें',
        '2 मिनट का mindfulness exercise करें',
        'किसी भरोसेमंद व्यक्ति से बात करें'
      ],
      mixed: [
        'Take 5 deep सांसें slowly',
        'Try करें 2-minute mindfulness',
        'किसी trusted person से बात करें'
      ]
    };

    return actions[context.preferredLanguage] || actions.english;
  }

  private generateFallbackQuestions(context: ConversationContext): string[] {
    const questions = {
      english: [
        'How are you feeling right now?',
        'What would help you feel better today?'
      ],
      hindi: [
        'अभी आप कैसा महसूस कर रहे हैं?',
        'आज आपको क्या बेहतर महसूस करने में मदद करेगा?'
      ],
      mixed: [
        'अभी आप कैसा feel कर रहे हैं?',
        'आज क्या help करेगा आपको better feel करने में?'
      ]
    };

    return questions[context.preferredLanguage] || questions.english;
  }
  // Generic generateResponse method for compatibility
  async generateResponse(prompt: string, options: any = {}): Promise<string> {
    try {
      // Check if we have a valid API key
      if (isDemoKey) {
        return this.getDemoResponse(prompt);
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating response:', error);
      return this.getDemoResponse(prompt);
    }
  }

  private getDemoResponse(prompt: string): string {
    // Demo responses for development
    if (prompt.toLowerCase().includes('crisis') || prompt.toLowerCase().includes('emergency')) {
      return "I understand you're going through a difficult time. Please remember that help is available. If you're in immediate danger, please contact emergency services or a crisis helpline.";
    }

    if (prompt.toLowerCase().includes('sad') || prompt.toLowerCase().includes('depressed')) {
      return "I hear that you're feeling sad. These feelings are valid, and it's okay to not be okay sometimes. Would you like to talk about what's been troubling you?";
    }

    if (prompt.toLowerCase().includes('anxious') || prompt.toLowerCase().includes('worried')) {
      return "Anxiety can be overwhelming. Let's take this one step at a time. Have you tried any breathing exercises or grounding techniques?";
    }

    return "I'm here to listen and support you. Your mental health matters, and you're taking a positive step by reaching out.";
  }
}

// Export singleton instance
export const geminiAI = new GeminiMentalHealthAI();