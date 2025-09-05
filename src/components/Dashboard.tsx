import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Flame, Trophy, TrendingUp, Calendar, Star, Target, Lightbulb } from 'lucide-react';
import type { Screen, UserData } from '../types';

interface DashboardProps {
  navigateTo: (screen: Screen) => void;
  userData: UserData;
}

export function Dashboard({ navigateTo, userData }: DashboardProps) {
  const insights = [
    "Your sleep quality has improved by 15% this week!",
    "Morning check-ins seem to boost your mood for the day.",
    "You're most productive on days when you complete breathing exercises.",
    "Your stress levels are lower after journaling sessions."
  ];

  const weeklyGoals = [
    { name: "Complete daily check-ins", progress: 5, target: 7 },
    { name: "Practice mindfulness", progress: 3, target: 5 },
    { name: "Journal entries", progress: 4, target: 3 },
    { name: "Breathing exercises", progress: 2, target: 4 }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo(userData.quizCompleted ? 'post-quiz-home' : 'home')}
            className="mr-4 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl">Your Wellness Dashboard</h1>
        </div>

        {/* Streak Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-xl font-semibold text-orange-600">{userData.streaks.current} days</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Best Streak</p>
                <p className="text-xl font-semibold text-yellow-600">{userData.streaks.longest} days</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Milestones */}
        <Card className="p-6 mb-8 bg-card border-primary/20">
          <div className="flex items-center mb-4">
            <Star className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-lg font-medium">Recent Milestones</h2>
          </div>
          <div className="space-y-3">
            {userData.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-sm">{milestone}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Goals */}
        <Card className="p-6 mb-8 bg-card border-primary/20">
          <div className="flex items-center mb-4">
            <Target className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-lg font-medium">This Week's Goals</h2>
          </div>
          <div className="space-y-4">
            {weeklyGoals.map((goal, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{goal.name}</span>
                  <Badge variant={goal.progress >= goal.target ? "default" : "secondary"}>
                    {goal.progress}/{goal.target}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Insights */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center mb-4">
            <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-blue-800">Personal Insights</h2>
          </div>
          <div className="space-y-3">
            {insights.slice(0, 2).map((insight, index) => (
              <div key={index} className="flex items-start space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700">{insight}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigateTo('stats')}
            variant="outline"
            className="h-12 border-primary/30 hover:bg-primary/5"
          >
            View Stats
          </Button>
          <Button
            onClick={() => navigateTo('quiz')}
            className="h-12 bg-primary hover:bg-primary/90"
          >
            Take Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}