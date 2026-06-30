export type CategoryType =
  | 'Pothole'
  | 'Water Leakage'
  | 'Garbage'
  | 'Broken Streetlight'
  | 'Road Damage'
  | 'Drainage'
  | 'Traffic Signal'
  | 'Illegal Dumping'
  | 'Public Safety'
  | 'Tree Fallen'
  | 'Other';

export type SeverityType = 'Low' | 'Medium' | 'High' | 'Critical';

export type ReportStatusType =
  | 'Submitted'
  | 'AI Verified'
  | 'Community Verified'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  avatar: string;
  role: 'citizen' | 'admin';
  reputationScore: number;
  xp: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  badges: string[];
  createdAt: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface IssueReport {
  reportId: string;
  title: string;
  description: string;
  category: CategoryType;
  severity: SeverityType;
  urgency: string; // e.g. "Within 24 Hours", "Within 3 days"
  estimatedCost: number; // in INR
  predictedResolutionTime: string; // e.g. "48 Hours", "5 Days"
  recommendedDepartment: string;
  status: ReportStatusType;
  ward: string; // Ward name or number in Indore
  landmark: string;
  address: string;
  latitude: number;
  longitude: number;
  images: string[]; // Base64 or cloud URLs
  anonymous: boolean;
  contactNumber: string;
  authorId: string;
  authorName: string;
  commentsCount: number;
  upvotesCount: number;
  verificationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  commentId: string;
  reportId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
}

export interface Vote {
  voteId: string;
  reportId: string;
  userId: string;
  type: 'upvote' | 'verify';
  createdAt: string;
}

export interface Notification {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: 'status_changed' | 'verified' | 'comment' | 'hazard_alert' | 'badge_earned' | 'duplicate_found';
  reportId?: string;
  read: boolean;
  createdAt: string;
}

export interface LeaderboardUser {
  userId: string;
  name: string;
  avatar: string;
  xp: number;
  reputationScore: number;
  rank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  reportsCount: number;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  xpReward: number;
}

export interface GeminiAnalysisResult {
  title: string;
  description: string;
  category: CategoryType;
  severity: SeverityType;
  urgency: string;
  estimatedCost: number;
  predictedResolutionTime: string;
  recommendedDepartment: string;
  isDuplicateNearby: boolean;
  duplicateReportId?: string;
  suggestedWording: string;
  summary: string;
  isImageClear: boolean;
  feedbackMessage?: string;
}
