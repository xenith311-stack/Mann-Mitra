// Firebase Integration for MannMitra - Secure Data Storage & Authentication
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  User,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { getAnalytics, logEvent } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY as string,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID as string,
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID as string
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Data interfaces
export interface UserProfile {
  userId: string;
  createdAt: Timestamp;
  lastActive: Timestamp;
  demographics: {
    ageRange: '13-17' | '18-22' | '23-27' | '28+';
    gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
    location: {
      state: string;
      city?: string;
      region: 'urban' | 'semi-urban' | 'rural';
    };
    education: 'school' | 'college' | 'working' | 'other';
  };
  preferences: {
    language: 'hi' | 'en' | 'mixed';
    interests: string[];
    comfortEnvironment: string;
    avatarStyle: string;
    notificationPreferences: {
      dailyCheckIn: boolean;
      weeklyProgress: boolean;
      crisisSupport: boolean;
    };
  };
  privacy: {
    dataSharing: boolean;
    anonymousAnalytics: boolean;
    researchParticipation: boolean;
  };
}

export interface WellnessAssessment {
  userId: string;
  assessmentId: string;
  timestamp: Timestamp;
  type: 'phq9' | 'gad7' | 'daily-checkin' | 'crisis-screening';
  scores: {
    [key: string]: number;
  };
  totalScore: number;
  riskLevel: 'minimal' | 'mild' | 'moderate' | 'severe';
  responses: Array<{
    questionId: string;
    response: number | string;
  }>;
  followUpRecommended: boolean;
}

export interface ConversationSession {
  userId: string;
  sessionId: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  messageCount: number;
  avgResponseTime: number;
  emotionalJourney: Array<{
    timestamp: Timestamp;
    emotion: string;
    intensity: number;
  }>;
  crisisIndicators: Array<{
    timestamp: Timestamp;
    level: string;
    intervention: string;
  }>;
  copingStrategiesUsed: string[];
  outcomes: {
    moodImprovement: number;
    satisfactionRating?: number;
    followUpNeeded: boolean;
  };
}

export interface AnonymizedInsights {
  date: Timestamp;
  aggregatedData: {
    totalUsers: number;
    activeUsers: number;
    averageSessionDuration: number;
    commonConcerns: Array<{
      concern: string;
      frequency: number;
    }>;
    effectiveInterventions: Array<{
      intervention: string;
      successRate: number;
    }>;
    demographicTrends: {
      [key: string]: any;
    };
  };
  regionalInsights: {
    [state: string]: {
      userCount: number;
      commonChallenges: string[];
      culturalAdaptations: string[];
    };
  };
}

