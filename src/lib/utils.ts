import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AttemptStatus, AttemptStage, Mood } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMoodLabel(mood?: Mood | string): string {
  if (!mood) return '未记录';
  const MOOD_MAP: Record<string, string> = {
    calm: '平静',
    anxious: '焦虑',
    sad: '失落',
    disappointed: '失落',
    numb: '麻木',
    tense: '紧张',
    nervous: '紧张',
    excited: '激动',
    still_trying: '仍想继续',
    hopeful: '仍想继续'
  };
  return MOOD_MAP[mood] || mood;
}

export function getStageLabel(stage: any): string {
  const STAGE_MAP: Record<string, string> = {
    application: '投递',
    test: '测评',
    interview: '面试',
    result: '结果',
  };
  return STAGE_MAP[stage] || stage;
}

export function getStatusLabel(status: string): string {
  const STATUS_MAP: Record<string, string> = {
    // 投递阶段
    waiting_feedback: '已投递，待反馈',
    no_response: '投递后暂无回应',
    resume_screen_failed: '简历初筛未通过',
    
    // 测评阶段
    test_invitation: '收到测评邀请',
    test_in_progress: '测评进行中',
    test_completed: '测评已完成',
    test_failed: '测评未通过',
    test_passed_waiting_interview: '测评通过，待面试',
    
    // 面试阶段
    interview_invitation: '收到面试邀请',
    first_interview: '一面进行中',
    first_interview_failed: '一面未通过',
    second_interview: '二面进行中',
    second_interview_failed: '二面未通过',
    third_interview: '三面进行中',
    third_interview_failed: '三面未通过',
    group_interview: '群面进行中',
    group_interview_failed: '群面未通过',
    interview_failed: '面试未通过',
    
    // 结果阶段
    offer_discussing: 'Offer 沟通中',
    offer_received: '已获得 Offer',
    offer_declined: '已拒绝 Offer',
    process_ended: '已结束流程',

    // Legacy / Compat
    pending: '已投递，待反馈',
    ghosted: '投递后暂无回应',
    rejected: '简历初筛未通过',
    interview_granted: '收到面试邀请',
    offer: '已获得 Offer'
  };
  return STATUS_MAP[status] || status;
}

export function formatHistoryItem(item: any): string {
  if (item.type === 'reflection_created' || item.status === 'reflection_created') {
    return '完成 AI 成长复盘';
  }
  if (item.type === 'task_completed') {
    return `完成行动任务：${item.taskText || ''}`;
  }
  if (item.status) {
    return getStatusLabel(item.status);
  }
  return item.label || '记录已更新';
}
