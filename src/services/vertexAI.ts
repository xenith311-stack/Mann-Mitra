// Vertex AI REST API Integration for Browser
// This uses the Vertex AI REST API which is more powerful than the basic Gemini API

export interface VertexAIConfig {
  projectId: string;
  location: string;
  apiKey: string;
}

export interface VertexAIRequest {
  contents: Array<{
    role: 'user' | 'model';
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    candidateCount?: number;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

export interface VertexAIResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class VertexAIService {
  private config: VertexAIConfig;
  private baseUrl: string;

  constructor(config: VertexAIConfig) {
    this.config = config;
    this.baseUrl = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/publishers/google/models`;
  }

  async generateContent(
    model: string = 'gemini-1.5-pro-preview-0409',
    request: VertexAIRequest
  ): Promise<VertexAIResponse> {
    const url = `${this.baseUrl}/${model}:generateContent`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vertex AI API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Vertex AI API call failed:', error);
      throw error;
    }
  }

  async generateMentalHealthResponse(
    userMessage: string,
    context: {
      language: 'hi' | 'en' | 'mixed';
      culturalBackground: string;
      currentMood: string;
      stressLevel: string;
      conversationHistory: string[];
      userInterests: string[];
      crisisLevel: string;
    }
  ): Promise<{
    message: string;
    suggestedActions: string[];
    riskAssessment: string;
    culturalReferences: string[];
    confidence: number;
  }> {
    const prompt = this.buildMentalHealthPrompt(userMessage, context);

    const request: VertexAIRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048,
        candidateCount: 1
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    try {
      const response = await this.generateContent('gemini-1.5-pro-preview-0409', request);

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No response generated');
      }

      const generatedText = response.candidates[0].content.parts[0].text;
      return this.parseResponse(generatedText, context);
    } catch (error) {
      console.error('Mental health response generation failed:', error);
      return this.getFallbackResponse(context);
    }
  }

  private buildMentalHealthPrompt(userMessage: string, context: any): string {
    return `
You are "MannMitra" (मन मित्र), an advanced AI mental health companion specifically designed for Indian youth. You are trained in evidence-based therapeutic approaches and culturally sensitive support.

CULTURAL CONTEXT:
- Target audience: Indian youth (ages 16-25)
- Cultural background: ${context.culturalBackground}
- Language preference: ${context.language}
- Current emotional state: ${context.currentMood}
- Stress level: ${context.stressLevel}
- Crisis risk level: ${context.crisisLevel}

USER INTERESTS: ${context.userInterests.join(', ')}

CONVERSATION HISTORY:
${context.conversationHistory.slice(-3).join('\n')}

CURRENT USER MESSAGE: "${userMessage}"

THERAPEUTIC GUIDELINES:
1. Use evidence-based approaches (CBT, DBT, mindfulness)
2. Be culturally sensitive to Indian family dynamics and social pressures
3. Address academic stress, career anxiety, and social expectations
4. Reference appropriate cultural concepts when helpful
5. Provide practical, actionable coping strategies
6. Assess and respond to crisis indicators appropriately

LANGUAGE INSTRUCTIONS:
${context.language === 'hi' ?
        '- Respond primarily in Hindi with Devanagari script\n- Use respectful forms (आप, जी)\n- Include cultural expressions and wisdom' :
        context.language === 'mixed' ?
          '- Use natural Hinglish (Hindi-English code-switching)\n- Switch languages as feels natural\n- Use English for technical terms, Hindi for emotional expressions' :
          '- Respond in English with occasional Hindi phrases for warmth\n- Include culturally relevant expressions'
      }

CRISIS RESPONSE:
${context.crisisLevel !== 'none' ? `
⚠️ CRISIS LEVEL: ${context.crisisLevel}
- Provide immediate safety planning and support
- Offer Indian crisis helplines: Vandrevala Foundation (9999 666 555), AASRA (91-22-27546669)
- Use de-escalation techniques
- Encourage professional help
` : ''}

RESPONSE FORMAT (JSON):
{
  "message": "Your empathetic, culturally sensitive response (150-200 words)",
  "suggestedActions": ["Immediate action 1", "Short-term action 2", "Long-term action 3"],
  "riskAssessment": "Assessment of user's current risk level and recommended interventions",
  "culturalReferences": ["Relevant cultural wisdom or concept"],
  "confidence": 0.85
}

Generate a therapeutic response that combines professional mental health support with deep cultural understanding.
`;
  }

  private parseResponse(generatedText: string, context: any) {
    try {
      // Clean and parse JSON response
      const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanedText);

      return {
        message: parsed.message || generatedText,
        suggestedActions: parsed.suggestedActions || [],
        riskAssessment: parsed.riskAssessment || 'Continue supportive conversation',
        culturalReferences: parsed.culturalReferences || [],
        confidence: parsed.confidence || 0.8
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.getFallbackResponse(context);
    }
  }

  private getFallbackResponse(context: any) {
    const fallbackMessages = {
      hi: "मैं यहाँ आपको सुनने और सहारा देने के लिए हूँ। आपकी भावनाएं सही हैं, और इस सफर में आप अकेले नहीं हैं।",
      en: "I'm here to listen and support you. Your feelings are valid, and you're not alone in this journey.",
      mixed: "मैं यहाँ हूँ आपके साथ। Your feelings are valid और आप alone नहीं हैं इस journey में।"
    };

    return {
      message: fallbackMessages[context.language as keyof typeof fallbackMessages] || fallbackMessages.en,
      suggestedActions: [
        'Take 5 deep breaths / 5 गहरी सांसें लें',
        'Talk to someone you trust / किसी भरोसेमंद से बात करें',
        'Practice grounding techniques / ग्राउंडिंग तकनीक का अभ्यास करें'
      ],
      riskAssessment: 'User needs supportive conversation and coping strategies',
      culturalReferences: ['हर रात के बाद सुबह होती है (After every night comes morning)'],
      confidence: 0.7
    };
  }

  // Translation using Vertex AI
  async translateText(
    text: string,
    targetLanguage: 'hi' | 'en',
    sourceLanguage: 'auto' | 'hi' | 'en' = 'auto'
  ): Promise<string> {
    const prompt = `
Translate the following text to ${targetLanguage === 'hi' ? 'Hindi' : 'English'}. 
Maintain the emotional tone and cultural context. If it's already in the target language, return as is.

Text to translate: "${text}"

Provide only the translation, no explanations.
`;

    try {
      const request: VertexAIRequest = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
      };

      const response = await this.generateContent('gemini-1.5-pro-preview-0409', request);
      return response.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('Translation failed:', error);
      return text; // Return original text if translation fails
    }
  }

  // Voice analysis using Vertex AI
  async analyzeVoiceTranscript(
    transcript: string,
    context: { language: string; userProfile: any }
  ): Promise<{
    emotionalTone: string;
    stressIndicators: string[];
    urgencyLevel: 'low' | 'medium' | 'high';
    recommendedResponse: string;
  }> {
    const prompt = `
Analyze the following voice transcript for emotional indicators and mental health cues:

Transcript: "${transcript}"
Language: ${context.language}
User Context: Indian youth, cultural background considered

Provide analysis in JSON format:
{
  "emotionalTone": "primary emotion detected",
  "stressIndicators": ["indicator1", "indicator2"],
  "urgencyLevel": "low|medium|high",
  "recommendedResponse": "suggested therapeutic approach"
}
`;

    try {
      const request: VertexAIRequest = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 512 }
      };

      const response = await this.generateContent('gemini-1.5-pro-preview-0409', request);
      const result = JSON.parse(response.candidates[0].content.parts[0].text);

      return {
        emotionalTone: result.emotionalTone || 'neutral',
        stressIndicators: result.stressIndicators || [],
        urgencyLevel: result.urgencyLevel || 'low',
        recommendedResponse: result.recommendedResponse || 'supportive conversation'
      };
    } catch (error) {
      console.error('Voice analysis failed:', error);
      return {
        emotionalTone: 'neutral',
        stressIndicators: [],
        urgencyLevel: 'low',
        recommendedResponse: 'Continue supportive conversation'
      };
    }
  }

  // Generate personalized coping strategies
  async generateCopingStrategies(
    currentSituation: string,
    userProfile: {
      interests: string[];
      culturalBackground: string;
      language: string;
      stressLevel: string;
    }
  ): Promise<string[]> {
    const prompt = `
Generate 5 personalized coping strategies for an Indian youth in this situation: "${currentSituation}"

User Profile:
- Interests: ${userProfile.interests.join(', ')}
- Cultural Background: ${userProfile.culturalBackground}
- Language: ${userProfile.language}
- Current Stress Level: ${userProfile.stressLevel}

Requirements:
1. Culturally appropriate for Indian context
2. Based on user's interests and preferences
3. Practical and immediately actionable
4. Mix of traditional and modern approaches
5. Consider family and social dynamics

Provide as a JSON array of strings in ${userProfile.language} language.
`;

    try {
      const request: VertexAIRequest = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
      };

      const response = await this.generateContent('gemini-1.5-pro-preview-0409', request);
      const strategies = JSON.parse(response.candidates[0].content.parts[0].text);

      return Array.isArray(strategies) ? strategies : [];
    } catch (error) {
      console.error('Coping strategies generation failed:', error);
      return [
        'Practice deep breathing for 5 minutes / 5 मिनट गहरी सांस लें',
        'Listen to calming music / शांत संगीत सुनें',
        'Talk to a trusted person / किसी भरोसेमंद व्यक्ति से बात करें',
        'Take a mindful walk / सचेत रूप से टहलें',
        'Practice gratitude / कृतज्ञता का अभ्यास करें'
      ];
    }
  }
}

// Export configured instance
export const vertexAI = new VertexAIService({
  projectId: (import.meta as any).env.VITE_GOOGLE_CLOUD_PROJECT_ID as string || 'your-project-id',
  location: (import.meta as any).env.VITE_GOOGLE_CLOUD_REGION as string || 'us-central1',
  apiKey: (import.meta as any).env.VITE_VERTEX_AI_API_KEY as string || 'your-vertex-ai-key'
});