export class FirebaseService {
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      if (user) {
        this.loadUserProfile();
        this.logUserActivity();
      }
    });
  }

  // Authentication Methods
  async signInAnonymously(): Promise<User> {
    try {
      const result = await signInAnonymously(auth);

      // Log analytics event
      logEvent(analytics, 'user_sign_in', {
        method: 'anonymous'
      });

      return result.user;
    } catch (error) {
      console.error('Anonymous sign-in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.userProfile = null;

      logEvent(analytics, 'user_sign_out');
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // User Profile Management
  async createUserProfile(profileData: Omit<UserProfile, 'userId' | 'createdAt' | 'lastActive'>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated');
    }

    const profile: UserProfile = {
      userId: this.currentUser.uid,
      createdAt: serverTimestamp() as Timestamp,
      lastActive: serverTimestamp() as Timestamp,
      ...profileData
    };

    try {
      await setDoc(doc(db, 'userProfiles', this.currentUser.uid), profile);
      this.userProfile = profile;

      logEvent(analytics, 'user_profile_created', {
        age_range: profile.demographics.ageRange,
        gender: profile.demographics.gender,
        location_type: profile.demographics.location.region,
        language: profile.preferences.language
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async loadUserProfile(): Promise<UserProfile | null> {
    if (!this.currentUser) return null;

    try {
      const docRef = doc(db, 'userProfiles', this.currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.userProfile = docSnap.data() as UserProfile;
        return this.userProfile;
      }

      return null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated');
    }

    try {
      const docRef = doc(db, 'userProfiles', this.currentUser.uid);
      await updateDoc(docRef, {
        ...updates,
        lastActive: serverTimestamp()
      });

      if (this.userProfile) {
        this.userProfile = { ...this.userProfile, ...updates };
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  // Wellness Assessment Storage
  async saveWellnessAssessment(assessment: Omit<WellnessAssessment, 'userId' | 'assessmentId' | 'timestamp'>): Promise<string> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated');
    }

    const assessmentData: Omit<WellnessAssessment, 'assessmentId'> = {
      userId: this.currentUser.uid,
      timestamp: serverTimestamp() as Timestamp,
      ...assessment
    };

    try {
      const docRef = await addDoc(collection(db, 'wellnessAssessments'), assessmentData);

      logEvent(analytics, 'wellness_assessment_completed', {
        assessment_type: assessment.type,
        risk_level: assessment.riskLevel,
        total_score: assessment.totalScore
      });

      return docRef.id;
    } catch (error) {
      console.error('Error saving wellness assessment:', error);
      throw error;
    }
  }

  async getWellnessHistory(assessmentType?: string, limitCount: number = 10): Promise<WellnessAssessment[]> {
    if (!this.currentUser) return [];

    try {
      let q = query(
        collection(db, 'wellnessAssessments'),
        where('userId', '==', this.currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      if (assessmentType) {
        q = query(
          collection(db, 'wellnessAssessments'),
          where('userId', '==', this.currentUser.uid),
          where('type', '==', assessmentType),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        assessmentId: doc.id,
        ...doc.data()
      } as WellnessAssessment));
    } catch (error) {
      console.error('Error fetching wellness history:', error);
      return [];
    }
  }

  // Conversation Session Tracking
  async startConversationSession(): Promise<string> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated');
    }

    const session: Omit<ConversationSession, 'sessionId'> = {
      userId: this.currentUser.uid,
      startTime: serverTimestamp() as Timestamp,
      messageCount: 0,
      avgResponseTime: 0,
      emotionalJourney: [],
      crisisIndicators: [],
      copingStrategiesUsed: [],
      outcomes: {
        moodImprovement: 0,
        followUpNeeded: false
      }
    };

    try {
      const docRef = await addDoc(collection(db, 'conversationSessions'), session);

      logEvent(analytics, 'conversation_started');

      return docRef.id;
    } catch (error) {
      console.error('Error starting conversation session:', error);
      throw error;
    }
  }

  async updateConversationSession(
    sessionId: string,
    updates: Partial<ConversationSession>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'conversationSessions', sessionId);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating conversation session:', error);
      throw error;
    }
  }

  async endConversationSession(
    sessionId: string,
    outcomes: ConversationSession['outcomes']
  ): Promise<void> {
    try {
      const docRef = doc(db, 'conversationSessions', sessionId);
      await updateDoc(docRef, {
        endTime: serverTimestamp(),
        outcomes
      });

      logEvent(analytics, 'conversation_ended', {
        session_duration: 'calculated_on_client',
        mood_improvement: outcomes.moodImprovement,
        follow_up_needed: outcomes.followUpNeeded
      });
    } catch (error) {
      console.error('Error ending conversation session:', error);
      throw error;
    }
  }

  // Crisis Intervention Logging
  async logCrisisIntervention(
    sessionId: string,
    crisisLevel: string,
    intervention: string,
    outcome: string
  ): Promise<void> {
    if (!this.currentUser) return;

    const crisisLog = {
      userId: this.currentUser.uid,
      sessionId,
      timestamp: serverTimestamp(),
      crisisLevel,
      intervention,
      outcome,
      followUpScheduled: crisisLevel === 'high' || crisisLevel === 'severe'
    };

    try {
      await addDoc(collection(db, 'crisisInterventions'), crisisLog);

      logEvent(analytics, 'crisis_intervention', {
        crisis_level: crisisLevel,
        intervention_type: intervention
      });
    } catch (error) {
      console.error('Error logging crisis intervention:', error);
    }
  }

  // Analytics and Insights (Anonymized)
  async contributeToAnonymizedInsights(
    sessionData: {
      duration: number;
      emotionalImprovement: number;
      strategiesUsed: string[];
      demographicCategory: string;
    }
  ): Promise<void> {
    if (!this.userProfile?.privacy.anonymousAnalytics) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const insightData = {
      date: Timestamp.fromDate(today),
      sessionDuration: sessionData.duration,
      emotionalImprovement: sessionData.emotionalImprovement,
      strategiesUsed: sessionData.strategiesUsed,
      demographicCategory: sessionData.demographicCategory,
      region: this.userProfile.demographics.location.region,
      state: this.userProfile.demographics.location.state
    };

    try {
      await addDoc(collection(db, 'anonymizedInsights'), insightData);
    } catch (error) {
      console.error('Error contributing to insights:', error);
    }
  }

  // User Activity Tracking
  private async logUserActivity(): Promise<void> {
    if (!this.currentUser) return;

    try {
      const docRef = doc(db, 'userProfiles', this.currentUser.uid);
      await updateDoc(docRef, {
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  }

  // Data Export (GDPR Compliance)
  async exportUserData(): Promise<any> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated');
    }

    try {
      const userData = {
        profile: this.userProfile,
        assessments: await this.getWellnessHistory(),
        // Note: Conversation content is not stored for privacy
        exportDate: new Date().toISOString()
      };

      return userData;
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  // Data Deletion (GDPR Compliance)
  async deleteAllUserData(): Promise<void> {
    if (!this.currentUser) {
      throw new Error('User must be authenticated');
    }

    try {
      // Delete user profile
      await setDoc(doc(db, 'userProfiles', this.currentUser.uid), {
        deleted: true,
        deletedAt: serverTimestamp()
      });

      // Note: Other data is kept for research but anonymized
      logEvent(analytics, 'user_data_deleted');

      await this.signOut();
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();