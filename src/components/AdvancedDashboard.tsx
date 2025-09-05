import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Brain, 
  Heart, 
  Mic, 
  Camera, 
  TrendingUp, 
  Shield, 
  Users, 
  Calendar,
  Activity,
  MessageCircle,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

import { sessionManager } from '../services/sessionManager';
import { aiOrchestrator } from '../services/aiOrchestrator';
import { voiceAnalysis } from '../services/voiceAnalysis';
import { emotionDetection } from '../services/emotionDetection';

interface DashboardProps {
  userId: string;
}

export const AdvancedDashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState<any>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [sessionInsights, setSessionInsights] = useState<any>(null);
  const [riskLevel, setRiskLevel] = useState<'none' | 'low' | 'moderate' | 'high' | 'severe'>('none');

  useEffect(() => {
    loadUserProgress();
  }, [userId]);

  const loadUserProgress = async () => {
    try {
      const progress = await sessionManager.getUserProgress(userId, 'month');
      setUserProgress(progress);
    } catch (error) {
      console.error('Failed to load user progress:', error);
    }
  };

  const startNewSession = async (sessionType: 'chat' | 'voice' | 'video') => {
    try {
      const sessionId = await sessionManager.startSession(userId, sessionType, {
        goals: ['emotional_regulation', 'stress_management'],
        culturalContext: {
          languagePreference: 'mixed'
        }
      });
      setActiveSession(sessionId);
      
      if (sessionType === 'voice') {
        await startVoiceAnalysis();
      } else if (sessionType === 'video') {
        await startVideoAnalysis();
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const startVoiceAnalysis = async () => {
    try {
      setIsVoiceActive(true);
      await voiceAnalysis.startVoiceAnalysis(
        (result) => {
          setRealTimeAnalysis(prev => ({
            ...prev,
            voice: result
          }));
          
          // Update risk level based on voice analysis
          if (result.mentalHealthIndicators.stressLevel > 0.8) {
            setRiskLevel('high');
          } else if (result.mentalHealthIndicators.stressLevel > 0.6) {
            setRiskLevel('moderate');
          }
        },
        {
          language: 'auto',
          realTimeAnalysis: true,
          sensitivity: 'high'
        }
      );
    } catch (error) {
      console.error('Voice analysis failed:', error);
      setIsVoiceActive(false);
    }
  };

  const startVideoAnalysis = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Set up video element for emotion detection
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // Analyze emotions every 2 seconds
      const analysisInterval = setInterval(async () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx?.drawImage(video, 0, 0);
          
          canvas.toBlob(async (blob) => {
            if (blob) {
              const result = await emotionDetection.analyzeImage(blob);
              setRealTimeAnalysis(prev => ({
                ...prev,
                emotion: result
              }));
            }
          });
        } catch (error) {
          console.error('Emotion analysis error:', error);
        }
      }, 2000);
      
      // Store interval for cleanup
      (window as any).emotionAnalysisInterval = analysisInterval;
    } catch (error) {
      console.error('Video analysis failed:', error);
      setIsCameraActive(false);
    }
  };

  const stopAnalysis = () => {
    if (isVoiceActive) {
      voiceAnalysis.stopVoiceAnalysis();
      setIsVoiceActive(false);
    }
    
    if (isCameraActive) {
      // Stop video stream
      if ((window as any).emotionAnalysisInterval) {
        clearInterval((window as any).emotionAnalysisInterval);
      }
      setIsCameraActive(false);
    }
    
    setRealTimeAnalysis(null);
  };

  const endSession = async () => {
    if (!activeSession) return;
    
    try {
      stopAnalysis();
      const sessionReport = await sessionManager.endSession(activeSession);
      setSessionInsights(sessionReport);
      setActiveSession(null);
      await loadUserProgress(); // Refresh progress data
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const getRiskLevelColor = (level: string) => {
    const colors = {
      none: 'bg-green-100 text-green-800',
      low: 'bg-yellow-100 text-yellow-800',
      moderate: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
      severe: 'bg-red-200 text-red-900'
    };
    return colors[level as keyof typeof colors] || colors.none;
  };

  const getProgressColor = (value: number) => {
    if (value >= 0.8) return 'bg-green-500';
    if (value >= 0.6) return 'bg-blue-500';
    if (value >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MannMitra Advanced Dashboard</h1>
            <p className="text-gray-600">AI-Powered Mental Health Companion</p>
          </div>
          
          {/* Risk Level Indicator */}
          <Badge className={`px-4 py-2 text-sm font-medium ${getRiskLevelColor(riskLevel)}`}>
            Risk Level: {riskLevel.toUpperCase()}
          </Badge>
        </div>

        {/* Active Session Controls */}
        {!activeSession ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Start New Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  onClick={() => startNewSession('chat')}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Text Chat
                </Button>
                <Button 
                  onClick={() => startNewSession('voice')}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Mic className="h-4 w-4" />
                  Voice Analysis
                </Button>
                <Button 
                  onClick={() => startNewSession('video')}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Camera className="h-4 w-4" />
                  Video + Emotion Detection
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Active Session: {activeSession}
                </span>
                <Button onClick={endSession} variant="destructive">
                  End Session
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isVoiceActive && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Mic className="h-4 w-4" />
                    Voice Analysis Active
                  </div>
                )}
                {isCameraActive && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Camera className="h-4 w-4" />
                    Emotion Detection Active
                  </div>
                )}
                {activeSession && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <Brain className="h-4 w-4" />
                    AI Analysis Running
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real-time Analysis */}
        {realTimeAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="emotion" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="emotion">Emotion</TabsTrigger>
                  <TabsTrigger value="voice">Voice</TabsTrigger>
                  <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
                </TabsList>
                
                <TabsContent value="emotion" className="space-y-4">
                  {realTimeAnalysis.emotion && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Primary Emotion</h4>
                        <Badge className="text-lg px-3 py-1">
                          {realTimeAnalysis.emotion.primaryEmotion}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Confidence</h4>
                        <Progress 
                          value={realTimeAnalysis.emotion.confidence * 100} 
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="voice" className="space-y-4">
                  {realTimeAnalysis.voice && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Emotional Tone</h4>
                        <Badge>{realTimeAnalysis.voice.emotionalIndicators.tone}</Badge>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Stress Level</h4>
                        <Progress 
                          value={realTimeAnalysis.voice.mentalHealthIndicators.stressLevel * 100}
                          className={`w-full ${getProgressColor(realTimeAnalysis.voice.mentalHealthIndicators.stressLevel)}`}
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="risk" className="space-y-4">
                  <Alert className={riskLevel !== 'none' ? 'border-orange-200 bg-orange-50' : ''}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Current risk level: <strong>{riskLevel}</strong>
                      {riskLevel !== 'none' && (
                        <div className="mt-2">
                          <Button size="sm" variant="outline">
                            View Safety Resources
                          </Button>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Progress Overview */}
        {userProgress && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(userProgress.overallProgress.progress * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Trend: {userProgress.overallProgress.trend}
                </p>
                <Progress 
                  value={userProgress.overallProgress.progress * 100} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Emotional Stability</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProgress.emotionalTrends.valenceTrend}
                </div>
                <p className="text-xs text-muted-foreground">
                  Dominant: {userProgress.emotionalTrends.dominantEmotions[0]}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Status</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProgress.riskTrends.currentRisk}
                </div>
                <p className="text-xs text-muted-foreground">
                  Trend: {userProgress.riskTrends.riskTrend}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sessions This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Therapeutic Journey</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="goals" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="goals">Goals Progress</TabsTrigger>
                <TabsTrigger value="emotions">Emotional Trends</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
              
              <TabsContent value="goals" className="space-y-4">
                {userProgress?.goalProgress && Object.entries(userProgress.goalProgress).map(([goal, progress]: [string, any]) => (
                  <div key={goal} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium capitalize">
                        {goal.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(progress * 100)}%
                      </span>
                    </div>
                    <Progress value={progress * 100} />
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="emotions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Dominant Emotions</h4>
                    <div className="space-y-2">
                      {userProgress?.emotionalTrends.dominantEmotions.map((emotion: string, index: number) => (
                        <Badge key={emotion} variant="outline">
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Intensity Trend</h4>
                    <Badge className={
                      userProgress?.emotionalTrends.intensityTrend === 'decreasing' 
                        ? 'bg-green-100 text-green-800'
                        : userProgress?.emotionalTrends.intensityTrend === 'increasing'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {userProgress?.emotionalTrends.intensityTrend}
                    </Badge>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="insights" className="space-y-4">
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>AI Recommendation:</strong> Your emotional regulation has improved by 15% this month. 
                      Continue practicing the mindfulness techniques we discussed.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Area for Focus:</strong> Stress levels tend to peak on weekdays. 
                      Consider implementing morning meditation routine.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
              
              <TabsContent value="resources" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Self-Help Resources</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Guided meditation apps (Hindi/English)</li>
                      <li>• Breathing exercises</li>
                      <li>• Journaling prompts</li>
                      <li>• Cultural wellness practices</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Professional Support</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Local therapists</li>
                      <li>• Online counseling platforms</li>
                      <li>• Support groups</li>
                      <li>• Crisis helplines</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Session Insights Modal */}
        {sessionInsights && (
          <Card>
            <CardHeader>
              <CardTitle>Session Complete - Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Session Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    Duration: {Math.round(sessionInsights.sessionSummary.duration / 60000)} minutes
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Interactions: {sessionInsights.sessionSummary.interactionCount}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium">Key Insights</h4>
                  <ul className="text-sm space-y-1">
                    {sessionInsights.sessionSummary.keyInsights.map((insight: string, index: number) => (
                      <li key={index}>• {insight}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium">Recommendations</h4>
                  <ul className="text-sm space-y-1">
                    {sessionInsights.recommendations.map((rec: string, index: number) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  onClick={() => setSessionInsights(null)}
                  className="w-full"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdvancedDashboard;