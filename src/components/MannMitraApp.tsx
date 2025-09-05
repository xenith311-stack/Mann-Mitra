import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Import existing components
import OnboardingFlow from './OnboardingFlow';
import HomePage from './HomePage';
import AICompanion from './AICompanion';
import Journal from './Journal';
import PostQuizHome from './PostQuizHome';

// Import new advanced components
import AdvancedDashboard from './AdvancedDashboard';

// Import services
import { sessionManager } from '../services/sessionManager';
import { aiOrchestrator } from '../services/aiOrchestrator';
import { voiceAnalysis } from '../services/voiceAnalysis';
import { emotionDetection } from '../services/emotionDetection';

// Navigation component
import { Sidebar } from './ui/sidebar';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Home, 
  Brain, 
  BookOpen, 
  MessageCircle, 
  BarChart3, 
  Settings, 
  User,
  Shield,
  Heart,
  Mic,
  Camera,
  Activity
} from 'lucide-react';

interface User {
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

export const MannMitraApp: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState('/');
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    aiOrchestrator: false,
    voiceAnalysis: false,
    emotionDetection: false,
    sessionManager: false
  });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check system status
      const status = {
        aiOrchestrator: true, // AI Orchestrator is always available
        voiceAnalysis: voiceAnalysis.isServiceAvailable(),
        emotionDetection: emotionDetection.isServiceAvailable(),
        sessionManager: sessionManager.getActiveSessionsCount() >= 0
      };
      setSystemStatus(status);

      // Load user data (in production, this would come from authentication)
      const userData = localStorage.getItem('mannmitra_user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setCurrentRoute(user.onboardingComplete ? '/dashboard' : '/onboarding');
      } else {
        setCurrentRoute('/onboarding');
      }
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = (userData: any) => {
    const user: User = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      onboardingComplete: true,
      preferences: {
        language: userData.language || 'mixed',
        culturalBackground: userData.culturalBackground || 'indian',
        communicationStyle: userData.communicationStyle || 'casual'
      },
      mentalHealthProfile: {
        primaryConcerns: userData.concerns || [],
        goals: userData.goals || [],
        riskFactors: userData.riskFactors || [],
        protectiveFactors: userData.protectiveFactors || []
      }
    };

    setCurrentUser(user);
    localStorage.setItem('mannmitra_user', JSON.stringify(user));
    setCurrentRoute('/dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mannmitra_user');
    setCurrentRoute('/onboarding');
  };

  const NavigationSidebar = () => {
    const menuItems = [
      { icon: BarChart3, label: 'Dashboard', route: '/dashboard', premium: false },
      { icon: MessageCircle, label: 'AI Companion', route: '/companion', premium: false },
      { icon: BookOpen, label: 'Journal', route: '/journal', premium: false },
      { icon: Home, label: 'Home', route: '/home', premium: false },
      { icon: Brain, label: 'Advanced Analytics', route: '/analytics', premium: false },
      { icon: Mic, label: 'Voice Therapy', route: '/voice', premium: false },
      { icon: Camera, label: 'Emotion Detection', route: '/emotion', premium: false },
      { icon: Settings, label: 'Settings', route: '/settings', premium: false }
    ];

    return (
      <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">MannMitra</h1>
              <p className="text-xs text-gray-500">AI Mental Health Companion</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        {currentUser && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="p-4 border-b">
          <h3 className="text-xs font-medium text-gray-500 mb-2">SYSTEM STATUS</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs">AI Services</span>
              <Badge variant={systemStatus.aiOrchestrator ? 'default' : 'destructive'} className="text-xs">
                {systemStatus.aiOrchestrator ? 'Online' : 'Offline'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Voice Analysis</span>
              <Badge variant={systemStatus.voiceAnalysis ? 'default' : 'secondary'} className="text-xs">
                {systemStatus.voiceAnalysis ? 'Ready' : 'Unavailable'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Emotion Detection</span>
              <Badge variant={systemStatus.emotionDetection ? 'default' : 'secondary'} className="text-xs">
                {systemStatus.emotionDetection ? 'Ready' : 'Unavailable'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.route}
                variant={currentRoute === item.route ? 'default' : 'ghost'}
                className="w-full justify-start gap-3"
                onClick={() => setCurrentRoute(item.route)}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
              </Button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    );
  };

  const MainContent = () => {
    if (!currentUser) {
      return <OnboardingFlow onComplete={handleOnboardingComplete} />;
    }

    switch (currentRoute) {
      case '/dashboard':
        return <AdvancedDashboard userId={currentUser.id} />;
      case '/companion':
        return <AICompanion />;
      case '/journal':
        return <Journal />;
      case '/home':
        return <HomePage />;
      case '/analytics':
        return <AdvancedAnalytics userId={currentUser.id} />;
      case '/voice':
        return <VoiceTherapyInterface userId={currentUser.id} />;
      case '/emotion':
        return <EmotionDetectionInterface userId={currentUser.id} />;
      case '/settings':
        return <SettingsPanel user={currentUser} onUpdate={setCurrentUser} />;
      default:
        return <AdvancedDashboard userId={currentUser.id} />;
    }
  };

  // Advanced Analytics Component
  const AdvancedAnalytics = ({ userId }: { userId: string }) => (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Advanced Analytics (Premium Feature)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Get detailed insights into your mental health journey with advanced AI analytics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Predictive Insights</h4>
              <p className="text-sm text-gray-600">
                AI-powered predictions about your emotional patterns and potential triggers.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Personalized Recommendations</h4>
              <p className="text-sm text-gray-600">
                Customized therapeutic interventions based on your unique profile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Voice Therapy Interface
  const VoiceTherapyInterface = ({ userId }: { userId: string }) => (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Therapy Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Engage in voice-based therapy sessions with real-time emotional analysis.
          </p>
          <div className="space-y-4">
            <Button className="w-full" disabled={!systemStatus.voiceAnalysis}>
              {systemStatus.voiceAnalysis ? 'Start Voice Session' : 'Voice Analysis Unavailable'}
            </Button>
            {!systemStatus.voiceAnalysis && (
              <p className="text-sm text-gray-500">
                Please ensure microphone permissions are granted and try refreshing the page.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Emotion Detection Interface
  const EmotionDetectionInterface = ({ userId }: { userId: string }) => (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Emotion Detection Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Use facial emotion recognition to enhance your therapy experience.
          </p>
          <div className="space-y-4">
            <Button className="w-full" disabled={!systemStatus.emotionDetection}>
              {systemStatus.emotionDetection ? 'Start Video Session' : 'Camera Access Unavailable'}
            </Button>
            {!systemStatus.emotionDetection && (
              <p className="text-sm text-gray-500">
                Please ensure camera permissions are granted and try refreshing the page.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Settings Panel
  const SettingsPanel = ({ user, onUpdate }: { user: User; onUpdate: (user: User) => void }) => (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Language Preference</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={user.preferences.language}
                onChange={(e) => {
                  const updatedUser = {
                    ...user,
                    preferences: {
                      ...user.preferences,
                      language: e.target.value as 'hindi' | 'english' | 'mixed'
                    }
                  };
                  onUpdate(updatedUser);
                  localStorage.setItem('mannmitra_user', JSON.stringify(updatedUser));
                }}
              >
                <option value="mixed">Hindi + English (Mixed)</option>
                <option value="hindi">Hindi</option>
                <option value="english">English</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Communication Style</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={user.preferences.communicationStyle}
                onChange={(e) => {
                  const updatedUser = {
                    ...user,
                    preferences: {
                      ...user.preferences,
                      communicationStyle: e.target.value as 'formal' | 'casual'
                    }
                  };
                  onUpdate(updatedUser);
                  localStorage.setItem('mannmitra_user', JSON.stringify(updatedUser));
                }}
              >
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">MannMitra</h2>
          <p className="text-gray-600">Initializing AI Mental Health Companion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {currentUser && <NavigationSidebar />}
      <div className="flex-1 overflow-auto">
        <MainContent />
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default MannMitraApp;