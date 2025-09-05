// AI Orchestrator - Coordinates all AI services for comprehensive mental health support
// Integrates emotion detection, voice analysis, cultural context, and therapeutic interventions

import { geminiAI } from './geminiAI';
import { emotionDetection } from './emotionDetection';
import { voiceAnalysis } from './voiceAnalysis';

export interface TherapeuticResponse {
  message: string;
  interventionType: 'validation' | 'cognitive_restructuring' | 'mindfulness' | 'crisis_intervention' | 'psychoeducation' | 'behavioral_activation';
  culturalAdaptation: {
    language: 'hindi' | 'english' | 'mixed';
    culturalReferences: string[];
    respectLevel: 'formal' | 'casual' | 'mixed';
  };
  emotionalSupport: {
    empathyLevel: number;
    validationStrategies: string[];
    copingStrategies: string[];
  };
  riskAssessment: {
    level: 'none' | 'low' | 'moderate' | 'high' | 'severe';
    indicators: string[];
    immediateActions: string[];
    confidence?: number;
  };
  followUp: {
    recommended: boolean;
    timeframe: string;
    focus: string[];
  };
  resources: {
    selfHelp: string[];
    professional: string[];
    emergency: string[];
  };
}

export interface UserContext {
  userId: string;
  demographics: {
    age?: number;
    gender?: string;
    location?: string;
    language?: string;
    culturalBackground?: string;
  };
  mentalHealthHistory: {
    previousSessions: number;
    primaryConcerns: string[];
    therapeuticGoals: string[];
    riskFactors: string[];
    protectiveFactors: string[];
  };
  currentState: {
    emotionalState?: any;
    stressLevel?: number;
    recentTriggers?: string[];
    copingStrategies?: string[];
  };
}

export interface ConversationContext {
  sessionId: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    emotionalAnalysis?: any;
  }>;
  currentTopic?: string;
  therapeuticPhase: 'rapport_building' | 'assessment' | 'intervention' | 'consolidation' | 'closure';
  culturalContext: {
    languagePreference: string;
    culturalSensitivities: string[];
    communicationStyle: string;
  };
}

export class AIOrchestrator {
  private activeContexts: Map<string, ConversationContext> = new Map();
  private userProfiles: Map<string, UserContext> = new Map();
  private interventionStrategies: Map<string, any> = new Map();

  constructor() {
    this.initializeInterventionStrategies();
    console.log('🧠 AI Orchestrator initialized');
  }

  // Main method to generate therapeutic responses
  async generateTherapeuticResponse(
    userMessage: string,
    userId: string,
    context: {
      session?: any;
      emotionalAnalysis?: any;
      riskAssessment?: any;
      adaptations?: any[];
    } = {}
  ): Promise<TherapeuticResponse> {
    try {
      // Get or create user context
      const userContext = await this.getUserContext(userId);
      const conversationContext = await this.getConversationContext(context.session?.sessionId || 'default', userId);

      // Analyze user message comprehensively
      const messageAnalysis = await this.analyzeUserMessage(userMessage, userContext, conversationContext);

      // Determine intervention strategy
      const interventionStrategy = await this.determineInterventionStrategy(
        messageAnalysis,
        userContext,
        context.riskAssessment
      );

      // Generate culturally adapted response
      const response = await this.generateCulturallyAdaptedResponse(
        userMessage,
        messageAnalysis,
        interventionStrategy,
        userContext,
        conversationContext
      );

      // Update conversation context
      this.updateConversationContext(conversationContext, userMessage, response, messageAnalysis);

      return response;
    } catch (error) {
      console.error('AI Orchestrator error:', error);
      return this.generateFallbackResponse(userMessage, userId);
    }
  }

