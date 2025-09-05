// Google Cloud Speech-to-Text and Text-to-Speech integration
// Note: For production, these would use Google Cloud APIs with proper authentication
// For demo purposes, we'll use Web Speech API with fallbacks

// Web Speech API type declarations
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export interface VoiceAnalysis {
  transcript: string;
  confidence: number;
  detectedLanguage: string;
  emotionalTone: 'calm' | 'stressed' | 'sad' | 'anxious' | 'happy' | 'neutral';
  speechRate: 'slow' | 'normal' | 'fast';
}

export interface SpeechConfig {
  language: 'hi-IN' | 'en-IN' | 'auto';
  continuous: boolean;
  interimResults: boolean;
}

export class SpeechService {
  private recognition: any | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;

  constructor() {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
    }

    this.synthesis = window.speechSynthesis;
    this.setupRecognition();
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'hi-IN'; // Default to Hindi (India)
  }

  async startListening(
    config: SpeechConfig = { language: 'auto', continuous: true, interimResults: true },
    onResult: (analysis: VoiceAnalysis) => void,
    onError: (error: string) => void
  ): Promise<void> {
    if (!this.recognition) {
      onError('Speech recognition not supported in this browser');
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.lang = config.language === 'auto' ? 'hi-IN' : config.language;
    this.recognition.continuous = config.continuous;
    this.recognition.interimResults = config.interimResults;

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          
          // Analyze the final transcript
          const analysis = this.analyzeVoice(transcript, confidence);
          onResult(analysis);
        } else {
          interimTranscript += transcript;
        }
      }
    };

    this.recognition.onerror = (event) => {
      onError(`Speech recognition error: ${event.error}`);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      onError(`Failed to start speech recognition: ${error}`);
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  private analyzeVoice(transcript: string, confidence: number): VoiceAnalysis {
    // Detect language
    const detectedLanguage = this.detectLanguage(transcript);
    
    // Analyze emotional tone based on keywords and patterns
    const emotionalTone = this.analyzeEmotionalTone(transcript);
    
    // Estimate speech rate (simplified)
    const speechRate = this.estimateSpeechRate(transcript);

    return {
      transcript,
      confidence: confidence || 0.8,
      detectedLanguage,
      emotionalTone,
      speechRate
    };
  }

  private detectLanguage(text: string): string {
    // Simple language detection based on script
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;
    
    const hasHindi = hindiPattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    if (hasHindi && hasEnglish) return 'mixed';
    if (hasHindi) return 'hindi';
    return 'english';
  }

  private analyzeEmotionalTone(text: string): VoiceAnalysis['emotionalTone'] {
    const lowerText = text.toLowerCase();
    
    // Stress indicators
    const stressKeywords = ['stressed', 'tension', 'pressure', 'तनाव', 'परेशान', 'चिंता'];
    if (stressKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'stressed';
    }
    
    // Sadness indicators
    const sadKeywords = ['sad', 'depressed', 'down', 'उदास', 'दुखी', 'निराश'];
    if (sadKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'sad';
    }
    
    // Anxiety indicators
    const anxietyKeywords = ['anxious', 'worried', 'nervous', 'चिंतित', 'घबराहट', 'डर'];
    if (anxietyKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'anxious';
    }
    
    // Happiness indicators
    const happyKeywords = ['happy', 'good', 'great', 'खुश', 'अच्छा', 'बेहतर'];
    if (happyKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'happy';
    }
    
    return 'neutral';
  }

  private estimateSpeechRate(text: string): VoiceAnalysis['speechRate'] {
    // Simplified speech rate estimation based on text length
    // In a real implementation, this would use timing data
    const wordCount = text.split(' ').length;
    
    if (wordCount < 5) return 'slow';
    if (wordCount > 15) return 'fast';
    return 'normal';
  }

  async speakText(
    text: string,
    language: 'hi-IN' | 'en-IN' = 'en-IN',
    rate: number = 1.0,
    pitch: number = 1.0
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 0.8;

      // Try to find a voice for the specified language
      const voices = this.synthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(language.split('-')[0])
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  async getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      const voices = this.synthesis.getVoices();
      
      if (voices.length > 0) {
        resolve(voices);
      } else {
        // Wait for voices to load
        this.synthesis.onvoiceschanged = () => {
          resolve(this.synthesis.getVoices());
        };
      }
    });
  }

  isSupported(): boolean {
    return !!(this.recognition && this.synthesis);
  }

  isListeningActive(): boolean {
    return this.isListening;
  }
}

// Export singleton instance
export const speechService = new SpeechService();

// Voice-enabled AI companion responses
export class VoiceEnabledAI {
  private speechService: SpeechService;

  constructor() {
    this.speechService = new SpeechService();
  }

  async startVoiceConversation(
    onTranscript: (analysis: VoiceAnalysis) => void,
    onError: (error: string) => void,
    language: 'hi-IN' | 'en-IN' | 'auto' = 'auto'
  ): Promise<void> {
    await this.speechService.startListening(
      { language, continuous: true, interimResults: true },
      onTranscript,
      onError
    );
  }

  stopVoiceConversation(): void {
    this.speechService.stopListening();
  }

  async respondWithVoice(
    text: string,
    language: 'hi-IN' | 'en-IN' = 'en-IN',
    emotionalTone: 'calm' | 'supportive' | 'energetic' = 'calm'
  ): Promise<void> {
    // Adjust speech parameters based on emotional tone
    const speechParams = {
      calm: { rate: 0.8, pitch: 0.9 },
      supportive: { rate: 0.9, pitch: 1.0 },
      energetic: { rate: 1.1, pitch: 1.1 }
    };

    const params = speechParams[emotionalTone];
    
    await this.speechService.speakText(text, language, params.rate, params.pitch);
  }

  isVoiceSupported(): boolean {
    return this.speechService.isSupported();
  }
}

export const voiceAI = new VoiceEnabledAI();