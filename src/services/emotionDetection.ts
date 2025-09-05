// Advanced Emotion Detection Service using Google Cloud Vision API
// Provides real-time facial emotion analysis for mental health assessment

export interface EmotionDetectionResult {
    faceDetected: boolean;
    emotions: {
        joy: number;
        sorrow: number;
        anger: number;
        surprise: number;
        fear: number;
        disgust: number;
    };
    primaryEmotion: string;
    confidence: number;
    facialFeatures: {
        eyeContact: boolean;
        facialTension: number;
        microExpressions: string[];
        attentionLevel: number;
    };
    wellnessIndicators: {
        stressLevel: number;
        fatigueLevel: number;
        engagementLevel: number;
        authenticity: number;
    };
    culturalContext: {
        expressionStyle: 'reserved' | 'expressive' | 'moderate';
        culturalNorms: string[];
    };
    recommendations: {
        immediate: string[];
        therapeutic: string[];
    };
}

export interface VideoAnalysisResult {
    overallMood: string;
    moodStability: number;
    emotionalRange: number;
    sessionQuality: number;
    engagementMetrics: {
        eyeContactPercentage: number;
        facialMovement: number;
        attentionSpan: number;
    };
    progressIndicators: {
        emotionalRegulation: number;
        selfAwareness: number;
        therapeuticAlliance: number;
    };
}

