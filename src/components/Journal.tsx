import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Save, BookOpen, Clock } from 'lucide-react';
import type { Screen } from '../types';

interface JournalProps {
  navigateTo?: (screen: Screen) => void;
}

interface JournalEntry {
  id: string;
  content: string;
  date: string;
  mood: string;
}

export function Journal({ navigateTo }: JournalProps = {}) {
  const [currentEntry, setCurrentEntry] = useState('');
  const [mood, setMood] = useState('');
  const [savedEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      content: 'Today was a good day. I felt more energized after the morning walk and was able to focus better on my work.',
      date: '2025-08-30',
      mood: 'Good'
    },
    {
      id: '2',
      content: 'Feeling a bit overwhelmed with everything going on. Taking some time to breathe and reflect.',
      date: '2025-08-29',
      mood: 'Stressed'
    }
  ]);

  const moodOptions = ['Amazing', 'Good', 'Okay', 'Stressed', 'Sad'];

  const handleSave = () => {
    if (currentEntry.trim()) {
      // In a real app, this would save to a database
      alert('Journal entry saved!');
      setCurrentEntry('');
      setMood('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo?.('home')}
            className="mr-4 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl">Journal & Vent</h1>
        </div>

        {/* New Entry */}
        <Card className="p-6 mb-8 bg-card border-primary/20">
          <div className="flex items-center mb-4">
            <BookOpen className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-lg font-medium">New Entry</h2>
          </div>

          {/* Mood Selection */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">How are you feeling?</p>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((moodOption) => (
                <Button
                  key={moodOption}
                  variant={mood === moodOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMood(moodOption)}
                  className={mood === moodOption ? "bg-primary hover:bg-primary/90" : "border-primary/30 hover:bg-primary/5"}
                >
                  {moodOption}
                </Button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">What's on your mind?</p>
            <Textarea
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              placeholder="Write about your day, your feelings, or anything you want to express..."
              className="min-h-32 resize-none border-primary/20 focus:border-primary/40"
            />
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSave}
            disabled={!currentEntry.trim() || !mood}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Entry
          </Button>
        </Card>

        {/* Previous Entries */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Recent Entries</h2>
          {savedEntries.map((entry) => (
            <Card key={entry.id} className="p-4 bg-card border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatDate(entry.date)}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {entry.mood}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {entry.content}
              </p>
            </Card>
          ))}
        </div>

        {/* Tips */}
        <Card className="p-4 mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <h3 className="font-medium mb-2 text-blue-800">Journaling Tips</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span>Write freely without worrying about grammar</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span>Focus on your emotions and experiences</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              <span>Regular journaling can improve mental clarity</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Journal;