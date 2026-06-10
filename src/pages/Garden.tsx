import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ArrowRight, Clock, CheckCircle2, ChevronRight, Award, X, Sparkles, AlertTriangle, Target, Info, Trophy } from 'lucide-react';
import { GlowingTree } from '../components/Tree';
import { AtmosphereBackground } from '../components/AtmosphereBackground';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { getStatusLabel, getStageLabel, getMoodLabel, formatHistoryItem } from '../lib/utils';
import { Attempt, AttemptStatus, AttemptStage, AchievementBadge } from '../types';

const STATUS_MAP: Record<AttemptStatus, { label: string, color: string }> = {
  waiting_feedback: { label: '已投递，待反馈', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  no_response: { label: '投递后暂无回应', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  resume_screen_failed: { label: '简历初筛未通过', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  test_invitation: { label: '收到测评邀请', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  test_in_progress: { label: '测评进行中', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  test_completed: { label: '测评已完成', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  test_failed: { label: '测评未通过', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  test_passed_waiting_interview: { label: '测评通过，待面试', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  interview_invitation: { label: '收到面试邀请', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  first_interview: { label: '一面进行中', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  second_interview: { label: '二面进行中', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  third_interview: { label: '三面进行中', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  group_interview: { label: '群面进行中', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  interview_failed: { label: '面试未通过', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  first_interview_failed: { label: '一面未通过', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  second_interview_failed: { label: '二面未通过', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  third_interview_failed: { label: '三面未通过', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  group_interview_failed: { label: '群面未通过', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  offer_discussing: { label: 'Offer 沟通中', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  offer_received: { label: '已获得 Offer', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  offer_declined: { label: '已拒绝 Offer', color: 'text-white/80 bg-white/5 border-white/10' },
  process_ended: { label: '已结束流程', color: 'text-white/80 bg-white/5 border-white/10' },
  // Legacy / Compat
  rejected: { label: '简历初筛未通过', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  pending: { label: '已投递，待反馈', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  interview_granted: { label: '收到面试邀请', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  ghosted: { label: '投递后暂无回应', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  // @ts-ignore
  offer: { label: '已获得 Offer', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
};

const STAGE_MAP: Record<AttemptStage, string> = {
  application: '投递',
  test: '测评',
  interview: '面试',
  result: '结果',
};

const TITLES = [
  { min: 0, name: '种子未眠' },
  { min: 1, name: '第一束光' },
  { min: 5, name: '逆风发芽' },
  { min: 10, name: '风暴练习生' },
  { min: 25, name: '旷野种树人' },
  { min: 50, name: '花信可期' },
  { min: 75, name: '向光而行' },
  { min: 100, name: '被拒绝的勇气' },
];

export function Garden() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { attempts, stats, badges, completeAction, resetData, loadDemoData, markBadgeAsShown } = useAppContext();
  
  const [isFlowing, setIsFlowing] = useState(false);

  useEffect(() => {
    if (searchParams.get('fromReflection') === 'true') {
      setIsFlowing(true);
      const timer = setTimeout(() => {
        setIsFlowing(false);
        // Clean up the URL parameter
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('fromReflection');
        setSearchParams(newParams, { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  const [selectedMilestone, setSelectedMilestone] = useState<Attempt | null>(null);
  const [selectedGuidance, setSelectedGuidance] = useState<Attempt | null>(null);
  const [selectedTimeline, setSelectedTimeline] = useState<Attempt | null>(null);
  const [selectedOfferResult, setSelectedOfferResult] = useState<Attempt | null>(null);
  const [selectedWaitingAdvice, setSelectedWaitingAdvice] = useState<Attempt | null>(null);
  const [selectedTestAdvice, setSelectedTestAdvice] = useState<Attempt | null>(null);
  const [selectedOfferCommunication, setSelectedOfferCommunication] = useState<Attempt | null>(null);
  const [selectedInterviewAdvice, setSelectedInterviewAdvice] = useState<Attempt | null>(null);

  const [unlockedBadge, setUnlockedBadge] = useState<AchievementBadge | null>(null);

  useEffect(() => {
    // Find first badge that is unlocked AND notification hasn't been shown
    const newBadge = badges.find(b => b.unlocked && !b.hasShownNotification);
    if (newBadge) {
      setUnlockedBadge(newBadge);
    }
  }, [badges]);

  const handleCloseBadgeModal = () => {
    if (unlockedBadge) {
      markBadgeAsShown(unlockedBadge.id);
      setUnlockedBadge(null);
    }
  };
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLoadDemoConfirm, setShowLoadDemoConfirm] = useState(false);

  // Weekly Insight - API 版（保留原有 Mock 作为降级）
  const [aiWeeklyInsight, setAiWeeklyInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(true);
  
  useEffect(() => {
    const fetchWeeklyInsight = async () => {
      // 记录太少时，不调用 AI，直接使用原有逻辑
      if (attempts.length < 2) {
        setIsInsightLoading(false);
        return;
      }
      
      try {
        // 构建简短的上下文
        const recentSummary = attempts.slice(0, 8).map(a => 
          `${a.company}(${getStatusLabel(a.status)})`
        ).join('、');
        
        const response = await fetch('https://offer-garden.vercel.app/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'replay',  // 复用复盘 action
            context: {
              company: "本周求职总结",
              position: "综合反馈",
              stage: "汇总",
              status: "weekly_insight",
              jd: recentSummary,
              resume: `共${attempts.length}次投递`,
              notes: "",
              mood: ""
            }
          })
        });
        const data = await response.json();
        // 从返回中取 emotionalReframe 或 evidence
        setAiWeeklyInsight(data.emotionalReframe || data.evidence || null);
      } catch (error) {
        console.error('获取周洞察失败', error);
        setAiWeeklyInsight(null);
      } finally {
        setIsInsightLoading(false);
      }
    };
    
    fetchWeeklyInsight();
  }, [attempts]);

  // 原有的 Mock 逻辑（保持不变，作为降级）
  // Weekly Insight Mock Logic
  const weeklyInsight = useMemo(() => {
    // AI loading state takes priority
    if (isInsightLoading && attempts.length >= 2) {
      return "AI 正在分析你的求职趋势...";
    }
  
    // AI result if available
    if (aiWeeklyInsight) {
      return aiWeeklyInsight;
    }
  
    // Fallback to mock logic
    if (attempts.length < 3) {
      return "记录更多尝试后，Offer Garden 会帮你发现常见卡点，例如简历筛选、笔试、面试表达或 Offer 选择。";
    }
    
    const recent = attempts.slice(0, 10);
    const hasOffer = recent.some(a => a.status === 'offer_received');
    const failedScreen = recent.filter(a => a.status === 'resume_screen_failed' || a.status === 'no_response').length;
    const failedInterview = recent.filter(a => a.status.includes('failed') && a.status.includes('interview')).length;
    const waiting = recent.filter(a => a.status === 'waiting_feedback').length;

    if (hasOffer) return "你已经获得阶段性结果。接下来可以记录 Offer 条件、回复截止日期，并判断它是否符合你的长期方向。";
    if (failedInterview >= 2) return "你已经多次进入面试阶段，说明材料有被看见。下一步重点可以从简历优化转向项目表达、STAR 故事和临场回答结构。";
    if (failedScreen >= 3) return "你最近更多卡在投递筛选阶段。建议优先优化简历第一屏的信息密度和岗位关键词匹配度，而不是继续单纯增加投递数量。";
    if (waiting >= 3) return "你目前有多条尝试仍在等待反馈。可以先准备同类岗位的下一轮投递，不必把所有情绪都压在一个结果上。";
    
    return "保持当前的投递节奏。记录每一次细微的反馈，它们都会在未来的复盘中为你指明方向。";
  }, [attempts, isInsightLoading, aiWeeklyInsight]);

  const titleInfo = useMemo(() => {
    let currentTitle = TITLES[0];
    let nextTitle = TITLES[1];
    for (let i = 0; i < TITLES.length; i++) {
       if (stats.couragePoints >= TITLES[i].min) {
         currentTitle = TITLES[i];
         nextTitle = TITLES[i+1] || TITLES[i];
       }
    }
    return { current: currentTitle, next: nextTitle, diff: nextTitle.min - stats.couragePoints };
  }, [stats.couragePoints]);

  const treeMessage = useMemo(() => {
    const attemptsCount = attempts.length;
    const offersCount = stats.offersCount;
    if (offersCount > 0) return "经历霜雪，方见繁花。你的坚持迎来了里程碑。";
    if (attemptsCount >= 1) return "微光已至，正向光而行。每一次复盘都在转化能量。";
    return "万物始于静默。记录一次尝试，为它注入第一抹光。";
  }, [attempts.length, stats.offersCount]);

  const nextActions = useMemo(() => {
    const list: { attemptId: string, actionId: string, task: string, completed: boolean }[] = [];
    attempts.forEach(a => {
      if (a.reflection?.nextActions) {
        a.reflection.nextActions.forEach(item => {
          if (!item.completed) {
             list.push({ attemptId: a.id, actionId: item.id, task: item.task, completed: item.completed });
          }
        });
      }
    });
    return list.slice(0, 3);
  }, [attempts]);

  return (
    <main className="relative min-h-screen bg-[#070A16] overflow-x-hidden">
      {/* Background Atmosphere */}
      <AtmosphereBackground density={0.8} variant="rich" />

      <div className="relative z-10 max-w-[1240px] mx-auto w-full py-12 px-8 space-y-20">
        {/* Top Demo tools */}
        <div className="flex justify-end gap-3">
           <Button 
             variant="ghost" 
             size="sm" 
             className="text-[10px] uppercase tracking-widest text-emerald-400/50 hover:text-emerald-400 border border-emerald-500/0 border-emerald-500/20"
             onClick={() => setShowLoadDemoConfirm(true)}
           >
             加载示例花园
           </Button>
           <Button 
             variant="ghost" 
             size="sm" 
             className="text-[10px] uppercase tracking-widest text-red-400/40 hover:text-red-400 border border-red-500/0 border-red-500/20"
             onClick={() => setShowResetConfirm(true)}
           >
             重新开始
           </Button>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-14 items-start">
          {/* Left Section: Tree Card */}
          <div className="w-full shrink-0 sticky top-30">
            <div className="relative flex flex-col items-center justify-center p-8 bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden min-h-[750px]">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
              <div className="relative z-10 w-full h-full flex justify-center items-center">
                <GlowingTree 
                  attemptsCount={attempts.length} 
                  offersCount={stats.offersCount} 
                  couragePoints={stats.couragePoints}
                  isFlowing={isFlowing}
                  size="lg" 
                  className="scale-115"
                />
              </div>
              <div className="absolute bottom-12 left-0 right-0 px-12 text-center z-20">
                <p className="text-white/20 text-[11px] leading-relaxed italic font-medium tracking-wide">{treeMessage}</p>
              </div>
            </div>
          </div>

          {/* Right Section: Content */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight text-white/95">我的成长花园</h1>
              <div className="flex items-center gap-4">
                 <div className="px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-col items-start gap-0.5">
                    <div className="text-[9px] text-indigo-400 uppercase tracking-widest font-black mb-1">当前称号</div>
                    <div className="text-xl font-black text-indigo-200 tracking-tight leading-none">{titleInfo.current.name}</div>
                 </div>
                 {titleInfo.current !== titleInfo.next && (
                   <div className="text-[11px] text-white/20 font-medium font-sans">
                      距离 <span className="text-white/40">「{titleInfo.next.name}」</span> 还差 <span className="text-indigo-400/60 font-bold">{titleInfo.diff}</span> 点勇气值
                   </div>
                 )}
              </div>
            </div>

            {/* Stats Area - Compact container for boxes */}
            <div className="grid grid-cols-12 gap-4">
               {/* Courage Points Main Card */}
               <div className="col-span-12 sm:col-span-6 p-8 rounded-[32px] border bg-indigo-500/10 border-indigo-500/20 flex flex-col justify-center group relative overflow-hidden h-full min-h-[220px]">
                  <div className="absolute -top-1 -right-1 p-6 opacity-5 group-hover:scale-110 transition-transform">
                     <Sparkles className="w-20 h-20 text-indigo-400" />
                  </div>
                  <div className="relative z-10">
                     <div className="text-6xl font-black text-indigo-200 mb-3 tracking-tighter">
                        {stats.couragePoints}
                     </div>
                     <div className="space-y-1.5 focus:outline-none">
                        <div className="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-400/70 leading-none">COURAGE POINTS</div>
                        <div className="text-[11px] font-bold text-indigo-400/40">勇气值</div>
                     </div>
                  </div>
               </div>

               {/* Small Stats Grid */}
               <div className="col-span-12 sm:col-span-6 grid grid-cols-2 gap-4">
                  <MiniStat label="ATTEMPTS" value={stats.attemptsCount} />
                  <MiniStat label="REFLECTIONS" value={stats.reflectionsCount} />
                  <MiniStat label="INTERVIEWS" value={stats.interviewsCount} />
                  <MiniStat label="OFFERS" value={stats.offersCount} />
               </div>
            </div>

            <div className="space-y-12">
              {/* Achievements Section */}
              <div className="space-y-5">
                 <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] border-l-2 border-white/10 pl-5">Achievements / 里程碑徽章</h3>
                 <div className="grid grid-cols-4 sm:flex sm:flex-nowrap gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 custom-scrollbar">
                    {badges.map(badge => (
                      <div 
                        key={badge.id}
                        className={`relative p-3 rounded-[20px] border transition-all flex flex-col items-center gap-2 min-w-[85px] text-center shrink-0 ${
                          badge.unlocked 
                            ? 'bg-white/[0.04] border-white/10 opacity-100 shadow-lg' 
                            : 'bg-transparent border-white/5 opacity-25 grayscale'
                        }`}
                      >
                         <span className="text-xl">{badge.icon}</span>
                         <span className="text-[9px] font-bold leading-tight text-white/40">{badge.title}</span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Weekly Insight Section */}
              <div className="space-y-5">
                 <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] border-l-2 border-white/10 pl-5">Weekly AI Insight / 本周 AI 洞察</h3>
                 <div className="p-8 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/5 rounded-[32px] group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                       <Sparkles className="w-24 h-24 text-white" />
                    </div>
                    <div className="relative z-10 flex gap-5 items-start">
                       <div className="p-3 bg-indigo-500/10 rounded-2xl flex-shrink-0">
                          <Target className="w-5 h-5 text-indigo-400" />
                       </div>
                       <p className="text-[14px] text-white/60 leading-relaxed font-medium italic">
                          {weeklyInsight}
                       </p>
                    </div>
                 </div>
              </div>

              {/* Next Actions */}
              <div className="space-y-5">
                 <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] border-l-2 border-white/10 pl-5">AI Next Steps / 建议行动</h3>
                 {nextActions.length > 0 ? (
                   <div className="space-y-4">
                     {nextActions.map((act) => (
                       <div key={act.actionId} className="group flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-[28px] hover:bg-white/[0.04] transition-all">
                         <div className="flex gap-4 items-start pr-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 mt-2 shrink-0" />
                           <span className="text-[13px] text-white/60 leading-relaxed font-medium">{act.task}</span>
                         </div>
                         <Button 
                           size="sm" 
                           variant="ghost" 
                           className="h-8 px-4 text-[10px] font-bold text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/20 rounded-xl shrink-0"
                           onClick={() => completeAction(act.attemptId!, act.actionId)}
                         >
                           DONE
                         </Button>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="p-10 border border-white/5 border-dashed rounded-[40px] text-center">
                      <p className="text-[11px] text-white/20 uppercase font-black tracking-widest">暂无推荐行动</p>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </section>

        {/* Attempts List Section */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <h2 className="text-2xl font-bold text-white/90">投递记录 ({attempts.length})</h2>
            <Button onClick={() => navigate('/record')} size="sm" className="h-11 px-6 gap-2 text-sm font-bold">
              <Plus className="w-4 h-4" />
              记录新的尝试
            </Button>
          </div>

          {attempts.length === 0 ? (
            <div className="text-center py-32 bg-white/[0.01] border border-white/5 rounded-[40px] border-dashed">
              <p className="text-white/30 text-base mb-8">还没有任何记录，开始种下第一颗种子吧。</p>
              <Button onClick={() => navigate('/record')} variant="secondary" size="lg" className="h-12 px-8">去记录</Button>
            </div>
          ) : (
            <div className="grid gap-5">
              {attempts.map(attempt => (
                <motion.div 
                  key={attempt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] hover:bg-white/[0.06] transition-all shadow-xl"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-white/95 text-lg">{attempt.company}</h3>
                      <div className="flex items-center gap-1.5 shrink-0">
                         <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 text-white/40 font-bold uppercase tracking-wider">
                            {getStageLabel(attempt.stage)}
                         </span>
                         <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${STATUS_MAP[attempt.status]?.color || 'text-white/40 bg-white/5 border-white/10'}`}>
                            {getStatusLabel(attempt.status)}
                         </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[13px] text-white/40">
                      <span className="font-medium text-white/60">{attempt.role}</span>
                      <span className="flex items-center gap-1.5 border-l border-white/10 pl-4">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(attempt.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      className="h-10 px-5 text-[13px] font-bold gap-2 whitespace-nowrap rounded-xl text-white/40 hover:text-white/80"
                      onClick={() => navigate(`/record?id=${attempt.id}`)}
                    >
                      更新记录
                    </Button>
                    
                    {renderActionButton(
                      attempt, 
                      navigate, 
                      setSelectedMilestone, 
                      setSelectedGuidance, 
                      setSelectedTimeline, 
                      setSelectedOfferResult, 
                      setSelectedWaitingAdvice, 
                      setSelectedOfferCommunication,
                      setSelectedTestAdvice,
                      setSelectedInterviewAdvice
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

        {/* Modals */}
        <AnimatePresence>
          {selectedMilestone && (
            <MilestoneModal 
              attempt={selectedMilestone} 
              onClose={() => setSelectedMilestone(null)} 
              onUpdate={() => {
                setSelectedMilestone(null);
                navigate(`/record?id=${selectedMilestone.id}`);
              }}
            />
          )}
          {selectedOfferCommunication && (
            <OfferCommunicationModal 
              attempt={selectedOfferCommunication} 
              onClose={() => setSelectedOfferCommunication(null)}
              onUpdate={() => {
                setSelectedOfferCommunication(null);
                navigate(`/record?id=${selectedOfferCommunication.id}`);
              }}
            />
          )}
          {selectedGuidance && (
            <GuidanceModal 
              attempt={selectedGuidance} 
              onClose={() => setSelectedGuidance(null)}
            />
          )}
          {selectedTestAdvice && (
            <TestAdviceModal 
              attempt={selectedTestAdvice} 
              onClose={() => setSelectedTestAdvice(null)} 
            />
          )}
          {selectedInterviewAdvice && (
            <InterviewAdviceModal 
              attempt={selectedInterviewAdvice} 
              onClose={() => setSelectedInterviewAdvice(null)} 
            />
          )}
          {selectedTimeline && (
            <TimelineModal 
              attempt={selectedTimeline} 
              onClose={() => setSelectedTimeline(null)}
              onGarden={() => setSelectedTimeline(null)}
            />
          )}
        {selectedOfferResult && (
          <OfferResultModal 
            attempt={selectedOfferResult} 
            onClose={() => setSelectedOfferResult(null)}
            onUpdate={() => {
              setSelectedOfferResult(null);
              navigate(`/record?id=${selectedOfferResult.id}`);
            }}
          />
        )}
        {selectedWaitingAdvice && (
          <WaitingAdviceModal 
            attempt={selectedWaitingAdvice}
            onClose={() => setSelectedWaitingAdvice(null)}
            onUpdate={() => {
              setSelectedWaitingAdvice(null);
              navigate(`/record?id=${selectedWaitingAdvice.id}`);
            }}
          />
        )}
        
        {/* Demo Modals */}
        {showLoginModal && (
          <SimpleModal
            title="账号系统将在后续版本开放"
            description="当前 MVP 会将你的成长记录保存在本地浏览器中。你可以使用「加载示例花园」查看完整演示数据，也可以使用「重新开始」清空当前记录。"
            confirmLabel="我知道了"
            onConfirm={() => setShowLoginModal(false)}
            onClose={() => setShowLoginModal(false)}
          />
        )}
        {showResetConfirm && (
          <SimpleModal
            title="确认重新开始吗？"
            description="这会清空当前浏览器中的所有投递记录、勇气值、AI 复盘、里程碑徽章和示例数据。此操作无法恢复。"
            confirmLabel="确认清空"
            cancelLabel="取消"
            isDanger
            onConfirm={() => {
              resetData();
              setShowResetConfirm(false);
              navigate('/');
            }}
            onClose={() => setShowResetConfirm(false)}
          />
        )}
        {showLoadDemoConfirm && (
          <SimpleModal
            title="加载示例花园吗？"
            description="这会用一组演示数据替换当前浏览器中的记录，用于快速查看完整产品效果。你当前的本地记录会被覆盖。"
            confirmLabel="加载示例数据"
            cancelLabel="取消"
            onConfirm={() => {
              loadDemoData();
              setShowLoadDemoConfirm(false);
            }}
            onClose={() => setShowLoadDemoConfirm(false)}
          />
        )}

        {unlockedBadge && (
          <BadgeUnlockModal 
            badge={unlockedBadge} 
            onClose={handleCloseBadgeModal} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function renderActionButton(
  attempt: Attempt, 
  navigate: any, 
  setSelectedMilestone: (a: Attempt) => void,
  setSelectedGuidance: (a: Attempt) => void,
  setSelectedTimeline: (a: Attempt) => void,
  setSelectedOfferResult: (a: Attempt) => void,
  setSelectedWaitingAdvice: (a: Attempt) => void,
  setSelectedOfferCommunication: (a: Attempt) => void,
  setSelectedTestAdvice: (a: Attempt) => void,
  setSelectedInterviewAdvice: (a: Attempt) => void
) {
  const INTERVIEW_STATUSES: AttemptStatus[] = [
    'interview_invitation', 'first_interview', 'second_interview', 'third_interview', 'interview_granted',
    // @ts-ignore
    'group_interview'
  ];
  const TEST_STATUSES: AttemptStatus[] = [
    'test_invitation', 'test_in_progress', 'test_completed' as any
  ];
  const failureStatuses: AttemptStatus[] = [
    'resume_screen_failed', 'test_failed', 'group_interview_failed' as any,
    'first_interview_failed', 'second_interview_failed', 'third_interview_failed'
  ];

  const commonBtnClass = "h-10 px-5 text-[13px] font-bold gap-2 whitespace-nowrap rounded-xl";

  if (attempt.status === 'waiting_feedback' || attempt.status === 'test_passed_waiting_interview' as any) {
    return null; // Just show Update Record
  }

  if (attempt.status === 'no_response') {
    return (
      <Button variant="outline" className={`${commonBtnClass} bg-blue-500/10 backdrop-blur-md border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all`} onClick={() => setSelectedWaitingAdvice(attempt)}>
        查看等待建议<ChevronRight className="w-4 h-4" />
      </Button>
    );
  }

  if (TEST_STATUSES.includes(attempt.status)) {
    return (
      <Button variant="outline" className={`${commonBtnClass} bg-purple-500/10 backdrop-blur-md border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all`} onClick={() => setSelectedTestAdvice(attempt)}>
        查看准备建议<ChevronRight className="w-4 h-4" />
      </Button>
    );
  }

  if (INTERVIEW_STATUSES.includes(attempt.status)) {
    return (
      <Button 
        variant="outline" 
        className={`${commonBtnClass} bg-purple-500/10 backdrop-blur-md border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all`} 
        onClick={() => setSelectedInterviewAdvice(attempt)}
      >
        查看准备建议<ChevronRight className="w-4 h-4" />
      </Button>
    );
  }

  if (attempt.status === 'offer_received' || attempt.status === 'offer') {
    return (
      <Button 
        variant="secondary" 
        className={`${commonBtnClass} text-emerald-300 border-emerald-500/20 bg-emerald-500/5`} 
        onClick={() => setSelectedMilestone(attempt)}
      >
        查看里程碑<ChevronRight className="w-4 h-4" />
      </Button>
    );
  }

  if (attempt.status === 'offer_discussing') {
    return (
      <Button 
        variant="outline" 
        className={`${commonBtnClass} bg-emerald-500/5 backdrop-blur-md border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10 transition-all`} 
        onClick={() => setSelectedOfferCommunication(attempt)}
      >
        查看沟通建议<ChevronRight className="w-4 h-4" />
      </Button>
    );
  }

  if (attempt.status === 'offer_declined') {
    return (
      <Button variant="outline" className={`${commonBtnClass} bg-white/[0.03] backdrop-blur-md border border-white/[0.1] text-white/90 hover:text-white transition-all`} onClick={() => setSelectedOfferResult(attempt)}>
        查看结果详情<ChevronRight className="w-4 h-4" />
      </Button>
    );
  }

  if (attempt.status === 'process_ended') {
    return (
      <Button variant="outline" className={`${commonBtnClass} bg-white/[0.03] backdrop-blur-md border border-white/[0.1] text-white/90 hover:text-white transition-all`} onClick={() => setSelectedTimeline(attempt)}>
        查看投递全流程<ChevronRight className="w-4 h-4" />
      </Button>
    );
  }

  if (failureStatuses.includes(attempt.status)) {
    const hasReflection = !!attempt.reflection;
    const isMatchingStatus = attempt.reflection?.sourceStatus === attempt.status;
    
    let btnText = '生成复盘';
    let urlParams = `?id=${attempt.id}`;
    
    if (hasReflection) {
      if (isMatchingStatus) {
        btnText = '查看复盘';
      } else {
        btnText = '重新生成复盘';
        urlParams += '&regenerate=true';
      }
    }

    return (
      <Button 
        variant="secondary" 
        className={`${commonBtnClass} text-red-300 border-red-500/20 bg-red-500/5`} 
        onClick={() => navigate(`/reflection${urlParams}`)}
      >
        {btnText}<ChevronRight className="w-4 h-4" />
      </Button>
    );
  }

  return null;
}

function OfferCommunicationModal({ attempt, onClose, onUpdate }: { attempt: Attempt, onClose: () => void, onUpdate: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-[min(480px,92vw)] bg-[#11141a] border border-white/10 rounded-[32px] overflow-hidden relative z-10 shadow-2xl flex flex-col"
        style={{ maxHeight: '82vh' }}
      >
        <div className="flex-shrink-0 px-8 py-6 border-b border-white/5 flex justify-between items-start">
             <div className="space-y-2">
                <div className="flex items-center gap-3 text-emerald-400 mb-1">
                   <div className="p-3 bg-emerald-500/10 rounded-2xl">
                      <Sparkles className="w-7 h-7" />
                   </div>
                   <h2 className="text-xl font-bold tracking-tight text-white/90">Offer 沟通建议</h2>
                </div>
                <p className="text-emerald-400/60 text-[13px] font-medium leading-relaxed">快到结果阶段了，但先把关键信息确认清楚。</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                <X className="w-6 h-6 text-white/20 group-hover:text-white/50" />
             </button>
        </div>

        <div className="flex-1 px-8 py-6 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
             <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest border-l-2 border-white/10 pl-3">目前说明</h3>
             <p className="text-[14px] text-white/70 leading-relaxed">
               目前还处于 Offer 沟通阶段，尚不等于正式获得 Offer。建议先确认薪资、岗位、地点、入职时间和回复截止日期，等正式确认后再更新为“已获得 Offer”。
             </p>
          </div>

          <div className="space-y-4">
             <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest border-l-2 border-white/10 pl-3">沟通细节</h3>
             <ul className="space-y-3">
                {[
                  "确认这是否是正式 Offer，还是口头意向 / 审批中。",
                  "记录薪资、地点、岗位职责、入职时间和回复截止日期。",
                  "如果还有其他流程在进行，可以暂时保持“Offer 沟通中”，不要急着归档。",
                  "正式确认后，再将状态更新为“已获得 Offer”。"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-[14px] text-white/50 leading-relaxed font-medium">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-1.5 shrink-0" />
                     {item}
                  </li>
                ))}
             </ul>
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl">
             <div className="space-y-1">
                <div className="text-[11px] font-black text-white/20 uppercase tracking-widest">公司</div>
                <div className="text-[14px] text-white/60 font-bold">{attempt.company}</div>
             </div>
             <div className="space-y-1 border-l border-white/10 pl-5">
                <div className="text-[11px] font-black text-white/20 uppercase tracking-widest">岗位</div>
                <div className="text-[14px] text-white/60 font-bold">{attempt.role}</div>
             </div>
          </div>
        </div>

        <div className="flex-shrink-0 px-8 py-6 border-t border-white/5 grid grid-cols-2 gap-4">
             <Button variant="ghost" className="w-full h-11 bg-white/5 hover:bg-white/10 text-white/60 text-[14px]" onClick={onClose}>返回花园</Button>
             <Button className="w-full h-11 bg-white hover:bg-white/90 text-neutral-900 font-bold border-0 shadow-lg text-[14px]" onClick={onUpdate}>更新记录</Button>
        </div>
      </motion.div>
    </div>
  );
}

function WaitingAdviceModal({ attempt, onClose, onUpdate }: { attempt: Attempt, onClose: () => void, onUpdate: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-[min(480px,92vw)] bg-[#11141a] border border-white/10 rounded-[32px] overflow-hidden relative z-10 shadow-2xl flex flex-col"
        style={{ maxHeight: '82vh' }}
      >
        <div className="flex-shrink-0 px-8 py-6 border-b border-white/5 flex justify-between items-start">
             <div className="space-y-2">
                <div className="flex items-center gap-3 text-blue-400 mb-1">
                   <div className="p-3 bg-blue-500/10 rounded-2xl">
                      <Clock className="w-7 h-7" />
                   </div>
                   <h2 className="text-xl font-bold tracking-tight text-white/90">等待建议</h2>
                </div>
                <p className="text-blue-400/60 text-[13px] font-medium leading-relaxed tracking-wide">这次还没有明确反馈，先别急着把沉默翻译成失败。</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                <X className="w-6 h-6 text-white/20 group-hover:text-white/50" />
             </button>
        </div>

        <div className="flex-1 px-8 py-6 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest border-l-2 border-white/10 pl-3">说明</h3>
            <p className="text-[14px] text-white/70 leading-relaxed">
              目前还没有拒信、筛选反馈或面试结果，因此系统暂时不做失败归因。你可以先检查简历与岗位关键词的匹配度，并在合适时间准备后续跟进。
            </p>
          </div>

          <div className="space-y-4">
             <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest border-l-2 border-white/10 pl-3">建议</h3>
             <ul className="space-y-3">
                {[
                  "检查岗位详情 / 要求中的核心关键词是否出现在简历材料中。",
                  "准备同类岗位的下一轮投递，不要把情绪全部压在一个无回应结果上。",
                  "如果已经等待较久，可以记录一次跟进提醒。"
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-[14px] text-white/50 leading-relaxed font-medium">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40 mt-1.5 shrink-0" />
                     {item}
                  </li>
                ))}
             </ul>
          </div>

          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl space-y-2">
             <div className="text-[11px] font-black text-white/20 uppercase tracking-widest">当前心情</div>
             <div className="text-[14px] text-white/60 font-bold">{getMoodLabel(attempt.mood)}</div>
          </div>
        </div>

        <div className="flex-shrink-0 px-8 py-6 border-t border-white/5 grid grid-cols-2 gap-4">
             <Button variant="ghost" className="w-full h-11 bg-white/5 hover:bg-white/10 text-white/60 text-[14px]" onClick={onClose}>返回花园</Button>
             <Button className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold border-0 shadow-lg shadow-blue-500/20 text-[14px]" onClick={onUpdate}>更新记录</Button>
        </div>
      </motion.div>
    </div>
  );
}

function TestAdviceModal({ attempt, onClose }: { attempt: Attempt, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-[min(480px,92vw)] bg-[#11141a] border border-white/10 rounded-[32px] overflow-hidden relative z-10 shadow-2xl flex flex-col"
        style={{ maxHeight: '82vh' }}
      >
        <div className="flex-shrink-0 px-8 py-6 border-b border-white/5 flex justify-between items-start">
             <div className="space-y-2">
                <div className="flex items-center gap-3 text-purple-400 mb-1">
                   <div className="p-3 bg-purple-500/10 rounded-2xl">
                      <Sparkles className="w-7 h-7" />
                   </div>
                   <h2 className="text-xl font-bold tracking-tight text-white/90">测评准备建议</h2>
                </div>
                <p className="text-purple-400/60 text-[13px] font-medium leading-relaxed">这一步通常考察基础能力、稳定性和岗位匹配度。先把节奏稳住。</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                <X className="w-6 h-6 text-white/20 group-hover:text-white/50" />
             </button>
        </div>

        <div className="flex-1 px-8 py-6 space-y-8 overflow-y-auto custom-scrollbar">
           <div className="p-5 bg-purple-500/5 border border-purple-500/10 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-[14px] font-bold text-white/90">针对 {attempt.company} 的建议</h4>
                <p className="text-[13px] text-white/50 leading-relaxed font-medium">
                  根据你记录的岗位信息和当前阶段，建议先确认测评类型，并围绕岗位要求准备对应题型。重点不是盲目刷题，而是把时间用在最可能出现的能力项上。
                </p>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest border-l-2 border-white/10 pl-3">核心准备项</h3>
              <div className="space-y-5">
                {[
                  { title: "确认测评类型", content: "先查看邮件或平台说明，判断是性格测评、逻辑测评、语言测评、编程题、数据分析题，还是综合测评。" },
                  { title: "对齐岗位能力", content: "根据 JD 中的关键词，优先准备最相关的能力项，例如编程基础、数据分析、产品思维、逻辑推理、沟通协作或业务理解。" },
                  { title: "做一次限时练习", content: "不要只看题，要模拟真实时间限制，提前适应节奏。" },
                  { title: "准备稳定环境", content: "提前检查网络、浏览器、摄像头、麦克风、输入法和安静环境。" },
                  { title: "保持答案一致性", content: "如果是性格或情景判断题，保持真实、稳定、一致，不要为了“讨好公司”前后矛盾。" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-[11px] font-bold text-purple-400 shrink-0 mt-1">
                      {i + 1}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[14px] font-bold text-white/80">{item.title}</p>
                      <p className="text-[13px] text-white/40 leading-relaxed font-medium">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="flex-shrink-0 px-8 py-6 border-t border-white/5">
          <Button className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-bold border-0 shadow-lg shadow-purple-500/20" onClick={onClose}>
            收到，去准备
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function InterviewAdviceModal({ attempt, onClose }: { attempt: Attempt, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-[min(480px,92vw)] bg-[#11141a] border border-white/10 rounded-[32px] overflow-hidden relative z-10 shadow-2xl flex flex-col"
        style={{ maxHeight: '82vh' }}
      >
        <div className="flex-shrink-0 px-8 py-6 border-b border-white/5 flex justify-between items-start">
             <div className="space-y-2">
                <div className="flex items-center gap-3 text-purple-400 mb-1">
                   <div className="p-3 bg-purple-500/10 rounded-2xl">
                      <Sparkles className="w-7 h-7" />
                   </div>
                   <h2 className="text-xl font-bold tracking-tight text-white/90">面试准备建议</h2>
                </div>
                <p className="text-purple-400/60 text-[13px] font-medium leading-relaxed tracking-wide">你的简历被看见了。接下来的准备将帮助你更好应对挑战。</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                <X className="w-6 h-6 text-white/20 group-hover:text-white/50" />
             </button>
        </div>

        <div className="flex-1 px-8 py-6 space-y-8 overflow-y-auto custom-scrollbar">
           <div className="p-5 bg-purple-500/5 border border-purple-500/10 rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-purple-500/10 rounded-xl mt-0.5">
                <Info className="w-4 h-4 text-purple-400 shrink-0" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[14px] font-bold text-white/90">针对 {attempt.company} 的建议</h4>
                <p className="text-[13px] text-white/50 leading-relaxed font-medium">
                  根据你记录的 JD 关键词，面试官可能会重点考察你对“系统稳定性”和“跨端性能优化”的理解。
                </p>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest border-l-2 border-white/10 pl-3">核心准备项</h3>
              <div className="space-y-5">
                {[
                  "准备 3 个能够体现你解决复杂问题能力的 STAR 故事。",
                  "复盘项目中最核心的技术难点，写下至少 3 个深挖的问题及答案。",
                  "对公司业务进行基础调研，思考你所在的岗位如何为业务创造价值。",
                  "准备 2-3 个高质量的、用于在面试结尾向面试官提问的问题。"
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-[11px] font-bold text-purple-400 shrink-0 mt-1">
                      {i + 1}
                    </div>
                    <p className="text-[14px] text-white/60 leading-relaxed font-medium">{item}</p>
                  </div>
                ))}
              </div>
           </div>
        </div>

        <div className="flex-shrink-0 px-8 py-6 border-t border-white/5">
          <Button className="w-full h-11 bg-purple-600 hover:bg-purple-500 text-white font-bold border-0 shadow-lg shadow-purple-500/20" onClick={onClose}>
            收到，去准备
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function MilestoneModal({ attempt, onClose, onUpdate }: { attempt: Attempt, onClose: () => void, onUpdate: () => void }) {
  const { attempts } = useAppContext();
  const offerAttempts = useMemo(() => 
    attempts
      .filter(a => a.status === 'offer_received' || a.status === 'offer')
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || a.updatedAt).getTime();
        const timeB = new Date(b.createdAt || b.updatedAt).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return a.id.localeCompare(b.id); // Stable sort fallback
      })
  , [attempts]);
  
  const offerIndex = offerAttempts.findIndex(a => a.id === attempt.id);
  const offerCount = offerIndex !== -1 ? offerIndex + 1 : offerAttempts.length + 1;

  const getOfferConfig = (count: number) => {
    if (count === 1) {
      return {
        title: '第 1 个 Offer',
        subtitle: '第一束清晰的回响，终于抵达。',
        message: '经历过漫长的等待、修改和不确定，这一刻说明你的努力已经被看见。先收下这份肯定，再慢慢判断它是不是你真正想去的方向。',
        actions: [
          '记录 Offer 信息、回复截止日期和岗位细节。',
          '整理薪资、城市、团队、成长空间等关键因素。',
          '给自己一点庆祝时间，这一步值得被记住。'
        ],
        hasBadge: true
      };
    } else if (count === 2) {
      return {
        title: '第 2 个 Offer',
        subtitle: '第二份回应到来，说明这不是偶然。',
        message: '当 Offer 再次出现，你拥有的不只是一次好运，而是被持续确认的能力。现在可以少一点慌张，多一点选择的底气。',
        actions: [
          '对比两个 Offer 的岗位内容、团队氛围和长期发展。',
          '列出你最在意的 3 个选择标准。',
          '不要急着只看结果，先判断哪一份更适合未来的你。'
        ],
        hasBadge: false
      };
    } else if (count === 3) {
      return {
        title: '第 3 个 Offer',
        subtitle: '回应开始重复出现，你正在走进自己的节奏。',
        message: '第三个 Offer 不是简单的数字增加，而是在提醒你：你已经不只是被动等待机会的人，也开始拥有筛选机会的能力。',
        actions: [
          '把所有 Offer 放在同一张表里，比较薪资、职责、成长性和风险。',
          '回看最初的求职目标，判断哪一份最接近你的长期方向。',
          '准备好和 HR 沟通时间线，避免因为犹豫错过关键截止日期。'
        ],
        hasBadge: false
      };
    } else {
      return {
        title: `第 ${count} 个 Offer`,
        subtitle: '更多回应正在到来，你也更有底气做选择。',
        message: '当机会不止一次出现，真正重要的就不只是拿到结果，而是学会判断哪条路更适合自己。你已经走到了可以认真选择的位置。',
        actions: [
          '统一整理所有 Offer 的关键信息，避免凭感觉做决定。',
          '明确自己当前最看重的是成长、稳定、城市、薪资还是团队。',
          '给每个选择设置回复时间提醒，保持主动权。'
        ],
        hasBadge: false
      };
    }
  };

  const config = getOfferConfig(offerCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-[min(480px,92vw)] bg-[#11141a] border border-white/10 rounded-[32px] overflow-hidden relative z-10 shadow-2xl flex flex-col"
        style={{ maxHeight: '82vh' }}
      >
        <div className="flex-shrink-0 px-8 py-6 border-b border-white/5 flex justify-between items-start">
             <div className="space-y-2">
                <div className="flex items-center gap-3 text-emerald-400 mb-1">
                   <div className="p-3 bg-emerald-500/10 rounded-2xl">
                      <Award className="w-7 h-7" />
                   </div>
                   <h2 className="text-xl font-bold tracking-tight text-white/90">里程碑：{config.title}</h2>
                </div>
                <p className="text-emerald-400/60 text-[13px] font-medium leading-relaxed">{config.subtitle}</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                <X className="w-6 h-6 text-white/20 group-hover:text-white/50" />
             </button>
        </div>

        <div className="flex-1 px-8 py-6 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6 p-7 bg-white/[0.02] border border-white/5 rounded-[28px]">
             <div className="space-y-1.5">
                <div className="text-[11px] uppercase font-black text-white/20 tracking-widest leading-none mb-1.5">公司 / 岗位</div>
                <div className="text-lg font-bold text-white/95">{attempt.company}</div>
                <div className="text-sm text-white/40 font-medium">{attempt.role}</div>
             </div>
             <div className="space-y-1.5 border-l border-white/10 pl-7">
                <div className="text-[11px] uppercase font-black text-white/20 tracking-widest leading-none mb-1.5">当前状态</div>
                <div className="text-lg font-bold text-emerald-400">已获得 Offer</div>
                <div className="text-sm text-white/40 font-medium font-sans">待进一步确认</div>
             </div>
          </div>

          <div className="space-y-8">
             <div className="space-y-4">
                <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                   <Target className="w-3.5 h-3.5" /> 本次奖励
                </h3>
                <div className="flex flex-wrap gap-3">
                   <div className="px-4 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2 shadow-sm">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-[13px] font-bold">+10 勇气值</span>
                   </div>
                   {config.hasBadge && (
                     <div className="px-4 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-2 shadow-sm">
                        <Award className="w-4 h-4" />
                        <span className="text-[13px] font-bold">解锁徽章：🌸 行至花信</span>
                     </div>
                   )}
                </div>
             </div>

             <div className="space-y-3">
                <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest border-l-2 border-white/10 pl-3">给此刻的你</h3>
                <p className="text-[14px] text-white/70 italic font-light leading-relaxed">
                   {config.message}
                </p>
             </div>

             <div className="space-y-3">
                <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest border-l-2 border-white/10 pl-3">下一步行动建议</h3>
                <ul className="space-y-2">
                   {config.actions.map((item, i) => (
                     <li key={i} className="flex gap-3 text-[14px] text-white/50 leading-relaxed font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-1.5 shrink-0" />
                        {item}
                     </li>
                   ))}
                </ul>
             </div>
          </div>
        </div>

        <div className="flex-shrink-0 px-8 py-6 border-t border-white/5 grid grid-cols-2 gap-4">
             <Button variant="ghost" className="w-full h-11 bg-white/5 hover:bg-white/10 text-white/60 text-[14px]" onClick={onClose}>返回花园</Button>
             <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold border-0 shadow-lg shadow-emerald-500/10 text-[14px]" onClick={onUpdate}>更新 Offer 细节</Button>
        </div>
      </motion.div>
    </div>
  );
}

function OfferResultModal({ attempt, onClose, onUpdate }: { attempt: Attempt, onClose: () => void, onUpdate: () => void }) {
  const events = attempt.timeline || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-[min(480px,92vw)] bg-[#11141a] border border-white/10 rounded-[32px] overflow-hidden relative z-10 shadow-2xl flex flex-col"
        style={{ maxHeight: '82vh' }}
      >
        <div className="flex-shrink-0 px-8 py-6 border-b border-white/5 flex justify-between items-start">
             <div className="space-y-2">
                <div className="flex items-center gap-3 text-white/40 mb-1">
                   <div className="p-3 bg-white/5 rounded-2xl">
                      <Target className="w-7 h-7" />
                   </div>
                   <h2 className="text-xl font-bold tracking-tight text-white/90">Offer 结果：已拒绝</h2>
                </div>
                <p className="text-white/30 text-[13px] font-medium leading-relaxed tracking-wide">一次深思熟虑的主动选择。</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                <X className="w-6 h-6 text-white/20 group-hover:text-white/50" />
             </button>
        </div>

        <div className="flex-1 px-8 py-6 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6 p-7 bg-white/[0.02] border border-white/5 rounded-[28px]">
             <div className="space-y-1.5">
                <div className="text-[11px] uppercase font-black text-white/20 tracking-widest leading-none mb-1.5">公司 / 岗位</div>
                <div className="text-lg font-bold text-white/95">{attempt.company}</div>
                <div className="text-sm text-white/40 font-medium">{attempt.role}</div>
             </div>
             <div className="space-y-1.5 border-l border-white/10 pl-7">
                <div className="text-[11px] uppercase font-black text-white/20 tracking-widest leading-none mb-1.5">当前状态</div>
                <div className="text-lg font-bold text-white/40">已拒绝 Offer</div>
                <div className="text-sm text-white/20 font-medium font-sans">
                  {attempt.notes ? (
                    <span className="italic">原因：{attempt.notes}</span>
                  ) : '未记录拒绝原因'}
                </div>
             </div>
          </div>

          <div className="space-y-8">
             <div className="space-y-3">
                <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest border-l-2 border-white/10 pl-3">经历说明</h3>
                <p className="text-[14px] text-white/70 italic font-light leading-relaxed">
                   这次 Offer 没有成为最终选择，但它仍然证明你走到了结果阶段。拒绝一个不适合的 Offer，也是一种主动选择。
                </p>
             </div>

             <div className="space-y-3">
                <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest border-l-2 border-white/10 pl-3">后续建议</h3>
                <ul className="space-y-2">
                   {[
                     "记录你拒绝它的原因，例如岗位方向、地点、薪资或长期发展。",
                     "复盘这次流程中有效的投递和面试经验。",
                     "把可复用的经验带到下一次机会里。"
                   ].map((item, i) => (
                     <li key={i} className="flex gap-3 text-[14px] text-white/50 leading-relaxed font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5 shrink-0" />
                        {item}
                     </li>
                   ))}
                </ul>
             </div>

             <div className="space-y-4">
               <h3 className="text-[11px] font-black text-white/20 uppercase tracking-widest border-l-2 border-white/10 pl-3">结果记录</h3>
               <div className="relative py-2 ml-2">
                  <div className="absolute left-[7px] top-4 bottom-4 w-px bg-white/5" />
                  <div className="space-y-4">
                     <div className="flex gap-4 items-start relative">
                        <div className="mt-1 w-[15px] h-[15px] rounded-full border-2 border-[#11141a] bg-indigo-500 z-10" />
                        <div className="space-y-0.5">
                           <div className="text-[9px] uppercase font-black text-white/15 tracking-widest">{new Date(attempt.updatedAt).toLocaleDateString()}</div>
                           <div className="text-[12px] font-bold text-white/80">已拒绝 Offer</div>
                        </div>
                     </div>
                  </div>
               </div>
             </div>
          </div>
        </div>

        <div className="flex-shrink-0 px-8 py-6 border-t border-white/5 grid grid-cols-2 gap-4">
             <Button variant="ghost" className="w-full h-11 bg-white/5 hover:bg-white/10 text-white/60 text-[14px]" onClick={onClose}>返回花园</Button>
             <Button className="w-full h-11 bg-white hover:bg-white/90 text-neutral-900 font-bold border-0 shadow-lg text-[14px]" onClick={onUpdate}>更新记录</Button>
        </div>
      </motion.div>
    </div>
  );
}

function SimpleModal({ title, description, confirmLabel, cancelLabel,onConfirm, onClose, isDanger = false }: any) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-[#1A1D24] border border-white/10 rounded-3xl p-8 relative z-10 shadow-3xl text-center space-y-6"
      >
        <div className="space-y-2">
           <h3 className={`text-xl font-bold ${isDanger ? 'text-red-400' : 'text-white/90'}`}>{title}</h3>
           <p className="text-sm text-white/40 leading-relaxed font-medium px-2">{description}</p>
        </div>
        <div className="flex flex-col gap-2 pt-2">
           <Button 
             className={`w-full font-bold ${isDanger ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'} border-0`}
             onClick={onConfirm}
           >
             {confirmLabel}
           </Button>
           {cancelLabel && (
             <Button variant="ghost" className="w-full text-white/30 hover:text-white/60 font-bold" onClick={onClose}>
               {cancelLabel}
             </Button>
           )}
        </div>
      </motion.div>
    </div>
  );
}

function TimelineModal({ attempt, onClose, onGarden }: { attempt: Attempt, onClose: () => void, onGarden: () => void }) {
  const events = attempt.timeline || [];
  
  const isPositiveResult = attempt.status === 'offer_received';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-[min(480px,92vw)] bg-[#11141a] border border-white/10 rounded-[32px] overflow-hidden relative z-10 shadow-2xl flex flex-col"
        style={{ maxHeight: '82vh' }}
      >
        <div className="flex-shrink-0 px-8 py-6 border-b border-white/5 flex justify-between items-start">
           <div className="space-y-2">
              <h2 className="text-xl font-bold text-white/90 tracking-tight">本次投递全流程回顾</h2>
              <p className="text-[13px] text-white/30 font-medium tracking-wide">回看这一路走过的节点，每一步都算数。</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
              <X className="w-6 h-6 text-white/20 group-hover:text-white/50" />
           </button>
        </div>

        <div className="flex-1 px-8 py-6 space-y-8 overflow-y-auto custom-scrollbar">
           <div className="relative py-4">
              {/* Timeline Line */}
              <div className="absolute left-[11px] top-6 bottom-6 w-px bg-white/5" />
              
              <div className="space-y-6">
                 {events.length > 0 ? events.map((event, idx) => {
                   const isLast = idx === events.length - 1;

                   return (
                    <div key={idx} className="flex gap-6 items-start relative group">
                       <div className={`mt-1.5 w-[22px] h-[22px] rounded-full border-4 border-[#11141a] flex items-center justify-center shrink-0 z-10 transition-colors ${
                         isLast ? 'bg-indigo-500 ring-4 ring-indigo-500/20' : 'bg-white/10'
                       }`} />
                       <div className="space-y-1">
                          <div className="text-[10px] uppercase font-black text-white/20 tracking-widest">{new Date(event.date).toLocaleDateString()}</div>
                          <div className={`text-[14px] font-bold ${isLast ? 'text-white/90' : 'text-white/60'}`}>
                            {formatHistoryItem(event)}
                          </div>
                       </div>
                    </div>
                 )}) : (
                   <div className="text-center py-8 text-white/20 text-[10px] uppercase font-bold tracking-widest">暂无详细节点数据</div>
                 )}
              </div>
           </div>

           <div className="p-5 bg-white/[0.02] border border-white/5 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-300/60">
                 <Sparkles className="w-3.5 h-3.5" />
                 <span className="text-[10px] font-black uppercase tracking-widest">给此刻的你</span>
              </div>
              <p className="text-[14px] text-white/50 leading-relaxed font-medium italic">
                 {isPositiveResult 
                   ? "从投递到结果，你已经走完了一段完整旅程。恭喜你收获阶段性的回应，也别忘了为一路坚持下来的自己鼓掌。"
                   : "这次流程也许停在了这里，但你走过的每一步都已经变成了经验。花不会在每一次风里都盛开，但根系会因此更稳。"
                 }
              </p>
           </div>
        </div>

        <div className="flex-shrink-0 px-8 py-6 border-t border-white/5 grid grid-cols-2 gap-4">
           <Button variant="ghost" className="w-full h-11 bg-white/5 hover:bg-white/10 text-white/60 text-[14px]" onClick={onClose}>返回</Button>
           <Button variant="secondary" className="w-full font-bold h-11 rounded-[20px] text-[14px]" onClick={onGarden}>收进我的花园</Button>
        </div>
      </motion.div>
    </div>
  );
}

function GuidanceModal({ attempt, onClose }: { attempt: Attempt, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-[min(480px,92vw)] bg-[#11141a] border border-white/10 rounded-[32px] overflow-hidden relative z-10 shadow-2xl flex flex-col"
        style={{ maxHeight: '82vh' }}
      >
        <div className="flex-shrink-0 px-8 py-6 border-b border-white/5 flex justify-between items-start">
             <div className="space-y-1">
                <div className="flex items-center gap-2 text-purple-400 mb-2">
                   <Sparkles className="w-6 h-6" />
                   <h2 className="text-xl font-bold tracking-tight">面试准备建议</h2>
                </div>
                <p className="text-purple-400/60 text-[13px] font-medium">你的简历被看见了。接下来的准备将帮助你更好应对挑战。</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
                <X className="w-6 h-6 text-white/30 group-hover:text-white/60" />
             </button>
        </div>

        <div className="flex-1 px-8 py-6 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
             <div className="flex items-center gap-2 text-indigo-300">
                <Info className="w-4 h-4" />
                <span className="text-[14px] font-bold">针对 {attempt.company} 的建议</span>
             </div>
             <p className="text-[14px] text-white/70 leading-relaxed font-light">
                根据你记录的 JD 关键词，面试官可能会重点考察你对“系统稳定性”和“跨端性能优化”的理解。
             </p>
          </div>

          <div className="space-y-4">
             <div className="space-y-2">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">核心准备项</h3>
                <ul className="space-y-3">
                   {[
                     "准备 3 个能够体现你解决复杂问题能力的 STAR 故事。",
                     "复盘项目中最核心的技术难点，写下至少 3 个深挖的问题及答案。",
                     "对公司业务进行基础调研，思考你所在的岗位如何为业务创造价值。",
                     "准备 2-3 个高质量的、用于在面试结尾向面试官提问的问题。"
                   ].map((item, i) => (
                     <li key={i} className="flex gap-3 text-[14px] text-white/60 leading-relaxed">
                        <div className="w-4 h-4 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                           <span className="text-[8px] font-bold text-purple-300">{i + 1}</span>
                        </div>
                        {item}
                     </li>
                   ))}
                </ul>
             </div>
          </div>
        </div>

        <div className="flex-shrink-0 px-8 py-6 border-t border-white/5 flex gap-4">
             <Button variant="ghost" className="w-full bg-white/5 hover:bg-white/10 h-11 text-[14px]" onClick={onClose}>收到，去准备</Button>
        </div>
      </motion.div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string, value: number }) {
  return (
    <div className="p-6 rounded-[28px] border border-white/5 bg-white/[0.02] flex flex-col justify-center gap-1.5">
      <div className="text-2xl font-black text-white/80 tracking-tight leading-none">
        {value}
      </div>
      <div className="text-[9px] uppercase font-black tracking-widest text-white/20 leading-none">
        {label}
      </div>
    </div>
  );
}

function BadgeUnlockModal({ badge, onClose }: { badge: AchievementBadge, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 40 }}
        className="w-[min(400px,90vw)] bg-[#11141a]/80 border border-white/10 rounded-[40px] overflow-hidden relative z-10 shadow-2xl flex flex-col p-8 items-center text-center"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        
        <div className="mt-6 mb-8 relative">
           <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150" />
           <motion.div 
             animate={{ 
               rotateY: [0, 10, -10, 0],
               y: [0, -5, 0]
             }}
             transition={{ 
               duration: 6, 
               repeat: Infinity, 
               ease: "easeInOut" 
             }}
             className="relative z-10 w-28 h-28 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md"
           >
              <span className="text-5xl">{badge.icon}</span>
           </motion.div>
           <motion.div 
             initial={{ opacity: 0, scale: 0 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: 0.3 }}
             className="absolute -top-2 -right-2 p-2 bg-indigo-500 rounded-full shadow-lg"
           >
              <Award className="w-5 h-5 text-white" />
           </motion.div>
        </div>

        <div className="space-y-4 mb-10 relative z-10">
           <div className="space-y-1">
              <h3 className="text-indigo-400 text-[10px] uppercase font-black tracking-[0.4em]">Milestone Unlocked</h3>
              <h2 className="text-2xl font-black text-white px-4">你解锁了「{badge.title}」</h2>
           </div>
           <p className="text-white/40 text-[14px] font-medium leading-relaxed max-w-[280px]">
              {badge.description}
           </p>
        </div>

        <div className="w-full space-y-3 relative z-10">
           <Button 
             className="w-full h-14 bg-white hover:bg-white/90 text-neutral-900 font-bold rounded-3xl border-0 shadow-xl text-base"
             onClick={onClose}
           >
             收下这枚徽章
           </Button>
           <Button 
             variant="ghost" 
             className="w-full h-12 text-white/40 hover:text-white/60 text-sm font-medium"
             onClick={onClose}
           >
             返回花园
           </Button>
        </div>
        
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none overflow-hidden h-full flex items-center justify-center">
           <Sparkles className="w-full h-full text-indigo-500/5 rotate-12 scale-150" />
        </div>
      </motion.div>
    </div>
  );
}

