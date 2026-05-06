import React, { createContext, useContext, useEffect, useState } from 'react';
import { Attempt, GardenStats, AchievementBadge, ReflectionData } from '../types';

interface AppContextType {
  attempts: Attempt[];
  stats: GardenStats;
  badges: AchievementBadge[];
  addAttempt: (attempt: Attempt) => void;
  updateAttempt: (id: string, attempt: Partial<Attempt>) => void;
  deleteAttempt: (id: string) => void;
  saveReflection: (attemptId: string, reflection: ReflectionData) => void;
  getAttempt: (id: string) => Attempt | undefined;
  completeAction: (attemptId: string, actionId: string) => void;
  claimReflectionCP: (attemptId: string) => void;
  markBadgeAsShown: (id: string) => void;
  resetData: () => void;
  loadDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [attempts, setAttempts] = useState<Attempt[]>(() => {
    const saved = localStorage.getItem('offer-garden-attempts');
    return saved ? JSON.parse(saved) : [];
  });

  const [shownBadges, setShownBadges] = useState<string[]>(() => {
    const saved = localStorage.getItem('offer-garden-shown-badges');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('offer-garden-attempts', JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem('offer-garden-shown-badges', JSON.stringify(shownBadges));
  }, [shownBadges]);

  const stats = React.useMemo(() => {
    const s: GardenStats = {
      attemptsCount: attempts.length,
      couragePoints: 0,
      reflectionsCount: 0,
      interviewsCount: 0,
      offersCount: 0,
    };
    
    const INTERVIEW_STATUSES = [
      'interview_invitation', 'first_interview', 'second_interview', 'third_interview', 
      'group_interview', 'interview_failed', 'first_interview_failed', 
      'second_interview_failed', 'third_interview_failed', 'group_interview_failed'
    ];

    attempts.forEach(a => {
      if (INTERVIEW_STATUSES.some(is => a.status.includes(is)) || a.status.includes('interview')) s.interviewsCount += 1;
      if (a.status === 'offer_received' || a.status === 'offer') s.offersCount += 1;

      if (a.status === 'offer_received' || a.status === 'offer') s.couragePoints += 10;
      
      if (a.reflection) {
        s.reflectionsCount += 1;
        if (a.reflection.couragePointEarned) {
          let reward = 0;
          if (a.status === 'resume_screen_failed' || a.status === 'test_failed') {
            reward = 1;
          } else if (a.status.includes('failed') || a.status === 'process_ended') {
            reward = 2;
          } else {
            reward = 1; 
          }
          s.couragePoints += reward;
        }

        a.reflection.nextActions?.forEach(item => {
          if (item.completed) s.couragePoints += 1;
        });
      }
    });
    return s;
  }, [attempts]);

  const badges = React.useMemo(() => {
    const NEGATIVE_STATUSES = [
      'resume_screen_failed', 'test_failed', 'interview_failed', 'process_ended', 
      'first_interview_failed', 'second_interview_failed', 'third_interview_failed', 'group_interview_failed'
    ];
    const INTERVIEW_STATUSES = [
      'interview_invitation', 'first_interview', 'second_interview', 'third_interview', 
      'group_interview', 'interview_failed', 'first_interview_failed', 
      'second_interview_failed', 'third_interview_failed', 'group_interview_failed'
    ];

    const b: AchievementBadge[] = [
      { id: 'first_record', title: '一纸始然', description: '第一份投递被记录，求职旅程正式开始。', icon: '📄', unlocked: attempts.length > 0 },
      { id: 'first_negative', title: '风起第一程', description: '第一次面对拒绝，并将它纳入成长路径。', icon: '🌬️', unlocked: attempts.some(a => NEGATIVE_STATUSES.includes(a.status)) },
      { id: 'first_interview', title: '曦光已至', description: '第一次获得面试机会，说明你的经历已经被看见。', icon: '🌅', unlocked: attempts.some(a => INTERVIEW_STATUSES.some(is => a.status.includes(is))) },
      { id: 'first_offer', title: '行至花信', description: '第一次收到 Offer，阶段性结果终于出现。', icon: '🌸', unlocked: attempts.some(a => a.status === 'offer_received' || a.status === 'offer') },
      { id: 'reflection_master', title: '深潜者', description: '完成十次 AI 成长复盘，开始从反馈中看见更深的自己。', icon: '🧗', unlocked: attempts.filter(a => !!a.reflection).length >= 10 },
      { id: 'rejection_collector', title: '拒信收藏家', description: '经历十次拒绝后，你仍然持续记录和复盘。', icon: '🗄️', unlocked: attempts.filter(a => NEGATIVE_STATUSES.includes(a.status)).length >= 10 },
    ].map(badge => ({
      ...badge,
      hasShownNotification: shownBadges.includes(badge.id)
    }));
    return b;
  }, [attempts, shownBadges]);

  const addAttempt = (attempt: Attempt) => {
    const initializedAttempt = {
      ...attempt,
      createdAt: attempt.createdAt || new Date().toISOString(),
      updatedAt: attempt.updatedAt || new Date().toISOString(),
      timeline: attempt.timeline || [
        { date: new Date().toISOString(), label: '已投递，待反馈', status: attempt.status }
      ]
    };
    setAttempts(prev => [initializedAttempt, ...prev]);
  };

  const updateAttempt = (id: string, partial: Partial<Attempt>) => {
    setAttempts(prev => prev.map(a => {
      if (a.id === id) {
        const newStatus = (partial.status || a.status) as any;
        const statusChanged = partial.status && partial.status !== a.status;
        
        let newTimeline = a.timeline || [];
        if (statusChanged) {
           const statusLabels: Record<string, string> = {
             waiting_feedback: '已投递，待反馈',
             no_response: '投递后暂无回应',
             resume_screen_failed: '简历初筛未通过',
             test_invitation: '收到测评邀请',
             test_in_progress: '测评进行中',
             test_completed: '测评已完成',
             test_failed: '测评未通过',
             test_passed_waiting_interview: '测评通过，待面试',
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
             offer_discussing: 'Offer 沟通中',
             offer_received: '已获得 Offer',
             offer_declined: '已拒绝 Offer',
             process_ended: '已结束流程'
           };
           
           newTimeline = [...newTimeline, { 
             date: new Date().toISOString(), 
             label: statusLabels[newStatus] || newStatus, 
             status: newStatus 
           }];
        }

        return { 
          ...a, 
          ...partial, 
          timeline: newTimeline,
          updatedAt: new Date().toISOString() 
        };
      }
      return a;
    }));
  };

  const deleteAttempt = (id: string) => {
    setAttempts(prev => prev.filter(a => a.id !== id));
  };

  const markBadgeAsShown = (id: string) => {
    setShownBadges(prev => prev.includes(id) ? prev : [...prev, id]);
  };

  const resetData = () => {
    setAttempts([]);
    setShownBadges([]);
    localStorage.removeItem('offer-garden-attempts');
    localStorage.removeItem('offer-garden-shown-badges');
  };

  const loadDemoData = () => {
    const now = new Date();
    const formatDate = (daysAgo: number) => {
      const d = new Date(now);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString();
    };

    const demoData: Attempt[] = [
      {
        id: 'demo-1',
        company: '腾讯',
        role: '客户端开发',
        stage: 'result',
        status: 'offer_received',
        resumeSummary: '3年 Unity/C# 开发经验，深度参与两款千万级 DAU 手游的核心战斗模块优化。精通渲染管线裁剪与合批优化。',
        jdText: '负责手游客户端核心渲染模块开发；参与自研引擎的性能调优与渲染链路瓶颈排查；协同美术与策划实现高质量视觉特效。',
        mood: 'excited',
        notes: '面试官非常硬核，问了很多底层实现，聊得很好。',
        createdAt: formatDate(35),
        updatedAt: formatDate(1),
        timeline: [
          { date: formatDate(35), label: '已投递，待反馈', status: 'waiting_feedback' },
          { date: formatDate(30), label: '收到测评邀请', status: 'test_invitation' },
          { date: formatDate(28), label: '测评进行中', status: 'test_in_progress' },
          { date: formatDate(26), label: '测评已完成', status: 'test_completed' },
          { date: formatDate(24), label: '测评通过，待面试', status: 'test_passed_waiting_interview' },
          { date: formatDate(22), label: '收到面试邀请', status: 'interview_invitation' },
          { date: formatDate(20), label: '一面进行中', status: 'first_interview' },
          { date: formatDate(15), label: '二面进行中', status: 'second_interview' },
          { date: formatDate(10), label: '三面进行中', status: 'third_interview' },
          { date: formatDate(5), label: 'Offer 沟通中', status: 'offer_discussing' },
          { date: formatDate(1), label: '已获得 Offer', status: 'offer_received' }
        ]
      },
      {
        id: 'demo-bytedance-active',
        company: '字节跳动',
        role: '前端开发实习生',
        stage: 'interview',
        status: 'second_interview',
        resumeSummary: '熟悉 React 及其生态，有良好的工程化实践经验，开发过多个复杂组件库项目。',
        jdText: '负责字节跳动核心业务前端开发；追求极致的加载速度和交互体验。',
        mood: 'tense',
        notes: '一面刚结束，正在复习浏览器渲染原理 and 网络协议，准备迎接二面。',
        createdAt: formatDate(10),
        updatedAt: formatDate(0),
        timeline: [
          { date: formatDate(10), label: '已投递，待反馈', status: 'waiting_feedback' },
          { date: formatDate(8), label: '收到面试邀请', status: 'interview_invitation' },
          { date: formatDate(5), label: '一面进行中', status: 'first_interview' },
          { date: formatDate(0), label: '二面进行中', status: 'second_interview' }
        ]
      },
      {
        id: 'demo-interview-active',
        company: '小红书',
        role: '前端开发实习生',
        stage: 'interview',
        status: 'group_interview',
        resumeSummary:'参与过校园二手交易平台前端开发，使用 React、TypeScript 和 Tailwind CSS 完成商品列表、搜索筛选、用户发布流程等模块；优化过列表渲染性能，并负责接口联调与页面状态管理。',
        jdText:'负责社区内容产品的前端页面开发；要求熟悉 React、TypeScript、组件化开发和基础性能优化；具备良好的交互还原能力和接口联调经验。',
        mood: 'tense',
        notes: '群面即将开始，重点准备团队协作、需求分析 and 现场代码组织能力，保持自信输出^_^',
        createdAt: formatDate(18),
        updatedAt: formatDate(2),
        timeline: [
          { date: formatDate(18), label: '已投递，待反馈', status: 'waiting_feedback' },
          { date: formatDate(12), label: '收到面试邀请', status: 'interview_invitation' },
          { date: formatDate(5), label: '群面进行中', status: 'group_interview' },
        ]
      },
      {
        id: 'demo-interview-failed',
        company: '美团',
        role: '产品运营实习生',
        stage: 'interview',
        status: 'first_interview_failed',
        resumeSummary: '运营过一个 2 万粉丝的校园公众号，平均阅读量 3k+。熟悉短视频剪辑和社区导流逻辑。',
        jdText: '负责社区内容分发策略优化；协同开发提升转化率；对社交赛道有独到见解。',
        mood: 'disappointed',
        notes: '一面表现还可以，但对数据指标的归因分析说得不够透彻。',
        createdAt: formatDate(20),
        updatedAt: formatDate(2),
        reflection: {
          mainReason: ["数据归因分析不够专业", "对核心业务链路理解有误"],
          evidence: "面试官问到如果 DAU 下滑 5% 该如何拆解，我只说了看渠道，没有深入到用户分层和功能流失环节。",
          nextActions: [
            { id: 'task-1-1', task: "学习异动分析方法论，建立一套完整的归因框架", completed: true, sourceAttemptId: 'demo-interview-failed', createdAt: formatDate(2), completedAt: formatDate(1) },
            { id: 'task-1-2', task: "深度调研类似竞品的用户路径设计", completed: false, sourceAttemptId: 'demo-interview-failed', createdAt: formatDate(2) }
          ],
          emotionalReframe: "这次失败是极其宝贵的“错题本”。你可以明确感受到在大厂眼中，运营不只是创意，更是严密的逻辑 and 对不确定性的掌控力。",
          couragePointEarned: true,
          generatedAt: formatDate(2),
          sourceStatus: 'first_interview_failed'
        },
        timeline: [
          { date: formatDate(20), label: '已投递，待反馈', status: 'waiting_feedback' },
          { date: formatDate(18), label: '收到测评邀请', status: 'test_invitation' },
          { date: formatDate(16), label: '测评进行中', status: 'test_in_progress' },
          { date: formatDate(14), label: '测评已完成', status: 'test_completed' },
          { date: formatDate(12), label: '测评通过，待面试', status: 'test_passed_waiting_interview' },
          { date: formatDate(10), label: '收到面试邀请', status: 'interview_invitation' },
          { date: formatDate(4), label: '一面进行中', status: 'first_interview' },
          { date: formatDate(2), label: '一面未通过', status: 'first_interview_failed' },
          { date: formatDate(2), label: '完成 AI 成长复盘', type: 'reflection_created' as any}
        ]
      },
      {
        id: 'demo-test-failed',
        company: '百度',
        role: '算法实习生',
        stage: 'test',
        status: 'test_failed',
        resumeSummary: '深度学习方向研究生在读，发表过一篇顶会二作。精通 PyTorch。',
        jdText: '负责配送调度算法优化；参与强化学习模型训练；极强的手写算法 and 数学推导能力。',
        mood: 'tense',
        notes: '测评题量很大，最后两道动态规划没写出来。',
        createdAt: formatDate(15),
        updatedAt: formatDate(5),
        reflection: {
          mainReason: ["算法题库覆盖不够", "手速 and 容错率需要提高"],
          evidence: "测评一共 5 道题，用了 60 分钟才写完前 3 道，最后两道 hard 级没时间思考细节。",
          nextActions: [
            { id: 'task-2-1', task: "在 LeetCode 上限时练习 20 道 DP 困难题", completed: false, sourceAttemptId: 'demo-test-failed', createdAt: formatDate(5) }
          ],
          emotionalReframe: "不要因为测评受挫而否定研究能力。测评是一场有限时间的博弈，它考验的是熟练度，而你可以通过练习来解决。",
          couragePointEarned: true,
          generatedAt: formatDate(5),
          sourceStatus: 'test_failed'
        },
        timeline: [
          { date: formatDate(15), label: '已投递，待反馈', status: 'waiting_feedback' },
          { date: formatDate(12), label: '收到测评邀请', status: 'test_invitation' },
          { date: formatDate(10), label: '测评进行中', status: 'test_in_progress' },
          { date: formatDate(8), label: '测评已完成', status: 'test_completed' },
          { date: formatDate(5), label: '测评未通过', status: 'test_failed' },
          { date: formatDate(5), label: '完成 AI 成长复盘', type: 'reflection_created' as any}
        ]
      },
      {
        id: 'demo-resume-failed',
        company: '阿里巴巴',
        role: 'Java 研发实习生',
        stage: 'application',
        status: 'resume_screen_failed',
        resumeSummary: '主要使用 Node.js 做后端，Java 基础只有学院课程水平。熟悉基本的 Spring Boot。',
        jdText: '核心中间件维护；高并发场景优化；对 Java 底层 JVM 有深刻理解。',
        mood: 'calm',
        notes: '意料之中，技术栈不太匹配。',
        createdAt: formatDate(10),
        updatedAt: formatDate(8),
        reflection: {
          mainReason: ["技术栈核心能力与岗位不匹配", "缺乏大型分布式系统实战经验"],
          evidence: "简历中重点写了 Node.js 异步 IO，但岗位核心是 Java 高并发中间件。",
          nextActions: [
            { id: 'task-3-1', task: "针对 Java 研发岗重点改写一版简历，突显底层理解", completed: true, sourceAttemptId: 'demo-resume-failed', createdAt: formatDate(8), completedAt: formatDate(7) }
          ],
          emotionalReframe: "这不是对你能力的拒绝，而是一次供需的不匹配。调整策略，或者补齐拼图，下次你就是“天选之人”。",
          couragePointEarned: true,
          generatedAt: formatDate(8),
          sourceStatus: 'resume_screen_failed'
        },
        timeline: [
          { date: formatDate(10), label: '已投递，待反馈', status: 'waiting_feedback' },
          { date: formatDate(8), label: '简历初筛未通过', status: 'resume_screen_failed' },
          { date: formatDate(8), label: '完成 AI 成长复盘', type: 'reflection_created' as any}
        ]
      },
      {
        id: 'demo-no-response',
        company: '京东',
        role: '全栈开发工程师',
        stage: 'application',
        status: 'no_response',
        resumeSummary: '精通 Next.js and Node.js，有 2 年大型电商项目实战经验。',
        jdText: '负责京东商城核心系统全栈开发；主导微服务化演进。',
        createdAt: formatDate(35),
        updatedAt: formatDate(12),
        timeline: [
          { date: formatDate(35), label: '已投递，待反馈', status: 'waiting_feedback' },
          { date: formatDate(12), label: '投递后暂无回应', status: 'no_response' }
        ]
      },
      {
        id: 'demo-process-ended',
        company: '蚂蚁集团',
        role: '网络安全工程师',
        stage: 'result',
        status: 'process_ended',
        resumeSummary: 'CTF 比赛常客，擅长渗透测试 and 二进制漏洞挖掘。',
        jdText: '负责蚂蚁金服核心支付链路安全防护；防范全球黑客攻击。',
        mood: 'calm',
        notes: '流程持续了一周，虽然最后没完成面试，但跟面试官聊还是知道了自己的不足。',
        createdAt: formatDate(60),
        updatedAt: formatDate(5),
        timeline: [
          { date: formatDate(60), label: '已投递，待反馈', status: 'waiting_feedback' },
          { date: formatDate(40), label: '收到面试邀请', status: 'interview_invitation' },
          { date: formatDate(35), label: '一面进行中', status: 'first_interview' },
          { date: formatDate(25), label: '二面进行中', status: 'second_interview' },
          { date: formatDate(15), label: '三面进行中', status: 'third_interview' },
          { date: formatDate(5), label: '已结束流程', status: 'process_ended' }
        ]
      },
      {
        id: 'demo-declined',
        company: '拼多多',
        role: '移动端开发工程师',
        stage: 'result',
        status: 'offer_declined',
        resumeSummary: '深耕 iOS 开发 4 年，精通 Swift/Objective-C。独立开发过 3 款日活过万的 App。',
        jdText: '负责拼多多主站移动端核心业务开发；应对极端高并发性能挑战；参与架构演进。',
        mood: 'calm',
        notes: '薪资给得很高，但考虑到城市和未来三年的成长空间，最终还是拒绝了。',
        createdAt: formatDate(25),
        updatedAt: formatDate(1),
        timeline: [
          { date: formatDate(25), label: '已投递，待反馈', status: 'waiting_feedback' },
          { date: formatDate(15), label: '收到面试邀请', status: 'interview_invitation' },
          { date: formatDate(12), label: '一面进行中', status: 'first_interview' },
          { date: formatDate(8), label: '二面进行中', status: 'second_interview' },
          { date: formatDate(4), label: '已获得 Offer', status: 'offer_received' },
          { date: formatDate(1), label: '已拒绝 Offer', status: 'offer_declined' }
        ]
      }
    ];
    setAttempts(demoData);
  };

  const completeAction = (attemptId: string, actionId: string) => {
    setAttempts(prev => prev.map(a => {
      if (a.id === attemptId && a.reflection && a.reflection.nextActions) {
        const actionItem = a.reflection.nextActions.find(item => item.id === actionId);
        if (!actionItem || actionItem.completed) return a;

        const newTimeline = [...(a.timeline || []), {
          date: new Date().toISOString(),
          label: `完成行动任务：${actionItem.task}`,
          type: 'task_completed' as const,
          taskText: actionItem.task
        }];

        return {
          ...a,
          timeline: newTimeline,
          reflection: {
            ...a.reflection,
            nextActions: a.reflection.nextActions.map(item => 
              item.id === actionId ? { ...item, completed: true, completedAt: new Date().toISOString() } : item
            )
          }
        };
      }
      return a;
    }));
  };

  const claimReflectionCP = (attemptId: string) => {
    setAttempts(prev => prev.map(a => {
      if (a.id === attemptId && a.reflection && !a.reflection.couragePointEarned) {
        return {
          ...a,
          reflection: { ...a.reflection, couragePointEarned: true }
        };
      }
      return a;
    }));
  };

  const saveReflection = (attemptId: string, reflection: ReflectionData) => {
    setAttempts(prev => prev.map(a => {
      if (a.id === attemptId) {
        const updatedTimeline = [
          ...(a.timeline || []),
          { 
            date: new Date().toISOString(), 
            label: '完成 AI 成长复盘', 
            type: 'reflection_created' as any 
          }
        ];
        return {
          ...a,
          reflection: {
            ...reflection,
            couragePointEarned: true,
            generatedAt: new Date().toISOString(),
            sourceStatus: a.status
          },
          timeline: updatedTimeline,
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    }));
  };

  const getAttempt = (id: string) => attempts.find(a => a.id === id);

  return (
    <AppContext.Provider value={{ 
      attempts, 
      stats, 
      badges, 
      addAttempt, 
      updateAttempt, 
      deleteAttempt, 
      saveReflection,
      markBadgeAsShown,
      getAttempt, 
      completeAction, 
      claimReflectionCP,
      resetData,
      loadDemoData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
