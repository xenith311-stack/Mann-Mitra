import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, ArrowRight, Heart, Music, TreePine, Book, Coffee, Gamepad2 } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: (userData: any) => void;
}

interface UserPreferences {
  interests: string[];
  comfortEnvironment: string;
  preferredLanguage: string;
  avatarStyle: string;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState<UserPreferences>({
    interests: [],
    comfortEnvironment: '',
    preferredLanguage: 'english',
    avatarStyle: 'friendly'
  });

  const interests = [
    { id: 'music', label: 'संगीत / Music', icon: Music },
    { id: 'nature', label: 'प्रकृति / Nature', icon: TreePine },
    { id: 'reading', label: 'पढ़ना / Reading', icon: Book },
    { id: 'gaming', label: 'गेमिंग / Gaming', icon: Gamepad2 },
    { id: 'meditation', label: 'ध्यान / Meditation', icon: Heart },
    { id: 'coffee', label: 'कैफे / Cafe Vibes', icon: Coffee }
  ];

  const environments = [
    { id: 'nature', label: 'प्राकृतिक वातावरण / Natural Environment', emoji: '🌿' },
    { id: 'cozy', label: 'आरामदायक कमरा / Cozy Room', emoji: '🏠' },
    { id: 'peaceful', label: 'शांत स्थान / Peaceful Space', emoji: '🕯️' },
    { id: 'energetic', label: 'ऊर्जावान माहौल / Energetic Vibe', emoji: '⚡' }
  ];

  const languages = [
    { id: 'english', label: 'English' },
    { id: 'hindi', label: 'हिंदी' },
    { id: 'mixed', label: 'Hinglish (मिश्रित)' }
  ];

  const avatarStyles = [
    { id: 'friendly', label: 'मित्रवत / Friendly', emoji: '😊' },
    { id: 'calm', label: 'शांत / Calm', emoji: '😌' },
    { id: 'supportive', label: 'सहायक / Supportive', emoji: '🤗' }
  ];

  const steps = [
    {
      title: 'आपकी रुचियां / Your Interests',
      subtitle: 'आप क्या पसंद करते हैं? / What do you enjoy?',
      content: 'interests'
    },
    {
      title: 'आरामदायक वातावरण / Comfort Environment',
      subtitle: 'आप कहाँ सबसे अच्छा महसूस करते हैं? / Where do you feel most at peace?',
      content: 'environment'
    },
    {
      title: 'भाषा प्राथमिकता / Language Preference',
      subtitle: 'आप किस भाषा में बात करना पसंद करेंगे? / Which language would you prefer?',
      content: 'language'
    },
    {
      title: 'आपका साथी / Your Companion',
      subtitle: 'आपका AI मित्र कैसा हो? / How should your AI friend be?',
      content: 'avatar'
    }
  ];

  const handleInterestToggle = (interestId: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      onComplete({
        name: 'User', // Default name, can be collected in onboarding if needed
        email: 'user@example.com', // Default email, can be collected if needed
        preferences,
        language: preferences.preferredLanguage,
        culturalBackground: 'indian',
        communicationStyle: 'casual',
        concerns: [], // Can be collected in onboarding if needed
        goals: ['emotional_regulation', 'stress_management'], // Default goals
        riskFactors: [],
        protectiveFactors: []
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return preferences.interests.length > 0;
      case 1: return preferences.comfortEnvironment !== '';
      case 2: return preferences.preferredLanguage !== '';
      case 3: return preferences.avatarStyle !== '';
      default: return true;
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.content) {
      case 'interests':
        return (
          <div className="grid grid-cols-2 gap-3">
            {interests.map((interest) => {
              const IconComponent = interest.icon;
              const isSelected = preferences.interests.includes(interest.id);
              return (
                <Card
                  key={interest.id}
                  className={`p-4 cursor-pointer transition-all ${isSelected
                    ? 'bg-primary/20 border-primary'
                    : 'bg-card border-primary/20 hover:border-primary/40'
                    }`}
                  onClick={() => handleInterestToggle(interest.id)}
                >
                  <div className="text-center space-y-2">
                    <IconComponent className={`w-6 h-6 mx-auto ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="text-sm font-medium">{interest.label}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        );

      case 'environment':
        return (
          <div className="space-y-3">
            {environments.map((env) => (
              <Card
                key={env.id}
                className={`p-4 cursor-pointer transition-all ${preferences.comfortEnvironment === env.id
                  ? 'bg-primary/20 border-primary'
                  : 'bg-card border-primary/20 hover:border-primary/40'
                  }`}
                onClick={() => setPreferences(prev => ({ ...prev, comfortEnvironment: env.id }))}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{env.emoji}</span>
                  <span className="font-medium">{env.label}</span>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'language':
        return (
          <div className="space-y-3">
            {languages.map((lang) => (
              <Card
                key={lang.id}
                className={`p-4 cursor-pointer transition-all ${preferences.preferredLanguage === lang.id
                  ? 'bg-primary/20 border-primary'
                  : 'bg-card border-primary/20 hover:border-primary/40'
                  }`}
                onClick={() => setPreferences(prev => ({ ...prev, preferredLanguage: lang.id }))}
              >
                <div className="text-center">
                  <span className="font-medium">{lang.label}</span>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'avatar':
        return (
          <div className="space-y-3">
            {avatarStyles.map((style) => (
              <Card
                key={style.id}
                className={`p-4 cursor-pointer transition-all ${preferences.avatarStyle === style.id
                  ? 'bg-primary/20 border-primary'
                  : 'bg-card border-primary/20 hover:border-primary/40'
                  }`}
                onClick={() => setPreferences(prev => ({ ...prev, avatarStyle: style.id }))}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{style.emoji}</span>
                  <span className="font-medium">{style.label}</span>
                </div>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-medium">स्वागत है / Welcome</h1>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="mb-8">
          <h2 className="text-2xl mb-2">{steps[currentStep].title}</h2>
          <p className="text-muted-foreground mb-6">{steps[currentStep].subtitle}</p>
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            पीछे / Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-primary hover:bg-primary/90"
          >
            {currentStep === steps.length - 1 ? 'शुरू करें / Start' : 'आगे / Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingFlow;