import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { BarChart, BookOpen, MessageCircle, Activity } from 'lucide-react';
// Import the meditation icon
const meditationIcon = new URL('../assets/819e0f5f94733abaa2536b7d855c8a7c099ea006.png', import.meta.url).href;
import type { Screen, UserData } from '../types';

interface HomePageProps {
  navigateTo?: (screen: Screen) => void;
  userData?: UserData;
}

export function HomePage({ navigateTo, userData }: HomePageProps = {}) {
  return (
    <div className="min-h-screen bg-background p-6 relative">
      {/* Stats button in top-right */}
      <div className="absolute top-6 right-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateTo('stats')}
          className="rounded-full border-primary/30 hover:bg-primary/5"
        >
          <BarChart className="w-4 h-4 mr-2" />
          Stats
        </Button>
      </div>

      {/* Central content */}
      <div className="flex flex-col items-center justify-center min-h-screen max-w-lg mx-auto px-6">
        {/* App name and central meditation icon */}
        <div className="text-center mb-16 w-full">
          <h1 className="app-title text-5xl mb-8 text-foreground">MannMitra</h1>
          <div className="w-full max-w-sm mx-auto mb-10 logo-container">
            <img
              src={meditationIcon}
              alt="MannMitra Logo"
              className="w-full h-80 object-contain logo-image"
            />
          </div>
          <h2 className="text-3xl mb-4 text-foreground">Welcome back</h2>
          <p className="text-muted-foreground text-lg">How are you feeling today?</p>
        </div>

        {/* Action buttons - positioned below the central element */}
        <div className="w-full space-y-4 max-w-sm">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer bg-card border-primary/20"
            onClick={() => navigateTo('quiz')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Get Started Quiz</h3>
                <p className="text-sm text-muted-foreground">Quick wellness check-in</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer bg-card border-primary/20"
            onClick={() => navigateTo('calm-down')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Calm-Down Session</h3>
                <p className="text-sm text-muted-foreground">5-minute guided breathing</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer bg-card border-primary/20"
            onClick={() => navigateTo('ai-companion')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent/50 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">AI मित्र / AI Companion</h3>
                <p className="text-sm text-muted-foreground">आपका सहायक साथी / Your supportive friend</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer bg-card border-primary/20"
            onClick={() => navigateTo('journal')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent/50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Journal & Vent</h3>
                <p className="text-sm text-muted-foreground">Express your thoughts</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Dashboard link at bottom */}
        <div className="mt-10">
          <Button
            variant="ghost"
            onClick={() => navigateTo('dashboard')}
            className="text-primary hover:bg-primary/10"
          >
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;