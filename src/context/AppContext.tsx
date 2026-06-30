import React, { createContext, useContext, useState, useEffect } from 'react';
import { IssueReport, UserProfile, Comment, Vote, Notification, CategoryType, SeverityType, ReportStatusType } from '../types';
import { SEED_REPORTS, SEED_LEADERBOARD, BADGES_LIST, INDORE_CENTER } from '../seedData';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { collection, doc, addDoc, setDoc, updateDoc, onSnapshot, query, orderBy, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export type TabType = 'landing' | 'dashboard' | 'report' | 'map' | 'assistant' | 'leaderboard' | 'admin';

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  reports: IssueReport[];
  comments: Record<string, Comment[]>;
  notifications: Notification[];
  leaderboard: typeof SEED_LEADERBOARD;
  addReport: (report: Partial<IssueReport>) => Promise<IssueReport>;
  addComment: (reportId: string, content: string) => Promise<void>;
  upvoteReport: (reportId: string) => Promise<void>;
  verifyReport: (reportId: string) => Promise<void>;
  updateReportStatus: (reportId: string, status: ReportStatusType) => Promise<void>;
  addNotification: (title: string, message: string, type: Notification['type'], reportId?: string) => void;
  markNotificationAsRead: (notificationId: string) => void;
  triggerAIAnalysis: (payload: {
    imageBase64: string;
    mimeType: string;
    nearbyIssues: IssueReport[];
    categoryHint?: string;
    descriptionHint?: string;
  }) => Promise<any>;
  triggerAIChat: (message: string, history: { role: string; content: string }[]) => Promise<string>;
  authLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial local user profile (Aarav Sharma - Citizen)
const DEFAULT_USER: UserProfile = {
  userId: 'user_dummy_1',
  name: 'Aarav Sharma',
  email: 'prajalpareta@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=120',
  role: 'citizen',
  reputationScore: 85,
  xp: 1250,
  rank: 'Silver',
  badges: ['first_report', 'helper_hand'],
  createdAt: new Date().toISOString()
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<TabType>('landing');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [reports, setReports] = useState<IssueReport[]>(SEED_REPORTS);
  const [comments, setComments] = useState<Record<string, Comment[]>>({
    'rep_001': [
      {
        commentId: 'c_1',
        reportId: 'rep_001',
        content: 'This has been causing serious trouble in the evening rush hour. Thanks for reporting!',
        authorId: 'user_dummy_2',
        authorName: 'Priya Patel',
        authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        commentId: 'c_2',
        reportId: 'rep_001',
        content: 'I saw the municipal truck here inspecting it this morning. Hope it gets fixed soon.',
        authorId: 'user_dummy_leader_3',
        authorName: 'Amit Deshmukh',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ]
  });
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      notificationId: 'not_1',
      userId: 'user_dummy_1',
      title: 'Report Accepted',
      message: 'Your report on Pothole near Chappan Dukan was accepted and assigned.',
      type: 'status_changed',
      reportId: 'rep_001',
      read: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
      notificationId: 'not_2',
      userId: 'user_dummy_1',
      title: 'Eco Warrior Badge Earned!',
      message: 'Congratulations! You earned the Eco Warrior badge for reporting environmental hazards.',
      type: 'badge_earned',
      read: false,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    }
  ]);
  const [leaderboard, setLeaderboard] = useState(SEED_LEADERBOARD);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setCurrentUser(snap.data() as UserProfile);
          } else {
            // Document does not exist, create profile in database
            const newProfile: UserProfile = {
              userId: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Citizen',
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}`,
              role: 'citizen',
              reputationScore: 0,
              xp: 100,
              rank: 'Bronze',
              badges: ['first_report'],
              createdAt: new Date().toISOString()
            };
            await setDoc(userRef, newProfile);
            setCurrentUser(newProfile);
          }
        } catch (e) {
          console.warn('Could not read/write user profile to Firestore. Setting fallback locally.', e);
          setCurrentUser({
            userId: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Citizen',
            email: firebaseUser.email || '',
            avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}`,
            role: 'citizen',
            reputationScore: 0,
            xp: 100,
            rank: 'Bronze',
            badges: ['first_report'],
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // User signed out, default to null
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync state with standard Firestore collections if database is accessible
  useEffect(() => {
    let unsubscribeReports: () => void;

    try {
      const reportsQuery = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
        const loadedReports: IssueReport[] = [];
        snapshot.forEach((docSnap) => {
          loadedReports.push(docSnap.data() as IssueReport);
        });

        if (loadedReports.length > 0) {
          // Merge loaded Firestore reports with seed data, avoiding duplicates
          const merged = [...loadedReports];
          SEED_REPORTS.forEach(seed => {
            if (!merged.some(m => m.reportId === seed.reportId)) {
              merged.push(seed);
            }
          });
          setReports(merged);
        }
      }, (error) => {
        // Log error matching the standard pattern, but do not crash the applet
        console.warn('Firestore subscription failed, running in resilient seed-data mode.', error);
      });
    } catch (e) {
      console.warn('Firestore is not fully initialized, running in client-side memory mode.', e);
    }

    return () => {
      if (unsubscribeReports) unsubscribeReports();
    };
  }, []);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    // Scroll to top of the preview frame
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Gamification utility to award XP and check ranks
  const awardXP = (xpAmount: number, repAmount: number) => {
    if (!currentUser) return;
    const newXp = currentUser.xp + xpAmount;
    const newRep = currentUser.reputationScore + repAmount;
    
    let newRank: UserProfile['rank'] = currentUser.rank;
    if (newXp >= 3000) newRank = 'Platinum';
    else if (newXp >= 2000) newRank = 'Gold';
    else if (newXp >= 1000) newRank = 'Silver';
    else newRank = 'Bronze';

    const updatedUser = {
      ...currentUser,
      xp: newXp,
      reputationScore: newRep,
      rank: newRank,
    };

    setCurrentUser(updatedUser);
    
    // Sync to user profile if logged in
    try {
      const userRef = doc(db, 'users', currentUser.userId);
      setDoc(userRef, updatedUser, { merge: true }).catch(err => {
        console.warn('Syncing user to Firestore failed, updated locally.', err);
      });
    } catch (e) {}

    // Add a notification alert for XP gains
    addNotification(
      'XP Earned!',
      `You earned +${xpAmount} XP and +${repAmount} Reputation Score for community activity!`,
      'verified'
    );
  };

  // Add a new issue report
  const addReport = async (reportData: Partial<IssueReport>): Promise<IssueReport> => {
    const reportId = 'rep_' + Math.random().toString(36).substring(2, 11);
    const newReport: IssueReport = {
      reportId,
      title: reportData.title || 'Civic Issue',
      description: reportData.description || '',
      category: reportData.category || 'Other',
      severity: reportData.severity || 'Medium',
      urgency: reportData.urgency || 'Within 3 Days',
      estimatedCost: reportData.estimatedCost || 2000,
      predictedResolutionTime: reportData.predictedResolutionTime || '5 Days',
      recommendedDepartment: reportData.recommendedDepartment || 'IMC Public Works Department',
      status: reportData.status || 'Submitted',
      ward: reportData.ward || 'General Ward',
      landmark: reportData.landmark || '',
      address: reportData.address || 'Indore, MP',
      latitude: reportData.latitude || INDORE_CENTER.lat,
      longitude: reportData.longitude || INDORE_CENTER.lng,
      images: reportData.images || [],
      anonymous: reportData.anonymous || false,
      contactNumber: reportData.contactNumber || '',
      authorId: currentUser?.userId || 'anonymous',
      authorName: reportData.anonymous ? 'Anonymous Citizen' : (currentUser?.name || 'Anonymous Citizen'),
      commentsCount: 0,
      upvotesCount: 0,
      verificationsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update local state first (for instantaneous responsive feedback)
    setReports(prev => [newReport, ...prev]);

    // Save to Firestore
    try {
      const docRef = doc(db, 'reports', reportId);
      await setDoc(docRef, newReport);
    } catch (error) {
      // If permission error or other write failure, catch and handle with standard schema wrapper
      try {
        handleFirestoreError(error, OperationType.WRITE, `reports/${reportId}`);
      } catch (logErr) {
        // Fallback gracefully so client app functions beautifully even in offline demo state
        console.warn('Stored report locally in memory.', error);
      }
    }

    // Award XP
    awardXP(150, 15); // +150 XP for reporting an issue
    addNotification(
      'Report Submitted',
      `Your report "${newReport.title}" has been registered and verified by Gemini AI.`,
      'status_changed',
      reportId
    );

    return newReport;
  };

  // Add comment to a report
  const addComment = async (reportId: string, content: string): Promise<void> => {
    const commentId = 'c_' + Math.random().toString(36).substring(2, 11);
    const newComment: Comment = {
      commentId,
      reportId,
      content,
      authorId: currentUser?.userId || 'anonymous',
      authorName: currentUser?.name || 'Anonymous Citizen',
      authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      createdAt: new Date().toISOString(),
    };

    // Update local state
    setComments(prev => ({
      ...prev,
      [reportId]: [...(prev[reportId] || []), newComment]
    }));

    setReports(prev => prev.map(rep => {
      if (rep.reportId === reportId) {
        const updatedRep = { ...rep, commentsCount: rep.commentsCount + 1 };
        // Sync back
        try {
          const docRef = doc(db, 'reports', reportId);
          updateDoc(docRef, { commentsCount: updatedRep.commentsCount }).catch(err => {
            console.warn('Could not update commentsCount in Firestore:', err);
          });
        } catch (e) {}
        return updatedRep;
      }
      return rep;
    }));

    try {
      const commentRef = doc(db, 'reports', reportId, 'comments', commentId);
      await setDoc(commentRef, newComment);
    } catch (e) {
      console.warn('Comment added locally.', e);
    }

    awardXP(20, 5); // +20 XP for commenting and participating
  };

  // Upvote a report
  const upvoteReport = async (reportId: string): Promise<void> => {
    setReports(prev => prev.map(rep => {
      if (rep.reportId === reportId) {
        const updatedRep = { ...rep, upvotesCount: rep.upvotesCount + 1 };
        try {
          const docRef = doc(db, 'reports', reportId);
          updateDoc(docRef, { upvotesCount: updatedRep.upvotesCount }).catch(err => {
            console.warn('Could not update upvotesCount in Firestore:', err);
          });
        } catch (e) {}
        return updatedRep;
      }
      return rep;
    }));

    awardXP(10, 2); // +10 XP for upvoting issues
  };

  // Verify a report (Community Verification)
  const verifyReport = async (reportId: string): Promise<void> => {
    setReports(prev => prev.map(rep => {
      if (rep.reportId === reportId) {
        let nextStatus: ReportStatusType = rep.status;
        const nextVerificationsCount = rep.verificationsCount + 1;
        
        // If an issue is 'Submitted' or 'AI Verified' and gets enough community votes, promote it to 'Community Verified'
        if ((rep.status === 'Submitted' || rep.status === 'AI Verified') && nextVerificationsCount >= 5) {
          nextStatus = 'Community Verified';
        }

        const updatedRep = { 
          ...rep, 
          verificationsCount: nextVerificationsCount,
          status: nextStatus
        };

        try {
          const docRef = doc(db, 'reports', reportId);
          updateDoc(docRef, { 
            verificationsCount: updatedRep.verificationsCount,
            status: updatedRep.status 
          }).catch(err => {
            console.warn('Could not update verificationsCount in Firestore:', err);
          });
        } catch (e) {}

        if (nextStatus === 'Community Verified' && rep.status !== 'Community Verified') {
          addNotification(
            'Community Verified!',
            `The issue "${rep.title}" has reached 5+ verifications and is now community-verified.`,
            'verified',
            reportId
          );
        }

        return updatedRep;
      }
      return rep;
    }));

    awardXP(30, 8); // +30 XP for verifying and keeping city catalog clean!
  };

  // Update Status (Admin Panel)
  const updateReportStatus = async (reportId: string, status: ReportStatusType): Promise<void> => {
    setReports(prev => prev.map(rep => {
      if (rep.reportId === reportId) {
        const updatedRep = { ...rep, status, updatedAt: new Date().toISOString() };
        try {
          const docRef = doc(db, 'reports', reportId);
          updateDoc(docRef, { status: updatedRep.status, updatedAt: updatedRep.updatedAt }).catch(err => {
            console.warn('Could not update report status in Firestore:', err);
          });
        } catch (e) {}

        addNotification(
          'Issue Status Updated',
          `The status of your issue "${rep.title}" is now "${status}".`,
          'status_changed',
          reportId
        );

        return updatedRep;
      }
      return rep;
    }));
  };

  // Add notification alert
  const addNotification = (title: string, message: string, type: Notification['type'], reportId?: string) => {
    const notificationId = 'not_' + Math.random().toString(36).substring(2, 11);
    const newNotif: Notification = {
      notificationId,
      userId: currentUser?.userId || 'guest',
      title,
      message,
      type,
      reportId,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => [newNotif, ...prev]);

    try {
      const docRef = doc(db, 'notifications', notificationId);
      setDoc(docRef, newNotif).catch(err => {
        console.warn('Could not write notification to Firestore:', err);
      });
    } catch (e) {}
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => {
      if (notif.notificationId === notificationId) {
        const updated = { ...notif, read: true };
        try {
          const docRef = doc(db, 'notifications', notificationId);
          updateDoc(docRef, { read: true }).catch(err => {
            console.warn('Could not update notification read status in Firestore:', err);
          });
        } catch (e) {}
        return updated;
      }
      return notif;
    }));
  };

  // Gemini API wrapper methods calling the server
  const triggerAIAnalysis = async (payload: {
    imageBase64: string;
    mimeType: string;
    nearbyIssues: IssueReport[];
    categoryHint?: string;
    descriptionHint?: string;
  }) => {
    const response = await fetch('/api/gemini/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Server-side Gemini analysis failed.');
    }
    return response.json();
  };

  const triggerAIChat = async (message: string, history: { role: string; content: string }[]) => {
    const response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        reportsContext: reports // supply entire live database context to ground the chatbot!
      }),
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || 'Server-side Gemini chatbot failed.');
    }
    const data = await response.json();
    return data.reply;
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        setCurrentUser,
        reports,
        comments,
        notifications,
        leaderboard,
        addReport,
        addComment,
        upvoteReport,
        verifyReport,
        updateReportStatus,
        addNotification,
        markNotificationAsRead,
        triggerAIAnalysis,
        triggerAIChat,
        authLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
