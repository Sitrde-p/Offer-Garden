export type AttemptStage = 'application' | 'test' | 'interview' | 'result';

export type AttemptStatus = 
  // Application
  | 'waiting_feedback'                // 已投递，等待反馈
  | 'no_response'                     // 投递后暂无回应
  | 'resume_screen_failed'            // 简历筛选未通过
  // Test
  | 'test_invitation'                 // 收到笔试邀请
  | 'test_in_progress'                // 笔试进行中
  | 'test_completed'                  // 笔试已完成
  | 'test_failed'                     // 笔试未通过
  | 'test_passed_waiting_interview'   // 笔试通过，等待面试
  // Interview
  | 'interview_invitation'            // 收到面试邀请
  | 'first_interview'                 // 一面进行中
  | 'second_interview'                // 二面进行中
  | 'third_interview'                 // 三面进行中
  | 'group_interview'                 // 群面进行中
  | 'interview_failed'                // 面试未通过
  | 'first_interview_failed'          // 一面未通过
  | 'second_interview_failed'         // 二面未通过
  | 'third_interview_failed'          // 三面未通过
  | 'group_interview_failed'          // 群面未通过
  // Result
  | 'offer_discussing'                // Offer 沟通中
  | 'offer_received'                  // 已获得 Offer
  | 'offer_declined'                  // 已拒绝 Offer
  | 'process_ended'                   // 已结束流程
  // Legacy (Compat)
  | 'pending'
  | 'ghosted'
  | 'rejected'
  | 'interview_granted'
  | 'offer';

export type Mood = 
  | 'calm'          // 平静
  | 'anxious'       // 焦虑
  | 'disappointed'  // 失落
  | 'numb'          // 麻木
  | 'tense'         // 紧张
  | 'excited'       // 激动
  | 'hopeful'        // 仍想继续
  | 'still_trying';  // 仍想继续

export interface ActionItem {
  id: string;
  task: string;
  completed: boolean;
  createdAt?: string;
  completedAt?: string;
  sourceAttemptId?: string;
}

export interface ReflectionData {
  mainReason: string[];
  evidence: string;
  nextActions: ActionItem[];
  emotionalReframe: string;
  couragePointEarned: boolean;
  generatedAt: string;
  sourceStatus?: AttemptStatus;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  hasShownNotification?: boolean;
}

export interface TimelineEvent {
  date: string;
  label: string;
  status?: string;
  type?: 'status_change' | 'reflection_created' | 'task_completed';
  taskText?: string;
}

export interface Attempt {
  id: string;
  company: string;
  role: string;
  stage: AttemptStage;
  status: AttemptStatus;
  jdText?: string;
  resumeSummary?: string;
  description?: string;
  mood?: Mood;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  reflection?: ReflectionData;
  timeline?: TimelineEvent[];
}

export interface GardenStats {
  attemptsCount: number;
  couragePoints: number;
  reflectionsCount: number;
  interviewsCount: number;
  offersCount: number;
}
