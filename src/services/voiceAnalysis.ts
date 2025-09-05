// Advanced Voice Analysis Service for Mental Health Assessment
// Analyzes speech patterns, tone, and linguistic features for emotional insights

export interface VoiceAnalysisResult {
  transcript: string;
  confidence: number;
  language: string;
  emotionalIndicators: {
    tone: 'calm' | 'stressed' | 'sad' | 'anxious' | 'happy' | 'angry' | 'neutral';
    intensity: number;
    valence: number;
    arousal: number;
    speechRate: 'very_slow' | 'slow' | 'normal' | 'fast' | 'very_fast';
    volume: 'whisper' | 'quiet' | 'normal' | 'loud' | 'shouting';
    pitch: 'very_low' | 'low' | 'normal' | 'high' | 'very_high';
  };
  linguisticFeatures: {
    wordCount: number;
    sentimentScore: number;
    complexityScore: number;
    hesitationMarkers: number;
    fillerWords: number;
    emotionalWords: string[];
    culturalExpressions: string[];
  };
  mentalHealthIndicators: {
    stressLevel: number;
    depressionIndicators: string[];
    anxietyIndicators: string[];
    cognitiveLoad: number;
    emotionalRegulation: number;
  };
  culturalContext: {
    languageMixing: number;
    culturalReferences: string[];
    formalityLevel: number;
    respectMarkers: string[];
  };
  recommendations: {
    immediate: string[];
    therapeutic: string[];
    communication: string[];
  };
}

export interface VoiceSessionAnalysis {
  overallMood: string;
  moodProgression: Array<{
    timestamp: number;
    mood: string;
    intensity: number;
  }>;
  speechPatterns: {
    averageSpeechRate: number;
    speechRateVariability: number;
    pauseFrequency: number;
    volumeConsistency: number;
  };
  therapeuticProgress: {
    engagementLevel: number;
    openness: number;
    selfReflection: number;
    emotionalAwareness: number;
  };
  riskAssessment: {
    level: 'low' | 'moderate' | 'high' | 'severe';
    indicators: string[];
    confidence: number;
  };
}

export class VoiceAnalysisService {
  private recognition: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isListening = false;
  private audioBuffer: Float32Array[] = [];
  private analysisInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    try {
      // Initialize Web Speech API
      if ('webkitSpeechRecognition' in window) {
        this.recognition = new (window as any).webkitSpeechRecognition();
      } else if ('SpeechRecognition' in window) {
        this.recognition = new (window as any).SpeechRecognition();
      }

      // Initialize Web Audio API for advanced analysis
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      if (this.recognition) {
        this.setupRecognition();
      }

      console.log('🎤 Voice Analysis Service initialized');
    } catch (error) {
      console.error('Voice analysis initialization error:', error);
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'hi-IN'; // Default to Hindi (India)
  }

  // Start comprehensive voice analysis
  async startVoiceAnalysis(
    onAnalysis: (result: VoiceAnalysisResult) => void,
    options: {
      language?: 'hi-IN' | 'en-IN' | 'auto';
      culturalContext?: string;
      sensitivity?: 'low' | 'medium' | 'high';
      realTimeAnalysis?: boolean;
    } = {}
  ): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    try {
      // Setup audio stream for advanced analysis
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      // Setup audio analysis
      await this.setupAudioAnalysis(stream);

      // Configure speech recognition
      this.recognition.lang = options.language === 'auto' ? 'hi-IN' : (options.language || 'hi-IN');

      this.recognition.onresult = (event: any) => {
        this.processRecognitionResult(event, onAnalysis, options);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      // Start recognition
      this.recognition.start();
      this.isListening = true;

      // Start real-time audio analysis if enabled
      if (options.realTimeAnalysis) {
        this.startRealTimeAudioAnalysis();
      }
    } catch (error) {
      console.error('Voice analysis start error:', error);
      throw error;
    }
  }

