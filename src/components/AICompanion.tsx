import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { ArrowLeft, Send, User, Heart, AlertTriangle, Phone, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import type { Screen, UserData } from '../types';
import { geminiAI, type ConversationContext, type AIResponse } from '../services/geminiAI';
import { assessCrisisLevel, shouldShowCrisisResources } from '../utils/crisisDetection';

interface VoiceAnalysis {
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
    complexityScore: number;
    hesitationMarkers: number;
  };
}

interface EmotionAnalysis {
  faceDetected: boolean;
  emotions: {
    joy: number;
    sorrow: number;
    anger: number;
    surprise: number;
    fear: number;
    disgust: number;
  };
  primary_emotion: string;
  confidence: number;
  wellness_indicators: {
    stress_level: number;
    energy_level: number;
    engagement_level: number;
  };
  facialFeatures: {
    eyeContact: boolean;
    facialTension: number;
    microExpressions: string[];
  };
}

interface AICompanionProps {
  navigateTo?: (screen: Screen) => void;
  userData?: UserData;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  mood?: 'positive' | 'neutral' | 'negative' | 'crisis';
  aiResponse?: AIResponse;
  voiceAnalysis?: VoiceAnalysis;
  emotionAnalysis?: EmotionAnalysis;
}

export function AICompanion({ navigateTo, userData }: AICompanionProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionAnalysis | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);

  // Crisis helplines for India
  const crisisHelplines = [
    { name: 'Vandrevala Foundation', number: '9999 666 555', available: '24/7' },
    { name: 'AASRA', number: '91-22-27546669', available: '24/7' },
    { name: 'Sneha Foundation', number: '044-24640050', available: '24/7' },
    { name: 'iCall', number: '9152987821', available: 'Mon-Sat, 8AM-10PM' }
  ];

  // Removed buildMentalHealthContext - now using simpler context directly in functions

  // Handle voice input with Web Speech API (demo version)
  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    if (isVoiceMode) {
      setIsVoiceMode(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = userData.preferences?.preferredLanguage === 'hindi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsVoiceMode(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;

        setInputValue(transcript);
        setIsVoiceMode(false);

        // Create mock voice analysis
        const voiceAnalysis: VoiceAnalysis = {
          transcript,
          confidence,
          language: recognition.lang,
          emotionalIndicators: {
            tone: 'neutral',
            intensity: 0.5,
            speechRate: 'normal',
            volume: 'normal'
          },
          linguisticFeatures: {
            wordCount: transcript.split(' ').length,
            sentimentScore: 0,
            complexityScore: 0.5,
            hesitationMarkers: 0
          }
        };

        // Auto-send after voice input
        setTimeout(() => handleSendMessage(voiceAnalysis), 1000);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsVoiceMode(false);
        alert('Voice recognition failed. Please try again.');
      };

      recognition.onend = () => {
        setIsVoiceMode(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Voice input error:', error);
      alert('Voice input failed. Please try typing instead.');
    }
  };

  // Handle video mood detection (demo version)
  const handleVideoMood = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Camera not supported in this browser');
      return;
    }

    if (isVideoMode) {
      setIsVideoMode(false);
      setCurrentEmotion(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        video.srcObject = stream;
        video.play();

        setIsVideoMode(true);

        // Capture frame after video loads
        video.onloadedmetadata = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);

          canvas.toDataURL('image/jpeg', 0.8);

          // Create mock emotion analysis for demo (replace with real API when available)
          const mockEmotion: EmotionAnalysis = {
            faceDetected: true,
            emotions: {
              joy: 0.3,
              sorrow: 0.1,
              anger: 0.05,
              surprise: 0.2,
              fear: 0.1,
              disgust: 0.05
            },
            primary_emotion: 'joy',
            confidence: 0.75,
            wellness_indicators: {
              stress_level: 0.3,
              energy_level: 0.6,
              engagement_level: 0.7
            },
            facialFeatures: {
              eyeContact: true,
              facialTension: 0.3,
              microExpressions: ['slight_smile']
            }
          };

          setCurrentEmotion(mockEmotion);
          stream.getTracks().forEach(track => track.stop());
          setIsVideoMode(false);
        };
      } catch (error) {
        console.error('Camera access error:', error);
        alert('Camera access denied. Please enable camera permissions.');
        setIsVideoMode(false);
      }
    }
  };

  // Generate AI response using real Gemini AI
  const generateAIResponse = async (userMessage: string, voiceAnalysis?: VoiceAnalysis): Promise<AIResponse> => {
    try {
      const crisisAssessment = assessCrisisLevel(userMessage);

      // Validate and cast language preference
      const userLanguage = userData.preferences?.preferredLanguage;
      const validLanguage: 'english' | 'hindi' | 'mixed' =
        userLanguage === 'english' || userLanguage === 'hindi' || userLanguage === 'mixed'
          ? userLanguage
          : 'mixed';

      const context: ConversationContext = {
        userMood: currentEmotion?.primary_emotion || 'neutral',
        preferredLanguage: validLanguage,
        culturalBackground: 'Indian youth',
        previousMessages: conversationHistory,
        userPreferences: {
          interests: userData.preferences?.interests || [],
          comfortEnvironment: userData.preferences?.comfortEnvironment || 'peaceful',
          avatarStyle: userData.preferences?.avatarStyle || 'supportive'
        },
        crisisLevel: crisisAssessment.level
      };

      // Include voice analysis if available
      if (voiceAnalysis) {
        context.userMood = voiceAnalysis.emotionalIndicators.tone;
      }

      console.log('🤖 Sending request to Gemini AI...', { userMessage, context });
      const response = await geminiAI.generateEmpathicResponse(userMessage, context);
      console.log('✅ Received AI response:', response);

      return response;
    } catch (error) {
      console.error('❌ Gemini AI error:', error);

      // Show user-friendly error message
      const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY as string;
      const isAPIKeyMissing = !apiKey ||
        apiKey === 'demo-key-for-development' ||
        apiKey.startsWith('demo-') ||
        apiKey === 'AIzaSyC-PUT-YOUR-ACTUAL-API-KEY-HERE';

      if (isAPIKeyMissing) {
        console.warn('⚠️ Please add your Gemini API key to enable AI responses');
      }

      // Fallback response
      const userLanguage = userData.preferences?.preferredLanguage;
      const language: 'english' | 'hindi' | 'mixed' =
        userLanguage === 'english' || userLanguage === 'hindi' || userLanguage === 'mixed'
          ? userLanguage
          : 'mixed';

      const fallbackMessages = {
        english: isAPIKeyMissing ?
          "I'd love to help you with AI-powered responses! Please add your Gemini API key to enable this feature." :
          "I'm here to listen and support you. Your feelings are valid, and you're not alone in this journey.",
        hindi: isAPIKeyMissing ?
          "मैं AI की मदद से आपका साथ देना चाहता हूँ! कृपया Gemini API key जोड़ें।" :
          "मैं यहाँ आपको सुनने और सहारा देने के लिए हूँ। आपकी भावनाएं सही हैं, और इस सफर में आप अकेले नहीं हैं।",
        mixed: isAPIKeyMissing ?
          "मैं AI-powered responses देना चाहता हूँ! Please add your Gemini API key।" :
          "मैं यहाँ हूँ आपके साथ। Your feelings are valid और आप alone नहीं हैं इस journey में।"
      };

      return {
        message: fallbackMessages[language],
        suggestedActions: ['Take deep breaths / गहरी सांस लें', 'Talk to someone you trust / किसी भरोसेमंद से बात करें'],
        moodAssessment: 'supportive_needed',
        followUpQuestions: ['How are you feeling right now? / अभी आप कैसा महसूस कर रहे हैं?']
      };
    }
  };

  // Initialize with personalized greeting
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Generate personalized greeting using Gemini AI
        // Validate and cast language preference
        const userLanguage = userData.preferences?.preferredLanguage;
        const validLanguage: 'english' | 'hindi' | 'mixed' =
          userLanguage === 'english' || userLanguage === 'hindi' || userLanguage === 'mixed'
            ? userLanguage
            : 'mixed';

        const context: ConversationContext = {
          userMood: 'neutral',
          preferredLanguage: validLanguage,
          culturalBackground: 'Indian youth',
          previousMessages: [],
          userPreferences: {
            interests: userData.preferences?.interests || [],
            comfortEnvironment: userData.preferences?.comfortEnvironment || 'peaceful',
            avatarStyle: userData.preferences?.avatarStyle || 'supportive'
          },
          crisisLevel: 'none'
        };

        console.log('🚀 Initializing AI companion with context:', context);
        const greetingResponse = await geminiAI.generateEmpathicResponse(
          "User just opened the app for the first time today. Greet them warmly and ask how they're feeling.",
          context
        );

        const greeting: Message = {
          id: '1',
          content: greetingResponse.message,
          sender: 'ai',
          timestamp: new Date(),
          aiResponse: greetingResponse
        };

        setMessages([greeting]);
      } catch (error) {
        console.error('Chat initialization error:', error);

        // Fallback greeting
        const userLanguage = userData.preferences?.preferredLanguage;
        const language: 'english' | 'hindi' | 'mixed' =
          userLanguage === 'english' || userLanguage === 'hindi' || userLanguage === 'mixed'
            ? userLanguage
            : 'mixed';

        const fallbackGreetings = {
          english: "Hi there! I'm MannMitra, your AI companion. I'm here to listen and support you. How are you feeling today?",
          hindi: "नमस्ते! मैं मन मित्र हूँ, आपका AI साथी। मैं यहाँ आपको सुनने और सहारा देने के लिए हूँ। आज आप कैसा महसूस कर रहे हैं?",
          mixed: "Hi! मैं MannMitra हूँ, आपका AI companion। I'm here आपको support करने के लिए। आज कैसा feel कर रहे हैं?"
        };

        const greeting: Message = {
          id: '1',
          content: fallbackGreetings[language],
          sender: 'ai',
          timestamp: new Date()
        };

        setMessages([greeting]);
      }
    };

    initializeChat();
  }, []);

  const handleSendMessage = async (voiceAnalysis?: VoiceAnalysis) => {
    const messageText = inputValue.trim();
    if (!messageText) return;

    // Crisis detection
    const crisisAssessment = assessCrisisLevel(messageText);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
      mood: crisisAssessment.level === 'none' ? 'neutral' :
        crisisAssessment.level === 'severe' || crisisAssessment.level === 'high' ? 'crisis' : 'negative',
      voiceAnalysis,
      emotionAnalysis: currentEmotion || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setConversationHistory(prev => [...prev, messageText]);
    setInputValue('');
    setIsTyping(true);

    // Show crisis support if needed
    if (shouldShowCrisisResources(crisisAssessment)) {
      setShowCrisisSupport(true);
    }

    try {
      // Generate AI response using Gemini
      const aiResponse = await generateAIResponse(messageText, voiceAnalysis);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.message,
        sender: 'ai',
        timestamp: new Date(),
        aiResponse
      };

      setMessages(prev => [...prev, aiMessage]);

      // Voice response could be added here with Web Speech API
      // if (isVoiceMode) {
      //   const utterance = new SpeechSynthesisUtterance(aiResponse.message);
      //   utterance.lang = userData.preferences?.preferredLanguage === 'hindi' ? 'hi-IN' : 'en-IN';
      //   speechSynthesis.speak(utterance);
      // }

    } catch (error) {
      console.error('Error generating AI response:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "मुझे खुशी होगी अगर आप फिर से कोशिश करें। / I'd be happy if you try again.",
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickResponses = [
    'मैं stressed feel कर रहा हूँ',
    'I feel anxious',
    'आज अच्छा लग रहा है',
    'Need someone to talk',
    'परेशान हूँ',
    'Feeling better today'
  ];

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <div className="max-w-lg mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo?.('home')}
            className="mr-4 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-medium">आपका मित्र / Your Companion</h1>
              <p className="text-xs text-muted-foreground">हमेशा यहाँ सुनने के लिए / Always here to listen</p>
            </div>
          </div>
        </div>

        {/* Crisis Support Banner */}
        {showCrisisSupport && (
          <Card className="p-4 mb-4 bg-red-50 border-red-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800 mb-2">तत्काल सहायता / Immediate Support</h3>
                <p className="text-sm text-red-700 mb-3">
                  आप अकेले नहीं हैं। Professional help available है:
                </p>
                <div className="space-y-2">
                  {crisisHelplines.slice(0, 2).map((helpline, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Phone className="w-4 h-4 text-red-600" />
                      <span className="font-medium">{helpline.name}:</span>
                      <span className="text-red-800">{helpline.number}</span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCrisisSupport(false)}
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                >
                  समझ गया / Got it
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Messages */}
        <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user'
                  ? 'bg-primary/20'
                  : 'bg-secondary/50'
                  }`}>
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 text-primary" />
                  ) : (
                    <Heart className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <Card className={`p-3 ${message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border-primary/20'
                    }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </Card>
                  <p className={`text-xs text-muted-foreground mt-1 ${message.sender === 'user' ? 'text-right' : 'text-left'
                    }`}>
                    {message.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-[85%]">
                <div className="w-8 h-8 bg-secondary/50 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-primary" />
                </div>
                <Card className="p-3 bg-card border-primary/20">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Input with Voice and Video */}
        <div className="space-y-3">
          {/* Emotion indicator */}
          {currentEmotion && (
            <Card className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">😊</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    Detected mood: {currentEmotion.primary_emotion} ({Math.round(currentEmotion.confidence * 100)}% confidence)
                  </p>
                  <p className="text-xs text-blue-600">
                    Stress: {Math.round(currentEmotion.wellness_indicators.stress_level * 100)}% |
                    Energy: {Math.round(currentEmotion.wellness_indicators.energy_level * 100)}%
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={isVoiceMode ? "Listening... / सुन रहा हूँ..." : "अपनी बात कहें... / Share your thoughts..."}
              className="flex-1 border-primary/20 focus:border-primary/40"
              onKeyDown={(e) => e.key === 'Enter' && !isVoiceMode && handleSendMessage()}
              disabled={isVoiceMode}
            />

            {/* Voice input button */}
            <Button
              onClick={handleVoiceInput}
              variant={isVoiceMode ? "default" : "outline"}
              size="sm"
              className={isVoiceMode ? "bg-red-500 hover:bg-red-600 text-white" : "border-primary/30 hover:bg-primary/5"}
              title={isVoiceMode ? "Stop listening" : "Start voice input"}
            >
              {isVoiceMode ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {/* Video mood detection button */}
            <Button
              onClick={handleVideoMood}
              variant={isVideoMode ? "default" : "outline"}
              size="sm"
              className={isVideoMode ? "bg-green-500 hover:bg-green-600 text-white" : "border-primary/30 hover:bg-primary/5"}
              title={isVideoMode ? "Stop mood detection" : "Start mood detection"}
            >
              {isVideoMode ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            </Button>

            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping || isVoiceMode}
              className="bg-primary hover:bg-primary/90"
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick responses */}
          <div className="flex flex-wrap gap-2">
            {quickResponses.map((response, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInputValue(response);
                  setTimeout(handleSendMessage, 100);
                }}
                className="text-xs border-primary/30 hover:bg-primary/5"
              >
                {response}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AICompanion;