  // Analyze user message using multiple AI services
  private async analyzeUserMessage(
    message: string,
    userContext: UserContext,
    conversationContext: ConversationContext
  ): Promise<any> {
    const analysis = {
      textAnalysis: {},
      emotionalAnalysis: {},
      culturalAnalysis: {},
      riskAnalysis: {},
      therapeuticNeeds: []
    };

    try {
      // Basic text analysis using Gemini
      analysis.textAnalysis = await this.analyzeTextContent(message);

      // Emotional analysis
      analysis.emotionalAnalysis = await this.analyzeEmotionalContent(message);

      // Cultural context analysis
      analysis.culturalAnalysis = await this.analyzeCulturalContext(message, userContext);

      // Risk assessment
      analysis.riskAnalysis = await this.assessRiskFactors(message, userContext, conversationContext);

      // Identify therapeutic needs
      analysis.therapeuticNeeds = await this.identifyTherapeuticNeeds(message, analysis);

      return analysis;
    } catch (error) {
      console.error('Message analysis error:', error);
      return analysis;
    }
  }

  private async analyzeTextContent(message: string): Promise<any> {
    try {
      const prompt = `
        Analyze this message for therapeutic insights:
        "${message}"
        
        Provide analysis for:
        1. Main themes and concerns
        2. Emotional indicators
        3. Cognitive patterns
        4. Behavioral indicators
        5. Strengths and resources mentioned
        
        Format as JSON with clear categories.
      `;

      const response = await geminiAI.generateResponse(prompt, {
        temperature: 0.3,
        maxTokens: 500
      });

      return JSON.parse(response || '{}');
    } catch (error) {
      console.error('Text analysis error:', error);
      return {
        themes: [],
        emotions: [],
        cognitivePatterns: [],
        behavioralIndicators: [],
        strengths: []
      };
    }
  }

  private async analyzeEmotionalContent(message: string): Promise<any> {
    // Use emotion detection service for comprehensive emotional analysis
    const emotionalKeywords = {
      anxiety: ['worried', 'nervous', 'scared', 'panic', 'चिंता', 'घबराहट'],
      depression: ['sad', 'hopeless', 'empty', 'worthless', 'उदास', 'निराश'],
      stress: ['overwhelmed', 'pressure', 'burden', 'तनाव', 'दबाव'],
      anger: ['frustrated', 'angry', 'mad', 'irritated', 'गुस्सा', 'नाराज'],
      joy: ['happy', 'excited', 'good', 'great', 'खुश', 'अच्छा']
    };

    const lowerMessage = message.toLowerCase();
    const detectedEmotions: any = {};

    Object.entries(emotionalKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
      if (matches.length > 0) {
        detectedEmotions[emotion] = {
          intensity: Math.min(1, matches.length * 0.3),
          keywords: matches
        };
      }
    });

