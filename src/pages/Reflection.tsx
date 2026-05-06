import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, CheckCircle2, AlertTriangle, Lightbulb, HeartPulse, Clock, Award } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AtmosphereBackground } from '../components/AtmosphereBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { useAppContext } from '../context/AppContext';
import { getStatusLabel, getMoodLabel } from '../lib/utils';
import { Attempt, ReflectionData, AttemptStatus } from '../types';

export function Reflection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const { getAttempt, updateAttempt, saveReflection } = useAppContext();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);

  const FAILURE_STATUSES: AttemptStatus[] = [
    'resume_screen_failed', 'test_failed', 'group_interview_failed',
    'first_interview_failed', 'second_interview_failed', 'third_interview_failed'
  ];
  const isFailureState = attempt ? FAILURE_STATUSES.includes(attempt.status) : false;

  useEffect(() => {
    if (!id) {
      navigate('/garden');
      return;
    }
    const data = getAttempt(id);
    if (!data) {
      navigate('/garden');
      return;
    }
    
    const regenerate = searchParams.get('regenerate') === 'true';

    // Check if we already have a reflection for THIS status
    const hasCurrentReflection = !!data.reflection && data.reflection.sourceStatus === data.status;

    // Generate if it's a failure status and (it doesn't have a reflection OR we want to regenerate OR status mismatch)
    if (FAILURE_STATUSES.includes(data.status) && (!hasCurrentReflection || regenerate)) {
      setAttempt(data);
      setLoading(true);
      const timer = setTimeout(() => {
        const mockReflection = generateMockReflection(data);
        mockReflection.sourceStatus = data.status;
        setAttempt(prev => prev ? { ...prev, reflection: mockReflection } : null);
        setLoading(false);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setAttempt(data);
      setLoading(false);
    }
  }, [id, getAttempt, navigate, searchParams]);

  const handleClaim = () => {
    if (attempt && attempt.reflection) {
      saveReflection(attempt.id, attempt.reflection);
      navigate('/garden?fromReflection=true');
    }
  };

  if (!attempt) return null;

  // Fallback for non-failure states without reflection
  if (!isFailureState && !attempt.reflection) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
          <Clock className="w-8 h-8 text-white/20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">暂无复盘结果</h2>
          <p className="text-white/40 max-w-sm mx-auto">这次尝试目前还没有可以复盘的结果。等收到反馈后，你可以回到这条记录更新状态。</p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => navigate('/garden')}>返回我的成长花园</Button>
          <Button onClick={() => navigate(`/record?id=${attempt.id}`)}>更新结果</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5], rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-indigo-400" />
        </motion.div>
        <p className="text-white/60 text-lg animate-pulse">AI 正在为你查阅 JD 与简历，生成复盘报告...</p>
      </div>
    );
  }

  const { reflection } = attempt;
  if (!reflection) return null;

  const isViewMode = attempt.reflection?.couragePointEarned;

  const getHeaderIcon = () => {
    return <SproutIcon className="w-8 h-8 text-indigo-400" />;
  };

  const getHeaderTitle = () => {
    return "我的成长复盘";
  };

  const getHeaderDesc = () => {
    return "请收下这份专属反馈，为下一次出发积蓄力量。";
  };

  const getCPValue = () => {
    const highValueStatuses: AttemptStatus[] = [
      'group_interview_failed', 'first_interview_failed', 'second_interview_failed', 
      'third_interview_failed'
    ];
    if (highValueStatuses.includes(attempt.status)) return 2;
    return 1;
  };

  return (
    <div className="relative min-h-screen bg-[#050711] overflow-x-hidden">
      {/* Background Atmosphere */}
      <AtmosphereBackground density={0.8} variant="rich" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" className="p-0 h-auto hover:bg-transparent -ml-2 mr-2" onClick={() => navigate('/garden')}>
                <ArrowLeft className="w-5 h-5 text-white/40" />
              </Button>
              {getHeaderIcon()}
              <h1 className="text-3xl font-bold tracking-tight text-white/95">{getHeaderTitle()}</h1>
            </div>
            <p className="text-white/40 font-medium">{getHeaderDesc()}</p>
          </div>
        <div className="text-right">
          {!isViewMode ? (
             <motion.div 
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full border border-indigo-500/30"
             >
               <Sparkles className="w-4 h-4" />
               <span className="font-semibold">+{getCPValue()} Courage Points</span>
             </motion.div>
          ) : (
             <div className="inline-flex items-center gap-2 bg-white/5 text-white/40 px-4 py-2 rounded-full border border-white/10">
               <CheckCircle2 className="w-4 h-4" />
               <span className="font-medium">已记入花园</span>
             </div>
          )}
        </div>
      </div>

      <Card className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 text-sm">
            <Badge label="公司" value={attempt.company} />
            <Badge label="岗位" value={attempt.role} />
            <Badge label="结果" value={getStatusLabel(attempt.status)} />
            {attempt.mood && <Badge label="当时心情" value={getMoodLabel(attempt.mood)} />}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-red-500/10 bg-red-500/[0.02]">
          <CardHeader>
            <CardTitle className=" flex items-center gap-2 text-red-200/90 text-base">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              可能原因分析
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {reflection.mainReason.map((reason, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/70 leading-relaxed">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400/50 mt-1.5 shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-indigo-500/10 bg-indigo-500/[0.02]">
          <CardHeader>
            <CardTitle className=" flex items-center gap-2 text-indigo-200/90 text-base">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              客观证据支持
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/60 leading-relaxed">
              {reflection.evidence}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-500/10 bg-emerald-500/[0.02]">
        <CardHeader>
          <CardTitle className=" flex items-center gap-2 text-emerald-200/90 text-base">
            <Lightbulb className="w-4 h-4 text-emerald-400" />
            下一步行动建议
          </CardTitle>
          <CardDescription>具体、微小、可执行</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {reflection.nextActions.map((item, i) => (
              <li key={item.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                <CheckCircle2 className={`w-5 h-5 mt-0.5 shrink-0 ${item.completed ? 'text-emerald-500' : 'text-white/10'}`} />
                <span className={`text-sm leading-relaxed ${item.completed ? 'text-white/40 line-through' : 'text-white/80'}`}>{item.task}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-pink-500/10 bg-pink-500/[0.02]">
        <CardHeader>
          <CardTitle className=" flex items-center gap-2 text-pink-200/90 text-base">
            <HeartPulse className="w-5 h-5 text-pink-400" />
            给此刻的你
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-white/80 leading-relaxed font-light italic">
            {reflection.emotionalReframe}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-4 pt-10">
        {!isViewMode ? (
          <Button size="lg" onClick={handleClaim} className="gap-2 bg-indigo-500 hover:bg-indigo-600 text-white border-transparent shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            <SproutIcon className="w-4 h-4" />
            收下这次成长
          </Button>
        ) : (
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => navigate('/garden')} 
            className="gap-2 bg-white/[0.03] backdrop-blur-md border border-white/[0.1] text-white/80 hover:bg-white/[0.08] hover:text-white transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            返回我的成长花园
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={() => navigate(`/record?id=${id}`)} className="text-white/60">
          返回修改记录
        </Button>
      </div>
      </div>
    </div>
  );
}

function SproutIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </svg>
  );
}

function Badge({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-white/40 text-xs mb-1 uppercase tracking-wider">{label}</span>
      <span className="text-white/90 font-medium">{value}</span>
    </div>
  );
}

// Mock AI Logic based on inputs
const EMOTIONAL_POOL: Record<string, string[]> = {
  no_response: [
    "暂无回应不等于你被否定了。很多时候，它只是简历没有在几秒内把“我适合”讲清楚。先别急着怀疑人生，我们先把可见度拉高一点。´･ᴗ･`",
    "这次更像是“信号没被看见”，不是“你不够好”。下一步可以先把 JD 里的关键词和你的项目经历对齐，让系统和 HR 都更容易捕捉到你。",
    "没消息有时只是因为招聘流程太长，或者是简历被系统过滤了。换个时间投递，或者试试找人内推，也许种子就发芽了。",
    "不要在一个没有回响的山谷里独自焦虑。你的价值不需要由一份未读的回应来定义。我们继续打磨，去投向更广阔的荒野。"
  ],
  resume_screen_failed: [
    "简历筛选未通过通常是匹配度问题。这封拒信不是你的能力判决书，更像一次“匹配失败通知”。我们先看哪里能改。",
    "这次拒绝说明对方没有选择你，但不等于你没有价值。更现实的问题是：你的经历有没有足够快、足够准地击中这个岗位。",
    "筛选环节本就是概率游戏。与其在这一棵树上纠结，不如看看森林里还有哪些相似的机会。你的简历只是需要一点点微调。",
    "被筛选掉的瞬间很沮丧，但这也是一个修正方向的锚点。让我们看看 JD 里的高频词，是不是还没体现在你的简历首页？"
  ],
  test_failed: [
    "测评没过可能是在特定题型上还没找对感觉。难受可以难受一下，但别急着把它翻译成“我不行”。我们先看哪里能补。",
    "这次测评说明你还需要在特定领域加强练习。关键是把卡住的题型留下来，下次别让它原地复活。ಠ_ಠ",
    "测评是通往面试的演习。这次没通关，正好给了你查漏补缺的机会。把那些没思路的题目彻底弄懂，你就离终点更近了一步。",
    "每个大神都是从挂测评开始的。这次的失利只是因为你还没遇到那套属于你的题集。保持手感，坚持刷题，终会等到你的主场。"
  ],
  interview_failed: [
    "面试没过不代表你不会，只可能是你还没有把“我会”讲得足够具体。项目经历、表达顺序、例子细节，都还有可调整空间。",
    "面试失败的信息量其实很高，虽然痛，但很有用。它不是一句“你不行”，而是在提醒你：下一次需要把故事讲得更清楚。",
    "面试更像是一种双向的选择。这次没缘分，可能只是因为你的光亮和他们的频谱没对上。保持自信，去找那个懂你的人。",
    "复盘面试时的失误是痛快的修行。那些答不上来的瞬间，正是你认知升级的阶梯。下一次，你会表现得更像那个理想中的自己。"
  ],
  process_ended: [
    "流程结束了，但你的成长没有结束。这次尝试已经成为了你的一部分养料，请收下这份反馈，继续前行。",
    "每一段流程的终结，都是为了新流程的开启。别遗憾，你已经在这次长途跋涉中收集到了足够的经验值。",
    "花不会在每一次风里都盛开，但根系会因此更稳。这次虽然没到终点，但你留下的每一个脚印都算数。",
    "流程结束那一刻的失落感是真实的，但请别沉溺太久。你的花园需要新的种子，而你已经变得更强大了。"
  ],
  interview_invitation: [
    "好消息来了，这不是运气，这是你的材料终于被看见了。接下来别只开心三秒，我们把它变成一次更稳的准备。٩(ˊᗜˋ*)و",
    "面试邀请说明你已经越过第一道筛选。现在的重点不是焦虑“我会不会挂”，而是准备好“我为什么适合”。"
  ],
  offer_received: [
    "这是一朵花，但不一定是终点。你可以庆祝，也可以继续判断它是不是你真正想要的方向。无论如何，这次努力已经留下痕迹。🌸",
    "Offer 到手，先允许自己开心一下。它证明你不是一直在原地打转，你之前那些复盘、修改和继续投递，真的有走到这里。"
  ],
  offer_declined: [
    "拒绝一个不合适的 Offer，不是失败，而是一次主动选择。能走到结果阶段，已经说明你有被市场看见。",
    "这次你没有选择它，但这段流程仍然有效。它证明你能走到 Offer，也帮你更清楚什么不是你想要的。",
    "放弃不合适的机会，也是一种前进。不是所有花都要摘下，有些花只负责告诉你方向。"
  ],
  default: [
    "这颗种子已经收到了反馈。无论结果如何，它都会成为你的养料。🌱",
    "记录的意义在于让成长有迹可循。哪怕是一次微小的尝试，也值得被温柔对待。",
    "在逆风中发芽的种子，根系往往最深。请相信时间的力量，也请相信你自己的坚持。"
  ]
};

function generateMockReflection(attempt: Attempt): ReflectionData {
  let statusKey = attempt.status as string;
  const FAILED_ROUNDS = ['first_interview_failed', 'second_interview_failed', 'third_interview_failed', 'group_interview_failed'];
  if (FAILED_ROUNDS.includes(statusKey)) {
    statusKey = 'interview_failed';
  }

  const pool = EMOTIONAL_POOL[statusKey] || EMOTIONAL_POOL['default'];
  const translation = pool[Math.floor(Math.random() * pool.length)];

  // Basic keyword extraction for "realistic" mock logic
  const jd = (attempt.jdText || "").toLowerCase();
  const resume = (attempt.resumeSummary || "").toLowerCase();

  let mainReason = ["未能在一开始讲清楚核心价值。"];
  let evidence = "未记录明确的证据。";
  let nextActions = [
    { id: '1', task: "补充具体可量化的指标到简历中。", completed: false }
  ];

  if (statusKey === 'resume_screen_failed') {
    mainReason = ["简历结构不够突出核心能力", "与 JD 的硬性要求可能有差距"];
    evidence = "被拒通常是因为项目经历描述主要在罗列“做了什么”，而没有讲清楚“做成了什么”。";
    if (jd.includes('实习') && !resume.includes('实习')) {
      mainReason.push("缺乏相关实习背景支持");
      evidence = "JD 明确提到需要相关实习经历，建议挖掘校园项目中的协作细节来弥补。";
    }
    nextActions = [
      { id: '1', task: "使用 STAR 法则修改最近的两个项目经历，每个经历必须包含至少 1 个可衡量的数据结果。", completed: false },
      { id: '2', task: "如果技术栈或年限不匹配，在寻找新岗位时，优先投递成功概率更高的岗位。", completed: false }
    ];
  } else if (statusKey === 'test_failed') {
    mainReason = ["在部分特定测评题型上基础不够扎实", "时间分配不均"];
    evidence = "测评是由于熟练度不足，或者在紧张环境下未能应用正确的解题思路。";
    nextActions = [
      { id: '1', task: "将没做出来的题型归纳整理，找到其背后的基础知识点并专项突破。", completed: false },
      { id: '2', task: "在接下来的 3 天里，每天进行一次 60 分钟的限时刷题练习。", completed: false }
    ];
  } else if (statusKey === 'interview_failed') {
    mainReason = ["项目经历表达不够连贯", "技术深度回答未能解答面试官的具体质疑"];
    evidence = "面试中遇到了一些被追问多次的卡壳点，这意味着对方在测试你的思维边界。";
    if (jd.includes('原理') || jd.includes('底层')) {
      mainReason.push("底层原理掌握深度不足");
      evidence += " 岗位 JD 强调了对底层原理的追求，面试中关于这部分的回答可能略显单薄。";
    }
    nextActions = [
      { id: '1', task: "复盘面试中被追问的 3 个问题，用纸笔重新构建更完善的答案。", completed: false },
      { id: '2', task: "梳理 2 个能体现你解决难题和抗压能力的通用故事，并熟练口述。", completed: false }
    ];
  } else if (statusKey === 'process_ended') {
    mainReason = ["全流程的综合表现未能成为该岗位的最优解"];
    evidence = "能够走完流程已经证明了你的实力，最终的结果往往涉及更多匹配因素。";
    nextActions = [
      { id: '1', task: "回顾整个流程中自己准备最不充分的一环，制定针对性强化计划。", completed: false },
      { id: '2', task: "更新自己的求职策略：根据本次流程的反馈，缩小投递范围。", completed: false }
    ];
  }

  return {
    mainReason,
    evidence,
    nextActions,
    emotionalReframe: translation,
    couragePointEarned: false,
    generatedAt: new Date().toISOString(),
    sourceStatus: attempt.status
  };
}