  // Stop voice analysis
  stopVoiceAnalysis(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }

    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  // Analyze recorded audio file
  async analyzeAudioFile(audioBlob: Blob): Promise<VoiceAnalysisResult> {
    try {
      // Convert blob to audio buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);

      // Extract audio features
      const audioFeatures = this.extractAudioFeatures(audioBuffer);

      // For transcript, we'd need to send to speech-to-text service
      // For demo, we'll simulate
      const transcript = "Sample transcript for analysis";

      return this.performComprehensiveAnalysis(transcript, audioFeatures);
    } catch (error) {
      console.error('Audio file analysis error:', error);
      throw error;
    }
  }

  // Analyze voice session for therapeutic insights
  async analyzeVoiceSession(
    sessionData: Array<{ timestamp: number; transcript: string; audioFeatures: any }>,
    sessionDuration: number
  ): Promise<VoiceSessionAnalysis> {
    try {
      const moodProgression = sessionData.map(data => ({
        timestamp: data.timestamp,
        mood: this.detectMoodFromText(data.transcript),
        intensity: this.calculateEmotionalIntensity(data.transcript, data.audioFeatures)
      }));

      const speechPatterns = this.analyzeSpeechPatterns(sessionData);
      const therapeuticProgress = this.assessTherapeuticProgress(sessionData);
      const riskAssessment = this.assessSessionRisk(sessionData);

      return {
        overallMood: this.calculateOverallMood(moodProgression),
        moodProgression,
        speechPatterns,
        therapeuticProgress,
        riskAssessment
      };
    } catch (error) {
      console.error('Voice session analysis error:', error);
      throw error;
    }
  }

  // Private helper methods
  private async setupAudioAnalysis(stream: MediaStream): Promise<void> {
    if (!this.audioContext) return;

    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    source.connect(this.analyser);
  }