    return {
      primaryEmotion: Object.keys(detectedEmotions)[0] || 'neutral',
      emotionIntensity: Math.max(...Object.values(detectedEmotions).map((e: any) => e.intensity), 0.1),
      detectedEmotions,
      valence: this.calculateValence(detectedEmotions),
      arousal: this.calculateArousal(detectedEmotions)
    };
  }

  private async analyzeCulturalContext(message: string, userContext: UserContext): Promise<any> {
    const culturalIndicators = {
      familyReferences: ['family', 'parents', 'mom', 'dad', 'परिवार', 'माता-पिता', 'मम्मी', 'पापा'],
      socialPressure: ['society', 'log kya kahenge', 'people say', 'समाज', 'लोग क्या कहेंगे'],
      academicPressure: ['studies', 'exam', 'marks', 'career', 'पढ़ाई', 'परीक्षा', 'नंबर'],
      religiousReferences: ['god', 'prayer', 'temple', 'भगवान', 'प्रार्थना', 'मंदिर'],
      languageMixing: this.detectLanguageMixing(message)
    };

    const lowerMessage = message.toLowerCase();
    const culturalContext: any = {
      languagePreference: this.detectLanguagePreference(message),
      culturalThemes: [],
      formalityLevel: this.detectFormalityLevel(message),
      generationalFactors: []
    };

    Object.entries(culturalIndicators).forEach(([theme, indicators]) => {
      if (Array.isArray(indicators)) {
        const matches = indicators.filter(indicator => lowerMessage.includes(indicator));
        if (matches.length > 0) {
          culturalContext.culturalThemes.push(theme);
        }
      } else if (indicators > 0.3) {
        culturalContext.culturalThemes.push(theme);
      }
    });

    return culturalContext;
  }

  private async assessRiskFactors(
    message: string,
    userContext: UserContext,
    conversationContext: ConversationContext
  ): Promise<any> {
    const riskIndicators = {
      suicidalIdeation: ['suicide', 'kill myself', 'end it all', 'आत्महत्या', 'मरना चाहता'],
      selfHarm: ['hurt myself', 'cut', 'harm', 'खुद को नुकसान'],
      hopelessness: ['no hope', 'pointless', 'no future', 'कोई उम्मीद नहीं', 'बेकार'],
      isolation: ['alone', 'no one', 'lonely', 'अकेला', 'कोई नहीं'],
      substanceUse: ['drink', 'drugs', 'alcohol', 'शराब', 'नशा']
    };

    const protectiveFactors = {
      socialSupport: ['friends', 'family', 'support', 'दोस्त', 'परिवार', 'सहारा'],
      copingStrategies: ['meditation', 'exercise', 'music', 'ध्यान', 'व्यायाम'],
      futureOrientation: ['future', 'goals', 'dreams', 'भविष्य', 'सपने'],
      helpSeeking: ['help', 'therapy', 'counseling', 'मदद', 'सलाह']
    };

    const lowerMessage = message.toLowerCase();
    const riskAssessment = {
      level: 'none' as 'none' | 'low' | 'moderate' | 'high' | 'severe',
      indicators: [] as string[],
      protectiveFactors: [] as string[],
      immediateIntervention: false
    };

    // Check for risk indicators
    Object.entries(riskIndicators).forEach(([risk, keywords]) => {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
      if (matches.length > 0) {
        riskAssessment.indicators.push(risk);
      }
    });

    // Check for protective factors
    Object.entries(protectiveFactors).forEach(([factor, keywords]) => {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
      if (matches.length > 0) {
        riskAssessment.protectiveFactors.push(factor);
      }
    });

    // Determine risk level
    if (riskAssessment.indicators.includes('suicidalIdeation')) {
      riskAssessment.level = 'severe';
      riskAssessment.immediateIntervention = true;
    } else if (riskAssessment.indicators.length >= 2) {
      riskAssessment.level = 'high';
    } else if (riskAssessment.indicators.length === 1) {
      riskAssessment.level = 'moderate';
    } else if (userContext.mentalHealthHistory.riskFactors.length > 0) {
      riskAssessment.level = 'low';
    }

    return riskAssessment;
  }

  private async identifyTherapeuticNeeds(message: string, analysis: any): Promise<string[]> {
    const needs: string[] = [];

    // Based on emotional analysis
    if (analysis.emotionalAnalysis.primaryEmotion === 'anxiety') {
      needs.push('anxiety_management', 'grounding_techniques');
    }
    if (analysis.emotionalAnalysis.primaryEmotion === 'depression') {
      needs.push('mood_enhancement', 'behavioral_activation');
    }
    if (analysis.emotionalAnalysis.primaryEmotion === 'stress') {
      needs.push('stress_management', 'relaxation_techniques');
    }

    // Based on risk analysis
    if (analysis.riskAnalysis.level !== 'none') {
      needs.push('crisis_intervention', 'safety_planning');
    }

    // Based on cultural context
    if (analysis.culturalAnalysis.culturalThemes.includes('familyReferences')) {
      needs.push('family_therapy_techniques');
    }
    if (analysis.culturalAnalysis.culturalThemes.includes('academicPressure')) {
      needs.push('academic_stress_management');
    }

    return needs;
  }

  private async determineInterventionStrategy(
    messageAnalysis: any,
    userContext: UserContext,
    riskAssessment?: any
  ): Promise<any> {
    // Crisis intervention takes priority
    if (messageAnalysis.riskAnalysis.level === 'severe') {
      return {
        primary: 'crisis_intervention',
        secondary: ['validation', 'safety_planning'],
        approach: 'directive',
        urgency: 'immediate'
      };
    }

    // High risk requires structured intervention
    if (messageAnalysis.riskAnalysis.level === 'high') {
      return {
        primary: 'risk_management',
        secondary: ['validation', 'cognitive_restructuring'],
        approach: 'supportive_directive',
        urgency: 'high'
      };
    }

    // Standard therapeutic interventions based on needs
    const primaryNeeds = messageAnalysis.therapeuticNeeds;
    let primaryIntervention = 'validation'; // Default

    if (primaryNeeds.includes('anxiety_management')) {
      primaryIntervention = 'mindfulness';
    } else if (primaryNeeds.includes('mood_enhancement')) {
      primaryIntervention = 'behavioral_activation';
    } else if (primaryNeeds.includes('stress_management')) {
      primaryIntervention = 'cognitive_restructuring';
    }

    return {
      primary: primaryIntervention,
      secondary: ['validation', 'psychoeducation'],
      approach: 'collaborative',
      urgency: 'standard'
    };
  }

  private async generateCulturallyAdaptedResponse(
    userMessage: string,
    messageAnalysis: any,
    interventionStrategy: any,
    userContext: UserContext,
    conversationContext: ConversationContext
  ): Promise<TherapeuticResponse> {
    // Build culturally sensitive prompt
    const culturalContext = messageAnalysis.culturalAnalysis;
    const languagePreference = culturalContext.languagePreference;
    const culturalThemes = culturalContext.culturalThemes;

    let prompt = `
      You are a culturally sensitive AI mental health companion for Indian users.
      
      User message: "${userMessage}"
      
      Context:
      - Language preference: ${languagePreference}
      - Cultural themes: ${culturalThemes.join(', ')}
      - Primary emotion: ${messageAnalysis.emotionalAnalysis.primaryEmotion}
      - Risk level: ${messageAnalysis.riskAnalysis.level}
      - Intervention needed: ${interventionStrategy.primary}
      
      Guidelines:
      1. Respond with empathy and cultural sensitivity
      2. Use appropriate mix of Hindi/English if language is "mixed"
      3. Acknowledge cultural context (family, society, academic pressure)
      4. Provide practical, culturally relevant coping strategies
      5. Be respectful of Indian values and traditions
      6. Keep response concise but warm (2-3 paragraphs max)
      
      ${this.getInterventionGuidelines(interventionStrategy.primary)}
      
      Generate a therapeutic response that feels natural and supportive.
    `;

    try {
      const response = await geminiAI.generateResponse(prompt, {
        temperature: 0.7,
        maxTokens: 300
      });

      return {
        message: response || this.getFallbackMessage(messageAnalysis),
        interventionType: interventionStrategy.primary,
        culturalAdaptation: {
          language: languagePreference,
          culturalReferences: culturalThemes,
          respectLevel: culturalContext.formalityLevel > 0.7 ? 'formal' : 'casual'
        },
        emotionalSupport: {
          empathyLevel: this.calculateEmpathyLevel(messageAnalysis),
          validationStrategies: this.getValidationStrategies(messageAnalysis),
          copingStrategies: this.getCopingStrategies(messageAnalysis)
        },
        riskAssessment: {
          level: messageAnalysis.riskAnalysis.level,
          indicators: messageAnalysis.riskAnalysis.indicators,
          immediateActions: this.getImmediateActions(messageAnalysis.riskAnalysis)
        },
        followUp: {
          recommended: messageAnalysis.riskAnalysis.level !== 'none',
          timeframe: this.getFollowUpTimeframe(messageAnalysis.riskAnalysis.level),
          focus: messageAnalysis.therapeuticNeeds
        },
        resources: {
          selfHelp: this.getSelfHelpResources(messageAnalysis),
          professional: this.getProfessionalResources(culturalContext),
          emergency: this.getEmergencyResources()
        }
      };
    } catch (error) {
      console.error('Response generation error:', error);
      return this.generateFallbackResponse(userMessage, userContext.userId);
    }
  }

  // Helper methods
  private calculateValence(emotions: any): number {
    const positiveEmotions = ['joy', 'excitement', 'hope'];
    const negativeEmotions = ['sadness', 'anxiety', 'anger', 'depression'];

    let positiveScore = 0;
    let negativeScore = 0;

    Object.keys(emotions).forEach(emotion => {
      if (positiveEmotions.includes(emotion)) {
        positiveScore += emotions[emotion].intensity;
      } else if (negativeEmotions.includes(emotion)) {
        negativeScore += emotions[emotion].intensity;
      }
    });

    return (positiveScore - negativeScore) / Math.max(positiveScore + negativeScore, 1);
  }

  private calculateArousal(emotions: any): number {
    const highArousalEmotions = ['anxiety', 'anger', 'excitement', 'panic'];
    const lowArousalEmotions = ['sadness', 'depression', 'calm'];

    let arousalScore = 0.5; // neutral baseline

    Object.keys(emotions).forEach(emotion => {
      if (highArousalEmotions.includes(emotion)) {
        arousalScore += emotions[emotion].intensity * 0.3;
      } else if (lowArousalEmotions.includes(emotion)) {
        arousalScore -= emotions[emotion].intensity * 0.2;
      }
    });

    return Math.max(0, Math.min(1, arousalScore));
  }

  private detectLanguageMixing(message: string): number {
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;

    const hasHindi = hindiPattern.test(message);
    const hasEnglish = englishPattern.test(message);

    if (hasHindi && hasEnglish) return 0.8;
    return 0.0;
  }

  private detectLanguagePreference(message: string): 'hindi' | 'english' | 'mixed' {
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;

    const hasHindi = hindiPattern.test(message);
    const hasEnglish = englishPattern.test(message);

    if (hasHindi && hasEnglish) return 'mixed';
    if (hasHindi) return 'hindi';
    return 'english';
  }

  private detectFormalityLevel(message: string): number {
    const formalMarkers = ['आप', 'जी', 'sir', 'madam', 'please', 'thank you'];
    const informalMarkers = ['तू', 'तुम', 'yaar', 'bro', 'dude'];

    const lowerMessage = message.toLowerCase();
    const formalCount = formalMarkers.filter(marker => lowerMessage.includes(marker)).length;
    const informalCount = informalMarkers.filter(marker => lowerMessage.includes(marker)).length;

    return formalCount / Math.max(formalCount + informalCount, 1);
  }

  private getInterventionGuidelines(intervention: string): string {
    const guidelines = {
      validation: 'Acknowledge their feelings and normalize their experience. Show understanding.',
      cognitive_restructuring: 'Help identify negative thought patterns and suggest balanced perspectives.',
      mindfulness: 'Suggest grounding techniques and present-moment awareness practices.',
      crisis_intervention: 'Prioritize safety. Be direct but compassionate. Provide immediate resources.',
      behavioral_activation: 'Encourage small, manageable activities that can improve mood.',
      psychoeducation: 'Provide helpful information about mental health in an accessible way.'
    };

    return guidelines[intervention as keyof typeof guidelines] || guidelines.validation;
  }

  private calculateEmpathyLevel(analysis: any): number {
    const emotionIntensity = analysis.emotionalAnalysis.emotionIntensity || 0.5;
    const riskLevel = analysis.riskAnalysis.level;

    let empathyLevel = 0.7; // baseline

    if (emotionIntensity > 0.7) empathyLevel += 0.2;
    if (riskLevel !== 'none') empathyLevel += 0.1;

    return Math.min(1, empathyLevel);
  }

  private getValidationStrategies(analysis: any): string[] {
    const strategies = ['acknowledge_feelings', 'normalize_experience'];

    if (analysis.culturalAnalysis.culturalThemes.includes('familyReferences')) {
      strategies.push('validate_family_dynamics');
    }
    if (analysis.culturalAnalysis.culturalThemes.includes('academicPressure')) {
      strategies.push('validate_academic_stress');
    }

    return strategies;
  }

  private getCopingStrategies(analysis: any): string[] {
    const strategies = ['deep_breathing'];

    const primaryEmotion = analysis.emotionalAnalysis.primaryEmotion;

    if (primaryEmotion === 'anxiety') {
      strategies.push('grounding_techniques', 'progressive_relaxation');
    } else if (primaryEmotion === 'depression') {
      strategies.push('behavioral_activation', 'social_connection');
    } else if (primaryEmotion === 'stress') {
      strategies.push('time_management', 'prioritization');
    }

    return strategies;
  }

  private getImmediateActions(riskAnalysis: any): string[] {
    const actions: string[] = [];

    if (riskAnalysis.level === 'severe') {
      actions.push('contact_emergency_services', 'ensure_safety', 'contact_trusted_person');
    } else if (riskAnalysis.level === 'high') {
      actions.push('schedule_professional_help', 'activate_support_network');
    } else if (riskAnalysis.level === 'moderate') {
      actions.push('practice_coping_strategies', 'reach_out_to_support');
    }

    return actions;
  }

  private getFollowUpTimeframe(riskLevel: string): string {
    const timeframes = {
      severe: 'immediate',
      high: 'within 24 hours',
      moderate: 'within 2-3 days',
      low: 'within a week',
      none: 'as needed'
    };

    return timeframes[riskLevel as keyof typeof timeframes] || 'as needed';
  }

  private getSelfHelpResources(analysis: any): string[] {
    const resources = ['mindfulness_apps', 'breathing_exercises'];

    if (analysis.culturalAnalysis.languagePreference !== 'english') {
      resources.push('hindi_meditation_resources');
    }

    return resources;
  }

  private getProfessionalResources(culturalContext: any): string[] {
    const resources = ['local_therapists', 'online_counseling'];

    if (culturalContext.culturalThemes.includes('familyReferences')) {
      resources.push('family_therapy_specialists');
    }

    return resources;
  }

  private getEmergencyResources(): string[] {
    return [
      'National Suicide Prevention Helpline: 9152987821',
      'Vandrevala Foundation: 9999666555',
      'iCall: 9152987821'
    ];
  }

  private getFallbackMessage(analysis: any): string {
    const emotion = analysis.emotionalAnalysis.primaryEmotion;

    const fallbackMessages = {
      anxiety: "I understand you're feeling anxious. Take a deep breath with me. You're not alone in this.",
      depression: "I hear that you're going through a difficult time. Your feelings are valid, and there is hope.",
      stress: "It sounds like you're under a lot of pressure. Let's work together to find some relief.",
      default: "Thank you for sharing with me. I'm here to support you through whatever you're experiencing."
    };

    return fallbackMessages[emotion as keyof typeof fallbackMessages] || fallbackMessages.default;
  }

  private generateFallbackResponse(message: string, userId: string): TherapeuticResponse {
    return {
      message: "I'm here to listen and support you. Could you tell me more about how you're feeling right now?",
      interventionType: 'validation',
      culturalAdaptation: {
        language: 'mixed',
        culturalReferences: [],
        respectLevel: 'casual'
      },
      emotionalSupport: {
        empathyLevel: 0.8,
        validationStrategies: ['acknowledge_feelings'],
        copingStrategies: ['deep_breathing']
      },
      riskAssessment: {
        level: 'none',
        indicators: [],
        immediateActions: []
      },
      followUp: {
        recommended: false,
        timeframe: 'as needed',
        focus: []
      },
      resources: {
        selfHelp: ['breathing_exercises'],
        professional: ['online_counseling'],
        emergency: this.getEmergencyResources()
      }
    };
  }

  private initializeInterventionStrategies(): void {
    // Initialize intervention strategy mappings
    this.interventionStrategies.set('validation', {
      description: 'Acknowledge and validate emotions',
      techniques: ['reflective_listening', 'emotional_validation', 'normalization']
    });

    this.interventionStrategies.set('cognitive_restructuring', {
      description: 'Help identify and reframe negative thoughts',
      techniques: ['thought_challenging', 'perspective_taking', 'evidence_examination']
    });

    // Add more strategies as needed
  }

  private async getUserContext(userId: string): Promise<UserContext> {
    if (!this.userProfiles.has(userId)) {
      // Create default user context
      const defaultContext: UserContext = {
        userId,
        demographics: {},
        mentalHealthHistory: {
          previousSessions: 0,
          primaryConcerns: [],
          therapeuticGoals: [],
          riskFactors: [],
          protectiveFactors: []
        },
        currentState: {}
      };
      this.userProfiles.set(userId, defaultContext);
    }

    return this.userProfiles.get(userId)!;
  }

  private async getConversationContext(sessionId: string, userId: string): Promise<ConversationContext> {
    if (!this.activeContexts.has(sessionId)) {
      const defaultContext: ConversationContext = {
        sessionId,
        conversationHistory: [],
        therapeuticPhase: 'rapport_building',
        culturalContext: {
          languagePreference: 'mixed',
          culturalSensitivities: [],
          communicationStyle: 'casual'
        }
      };
      this.activeContexts.set(sessionId, defaultContext);
    }

    return this.activeContexts.get(sessionId)!;
  }

  private updateConversationContext(
    context: ConversationContext,
    userMessage: string,
    response: TherapeuticResponse,
    analysis: any
  ): void {
    // Add to conversation history
    context.conversationHistory.push(
      {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
        emotionalAnalysis: analysis.emotionalAnalysis
      },
      {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      }
    );

    // Keep history manageable
    if (context.conversationHistory.length > 20) {
      context.conversationHistory = context.conversationHistory.slice(-20);
    }

    // Update cultural context
    context.culturalContext.languagePreference = response.culturalAdaptation.language;
  }

  // Public utility methods
  async analyzeConversationTrends(sessionId: string): Promise<any> {
    const context = this.activeContexts.get(sessionId);
    if (!context) return null;

    const emotions = context.conversationHistory
      .filter(entry => entry.emotionalAnalysis)
      .map(entry => entry.emotionalAnalysis);

    return {
      emotionalTrend: this.calculateEmotionalTrend(emotions),
      engagementLevel: this.calculateEngagementLevel(context),
      therapeuticProgress: this.assessTherapeuticProgress(context)
    };
  }

  private calculateEmotionalTrend(emotions: any[]): string {
    if (emotions.length < 2) return 'stable';

    const recent = emotions.slice(-3);
    const earlier = emotions.slice(0, -3);

    const recentAvg = recent.reduce((sum, e) => sum + (e.valence || 0), 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, e) => sum + (e.valence || 0), 0) / earlier.length;

    if (recentAvg > earlierAvg + 0.2) return 'improving';
    if (recentAvg < earlierAvg - 0.2) return 'declining';
    return 'stable';
  }

  private calculateEngagementLevel(context: ConversationContext): number {
    const messageCount = context.conversationHistory.length;
    const avgMessageLength = context.conversationHistory
      .filter(entry => entry.role === 'user')
      .reduce((sum, entry) => sum + entry.content.length, 0) / messageCount;

    return Math.min(1, (messageCount * 0.1) + (avgMessageLength / 100));
  }

  private assessTherapeuticProgress(context: ConversationContext): any {
    return {
      rapportBuilding: context.conversationHistory.length > 3 ? 0.8 : 0.4,
      selfAwareness: 0.6, // Would be calculated based on user insights
      copingSkillsUsage: 0.5, // Would track mentioned coping strategies
      emotionalRegulation: 0.6 // Would track emotional stability over time
    };
  }
}

export const aiOrchestrator = new AIOrchestrator();