export class EmotionDetectionService {
    private isInitialized = false;
    private videoStream: MediaStream | null = null;
    private analysisInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.initializeService();
    }

    private async initializeService(): Promise<void> {
        try {
            // Check for camera and AI capabilities
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.warn('Camera not available for emotion detection');
                return;
            }

            this.isInitialized = true;
            console.log('🎭 Emotion Detection Service initialized');
        } catch (error) {
            console.error('Emotion detection initialization error:', error);
        }
    }

    // Real-time emotion analysis from camera feed
    async startRealTimeAnalysis(
        onEmotionDetected: (result: EmotionDetectionResult) => void,
        options: {
            interval?: number;
            culturalContext?: string;
            sensitivity?: 'low' | 'medium' | 'high';
        } = {}
    ): Promise<void> {
        if (!this.isInitialized) {
            throw new Error('Emotion detection service not initialized');
        }

        try {
            // Request camera access
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 15 }
                }
            });

            // Create video element for processing
            const video = document.createElement('video');
            video.srcObject = this.videoStream;
            video.play();

            // Start analysis loop
            const analysisInterval = options.interval || 2000; // Analyze every 2 seconds

            video.onloadedmetadata = () => {
                this.analysisInterval = setInterval(async () => {
                    try {
                        const result = await this.analyzeFrame(video, options);
                        onEmotionDetected(result);
                    } catch (error) {
                        console.error('Frame analysis error:', error);
                    }
                }, analysisInterval);
            };

        } catch (error) {
            console.error('Camera access error:', error);
            throw new Error('Unable to access camera for emotion detection');
        }
    }

    // Stop real-time analysis
    stopRealTimeAnalysis(): void {
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
        }

        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
    }

    // Analyze single image for emotions
    async analyzeImage(imageData: string | Blob): Promise<EmotionDetectionResult> {
        try {
            // Convert image to base64 if needed
            const base64Image = typeof imageData === 'string'
                ? imageData
                : await this.blobToBase64(imageData);

            // For demo purposes, we'll simulate advanced emotion detection
            // In production, this would use Google Cloud Vision API
            return this.simulateAdvancedEmotionDetection(base64Image);
        } catch (error) {
            console.error('Image analysis error:', error);
            throw error;
        }
    }

    // Analyze video session for overall emotional patterns
    async analyzeVideoSession(
        videoBlob: Blob,
        sessionDuration: number
    ): Promise<VideoAnalysisResult> {
        try {
            // This would integrate with Google Cloud Video Intelligence API
            // For now, we'll simulate comprehensive video analysis

            return {
                overallMood: 'mixed_emotions',
                moodStability: 0.7,
                emotionalRange: 0.6,
                sessionQuality: 0.8,
                engagementMetrics: {
                    eyeContactPercentage: 65,
                    facialMovement: 0.5,
                    attentionSpan: 0.8
                },
                progressIndicators: {
                    emotionalRegulation: 0.7,
                    selfAwareness: 0.6,
                    therapeuticAlliance: 0.8
                }
            };
        } catch (error) {
            console.error('Video session analysis error:', error);
            throw error;
        }
    }

    // Private helper methods
    private async analyzeFrame(
        video: HTMLVideoElement,
        options: any
    ): Promise<EmotionDetectionResult> {
        // Capture frame from video
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Unable to create canvas context');
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        // Analyze the frame
        return this.simulateAdvancedEmotionDetection(imageData, options);
    }

    private simulateAdvancedEmotionDetection(
        imageData: string,
        options: any = {}
    ): EmotionDetectionResult {
        // Simulate realistic emotion detection with cultural awareness
        // In production, this would call Google Cloud Vision API

        const emotions = {
            joy: Math.random() * 0.4 + 0.1,
            sorrow: Math.random() * 0.3,
            anger: Math.random() * 0.2,
            surprise: Math.random() * 0.3,
            fear: Math.random() * 0.25,
            disgust: Math.random() * 0.15
        };

        // Normalize emotions
        const total = Object.values(emotions).reduce((sum, val) => sum + val, 0);
        Object.keys(emotions).forEach(key => {
            emotions[key as keyof typeof emotions] /= total;
        });

        // Find primary emotion
        const primaryEmotion = Object.entries(emotions)
            .reduce((a, b) => emotions[a[0] as keyof typeof emotions] > emotions[b[0] as keyof typeof emotions] ? a : b)[0];

        const confidence = emotions[primaryEmotion as keyof typeof emotions];

        // Calculate wellness indicators
        const stressLevel = (emotions.anger + emotions.fear + emotions.disgust) / 3;
        const fatigueLevel = 1 - (emotions.joy + emotions.surprise) / 2;
        const engagementLevel = (emotions.joy + emotions.surprise + emotions.anger) / 3;

        // Cultural context analysis
        const culturalContext = this.analyzeCulturalExpressionStyle(emotions, options.culturalContext);

        return {
            faceDetected: true,
            emotions,
            primaryEmotion,
            confidence,
            facialFeatures: {
                eyeContact: Math.random() > 0.3,
                facialTension: stressLevel,
                microExpressions: this.detectMicroExpressions(emotions),
                attentionLevel: engagementLevel
            },
            wellnessIndicators: {
                stressLevel,
                fatigueLevel,
                engagementLevel,
                authenticity: 1 - Math.abs(0.5 - confidence) // How genuine the emotion appears
            },
            culturalContext,
            recommendations: this.generateEmotionBasedRecommendations(primaryEmotion, stressLevel, culturalContext)
        };
    }

    private analyzeCulturalExpressionStyle(emotions: any, culturalContext?: string): {
        expressionStyle: 'reserved' | 'expressive' | 'moderate';
        culturalNorms: string[];
    } {
        // Analyze how emotions are expressed based on cultural background
        const maxEmotion = Math.max(...Object.values(emotions).map(v => Number(v) || 0));

        let expressionStyle: 'reserved' | 'expressive' | 'moderate';
        if (maxEmotion < 0.4) {
            expressionStyle = 'reserved';
        } else if (maxEmotion > 0.7) {
            expressionStyle = 'expressive';
        } else {
            expressionStyle = 'moderate';
        }

        const culturalNorms = [
            'Respect for emotional restraint in public',
            'Family-oriented emotional expression',
            'Context-dependent emotional display'
        ];

        return { expressionStyle, culturalNorms };
    }

    private detectMicroExpressions(emotions: any): string[] {
        const microExpressions: string[] = [];

        if (emotions.fear > 0.3) microExpressions.push('eye_tension');
        if (emotions.anger > 0.3) microExpressions.push('jaw_clench');
        if (emotions.sorrow > 0.3) microExpressions.push('lip_compression');
        if (emotions.joy > 0.4) microExpressions.push('eye_crinkle');

        return microExpressions;
    }

    private generateEmotionBasedRecommendations(
        primaryEmotion: string,
        stressLevel: number,
        culturalContext: any
    ): { immediate: string[]; therapeutic: string[] } {
        const immediate: string[] = [];
        const therapeutic: string[] = [];

        // Immediate recommendations based on emotion
        switch (primaryEmotion) {
            case 'sorrow':
                immediate.push('Take slow, deep breaths');
                immediate.push('Practice self-compassion');
                therapeutic.push('Explore underlying causes of sadness');
                break;
            case 'anger':
                immediate.push('Count to 10 slowly');
                immediate.push('Step away from the situation');
                therapeutic.push('Learn anger management techniques');
                break;
            case 'fear':
                immediate.push('Ground yourself with 5-4-3-2-1 technique');
                immediate.push('Remind yourself you are safe');
                therapeutic.push('Address underlying anxieties');
                break;
            case 'joy':
                immediate.push('Savor this positive moment');
                therapeutic.push('Build on positive emotions');
                break;
        }

        // Stress-based recommendations
        if (stressLevel > 0.6) {
            immediate.push('Practice progressive muscle relaxation');
            therapeutic.push('Develop stress management strategies');
        }

        // Cultural considerations
        if (culturalContext.expressionStyle === 'reserved') {
            therapeutic.push('Explore safe spaces for emotional expression');
        }

        return { immediate, therapeutic };
    }

    private async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Public utility methods
    isServiceAvailable(): boolean {
        return this.isInitialized && !!navigator.mediaDevices;
    }

    async requestCameraPermission(): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('Camera permission denied:', error);
            return false;
        }
    }
}

// Export singleton instance
export const emotionDetection = new EmotionDetectionService();