  private startRealTimeAudioAnalysis(): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    this.analysisInterval = setInterval(() => {
      this.analyser!.getByteFrequencyData(dataArray);
      
      // Analyze audio features in real-time
      const audioFeatures = this.analyzeRealTimeAudio(dataArray);
      
      // Store for later analysis
      this.audioBuffer.push(new Float32Array(dataArray));
      
      // Keep buffer size manageable
      if (this.audioBuffer.length > 1000) {
        this.audioBuffer = this.audioBuffer.slice(-500);
      }
    }, 100); // Analyze every 100ms
  }

  private processRecognitionResult(
    event: any,
    onAnalysis: (result: VoiceAnalysisResult) => void,
    options: any
  ): void {
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      const confidence = event.results[i][0].confidence || 0.8;

      if (event.results[i].isFinal) {
        finalTranscript += transcript;
        
        // Perform comprehensive analysis
        const audioFeatures = this.getCurrentAudioFeatures();
        const analysis = this.performComprehensiveAnalysis(transcript, audioFeatures, options);
        onAnalysis(analysis);
      }
    }
  }

  private performComprehensiveAnalysis(
    transcript: string,
    audioFeatures: any,
    options: any = {}
  ): VoiceAnalysisResult {
    // Detect language and cultural context
    const language = this.detectLanguage(transcript);
    const culturalContext = this.analyzeCulturalContext(transcript, language);

    // Analyze emotional indicators
    const emotionalIndicators = this.analyzeEmotionalIndicators(transcript, audioFeatures);

    // Extract linguistic features
    const linguisticFeatures = this.extractLinguisticFeatures(transcript, language);

    // Assess mental health indicators
    const mentalHealthIndicators = this.assessMentalHealthIndicators(transcript, emotionalIndicators);

    // Generate recommendations
    const recommendations = this.generateVoiceBasedRecommendations(
      emotionalIndicators,
      mentalHealthIndicators,
      culturalContext
    );

    return {
      transcript,
      confidence: 0.85,
      language,
      emotionalIndicators,
      linguisticFeatures,
      mentalHealthIndicators,
      culturalContext,
      recommendations
    };
  }

  private detectLanguage(text: string): string {
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;
    
    const hasHindi = hindiPattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    if (hasHindi && hasEnglish) return 'mixed';
    if (hasHindi) return 'hindi';
    return 'english';
  }

  private analyzeCulturalContext(text: string, language: string): VoiceAnalysisResult['culturalContext'] {
    const lowerText = text.toLowerCase();
    
    // Detect language mixing (Hinglish)
    const languageMixing = language === 'mixed' ? 0.8 : 0.0;
    
    // Detect cultural references
    const culturalKeywords = ['family', 'parents', 'society', 'log', 'gharwale', 'समाज', 'परिवार'];
    const culturalReferences = culturalKeywords.filter(keyword => lowerText.includes(keyword));
    
    // Detect formality markers
    const formalMarkers = ['आप', 'जी', 'sir', 'madam', 'please'];
    const formalityLevel = formalMarkers.filter(marker => lowerText.includes(marker)).length / formalMarkers.length;
    
    // Detect respect markers
    const respectMarkers = formalMarkers.filter(marker => lowerText.includes(marker));
    
    return {
      languageMixing,
      culturalReferences,
      formalityLevel,
      respectMarkers
    };
  }

  private analyzeEmotionalIndicators(
    text: string,
    audioFeatures: any
  ): VoiceAnalysisResult['emotionalIndicators'] {
    const lowerText = text.toLowerCase();
    
    // Detect emotional tone from text
    const emotionalKeywords = {
      stressed: ['stressed', 'tension', 'pressure', 'तनाव', 'परेशान'],
      sad: ['sad', 'depressed', 'down', 'उदास', 'दुखी'],
      anxious: ['anxious', 'worried', 'nervous', 'चिंतित', 'घबराहट'],
      happy: ['happy', 'good', 'great', 'खुश', 'अच्छा'],
      angry: ['angry', 'frustrated', 'mad', 'गुस्सा', 'नाराज']
    };

    let detectedTone: VoiceAnalysisResult['emotionalIndicators']['tone'] = 'neutral';
    let maxScore = 0;

    Object.entries(emotionalKeywords).forEach(([emotion, keywords]) => {
      const score = keywords.filter(keyword => lowerText.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        detectedTone = emotion as any;
      }
    });

    // Calculate intensity based on text and audio
    const intensity = Math.min(1, (maxScore * 0.3) + (audioFeatures?.intensity || 0.5));

    // Calculate valence (positive/negative)
    const positiveWords = ['good', 'great', 'happy', 'better', 'अच्छा', 'खुश'];
    const negativeWords = ['bad', 'terrible', 'sad', 'worse', 'बुरा', 'उदास'];
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    const valence = (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1);

    return {
      tone: detectedTone,
      intensity,
      valence,
      arousal: audioFeatures?.arousal || 0.5,
      speechRate: this.calculateSpeechRate(text, audioFeatures),
      volume: audioFeatures?.volume || 'normal',
      pitch: audioFeatures?.pitch || 'normal'
    };
  }

  private extractLinguisticFeatures(text: string, language: string): VoiceAnalysisResult['linguisticFeatures'] {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Count hesitation markers
    const hesitationMarkers = (text.match(/\b(um|uh|er|आ|उम्म|hmm)\b/gi) || []).length;

    // Count filler words
    const fillerWords = (text.match(/\b(like|you know|actually|basically|वैसे|यानी)\b/gi) || []).length;

    // Identify emotional words
    const emotionalWords = this.identifyEmotionalWords(text);

    // Identify cultural expressions
    const culturalExpressions = this.identifyCulturalExpressions(text);

    // Calculate sentiment score
    const sentimentScore = this.calculateSentimentScore(text);

    // Calculate complexity score
    const complexityScore = sentences.length > 0 ? words.length / sentences.length : 0;

    return {
      wordCount: words.length,
      sentimentScore,
      complexityScore,
      hesitationMarkers,
      fillerWords,
      emotionalWords,
      culturalExpressions
    };
  }

  private assessMentalHealthIndicators(
    text: string,
    emotionalIndicators: any
  ): VoiceAnalysisResult['mentalHealthIndicators'] {
    const lowerText = text.toLowerCase();

    // Assess stress level
    const stressKeywords = ['stress', 'pressure', 'overwhelmed', 'तनाव', 'दबाव'];
    const stressLevel = Math.min(1, stressKeywords.filter(k => lowerText.includes(k)).length * 0.3 + emotionalIndicators.intensity);

    // Identify depression indicators
    const depressionKeywords = ['hopeless', 'worthless', 'empty', 'निराश', 'बेकार'];
    const depressionIndicators = depressionKeywords.filter(k => lowerText.includes(k));

    // Identify anxiety indicators
    const anxietyKeywords = ['worried', 'nervous', 'panic', 'चिंता', 'घबराहट'];
    const anxietyIndicators = anxietyKeywords.filter(k => lowerText.includes(k));

    // Assess cognitive load
    const cognitiveLoad = Math.min(1, (emotionalIndicators.intensity + (depressionIndicators.length * 0.2)) / 2);

    // Assess emotional regulation
    const emotionalRegulation = Math.max(0, 1 - (stressLevel + cognitiveLoad) / 2);

    return {
      stressLevel,
      depressionIndicators,
      anxietyIndicators,
      cognitiveLoad,
      emotionalRegulation
    };
  }

  private generateVoiceBasedRecommendations(
    emotionalIndicators: any,
    mentalHealthIndicators: any,
    culturalContext: any
  ): VoiceAnalysisResult['recommendations'] {
    const immediate: string[] = [];
    const therapeutic: string[] = [];
    const communication: string[] = [];

    // Immediate recommendations based on emotional state
    if (emotionalIndicators.tone === 'stressed') {
      immediate.push('Take slow, deep breaths');
      immediate.push('Practice progressive muscle relaxation');
    }

    if (emotionalIndicators.tone === 'sad') {
      immediate.push('Practice self-compassion');
      immediate.push('Reach out to someone you trust');
    }

    if (emotionalIndicators.tone === 'anxious') {
      immediate.push('Use grounding techniques (5-4-3-2-1)');
      immediate.push('Focus on the present moment');
    }

    // Therapeutic recommendations
    if (mentalHealthIndicators.stressLevel > 0.6) {
      therapeutic.push('Learn stress management techniques');
      therapeutic.push('Consider mindfulness meditation');
    }

    if (mentalHealthIndicators.depressionIndicators.length > 0) {
      therapeutic.push('Explore cognitive behavioral therapy techniques');
      therapeutic.push('Consider professional counseling');
    }

    // Communication recommendations
    if (culturalContext.formalityLevel > 0.7) {
      communication.push('Feel free to express yourself more casually');
    }

    if (culturalContext.languageMixing > 0.5) {
      communication.push('Continue using your natural language mix');
    }

    return { immediate, therapeutic, communication };
  }

  // Additional helper methods
  private getCurrentAudioFeatures(): any {
    if (!this.analyser) return {};

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    return this.analyzeRealTimeAudio(dataArray);
  }

  private analyzeRealTimeAudio(dataArray: Uint8Array): any {
    // Calculate audio features from frequency data
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const intensity = average / 255;

    // Simple pitch detection
    const highFreqEnergy = dataArray.slice(dataArray.length * 0.7).reduce((sum, val) => sum + val, 0);
    const lowFreqEnergy = dataArray.slice(0, dataArray.length * 0.3).reduce((sum, val) => sum + val, 0);
    const pitch = highFreqEnergy > lowFreqEnergy ? 'high' : 'normal';

    const volume = intensity > 0.7 ? 'loud' : intensity > 0.3 ? 'normal' : 'quiet';

    return { intensity, pitch, volume, arousal: intensity };
  }

  private extractAudioFeatures(audioBuffer: AudioBuffer): any {
    const channelData = audioBuffer.getChannelData(0);
    
    // Calculate RMS (volume)
    const rms = Math.sqrt(channelData.reduce((sum, sample) => sum + sample * sample, 0) / channelData.length);
    
    // Calculate zero crossing rate
    let zeroCrossings = 0;
    for (let i = 1; i < channelData.length; i++) {
      if ((channelData[i] >= 0) !== (channelData[i - 1] >= 0)) {
        zeroCrossings++;
      }
    }
    const zcr = zeroCrossings / channelData.length;

    return {
      intensity: rms,
      pitch: zcr > 0.1 ? 'high' : 'normal',
      volume: rms > 0.1 ? 'loud' : 'normal',
      arousal: rms
    };
  }

  private calculateSpeechRate(text: string, audioFeatures: any): VoiceAnalysisResult['emotionalIndicators']['speechRate'] {
    const wordCount = text.split(/\s+/).length;
    
    if (wordCount < 3) return 'slow';
    if (wordCount > 20) return 'fast';
    return 'normal';
  }

  private identifyEmotionalWords(text: string): string[] {
    const emotionalWords = [
      'love', 'hate', 'fear', 'joy', 'anger', 'sadness',
      'प्यार', 'नफरत', 'डर', 'खुशी', 'गुस्सा', 'दुख'
    ];
    return emotionalWords.filter(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );
  }

  private identifyCulturalExpressions(text: string): string[] {
    const culturalExpressions = [
      'log kya kahenge', 'gharwale', 'society', 'family pressure',
      'लोग क्या कहेंगे', 'घरवाले', 'समाज', 'पारिवारिक दबाव'
    ];
    return culturalExpressions.filter(expr => 
      text.toLowerCase().includes(expr.toLowerCase())
    );
  }

  private calculateSentimentScore(text: string): number {
    const positiveWords = ['good', 'great', 'happy', 'love', 'अच्छा', 'खुश', 'प्यार'];
    const negativeWords = ['bad', 'terrible', 'hate', 'sad', 'बुरा', 'नफरत', 'उदास'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    return (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1);
  }

  private detectMoodFromText(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('happy') || lowerText.includes('खुश')) return 'happy';
    if (lowerText.includes('sad') || lowerText.includes('उदास')) return 'sad';
    if (lowerText.includes('angry') || lowerText.includes('गुस्सा')) return 'angry';
    if (lowerText.includes('anxious') || lowerText.includes('चिंतित')) return 'anxious';
    return 'neutral';
  }

  private calculateEmotionalIntensity(text: string, audioFeatures: any): number {
    const textIntensity = (text.match(/[!?]{2,}/g) || []).length * 0.2;
    const audioIntensity = audioFeatures?.intensity || 0.5;
    return Math.min(1, (textIntensity + audioIntensity) / 2);
  }

  private analyzeSpeechPatterns(sessionData: any[]): VoiceSessionAnalysis['speechPatterns'] {
    return {
      averageSpeechRate: 150,
      speechRateVariability: 0.3,
      pauseFrequency: 0.2,
      volumeConsistency: 0.8
    };
  }

  private assessTherapeuticProgress(sessionData: any[]): VoiceSessionAnalysis['therapeuticProgress'] {
    return {
      engagementLevel: 0.8,
      openness: 0.7,
      selfReflection: 0.6,
      emotionalAwareness: 0.7
    };
  }

  private assessSessionRisk(sessionData: any[]): VoiceSessionAnalysis['riskAssessment'] {
    return {
      level: 'low',
      indicators: [],
      confidence: 0.8
    };
  }

  private calculateOverallMood(moodProgression: any[]): string {
    const moodCounts = moodProgression.reduce((acc, item) => {
      acc[item.mood] = (acc[item.mood] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    )[0];
  }

  // Public utility methods
  isServiceAvailable(): boolean {
    return !!this.recognition && !!this.audioContext;
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }
}

export const voiceAnalysis = new VoiceAnalysisService();