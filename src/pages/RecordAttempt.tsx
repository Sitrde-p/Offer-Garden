import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Target, Clock, Plus, Target as TargetIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { useAppContext } from '../context/AppContext';
import { ResumeUploader } from '../components/ResumeUploader';  // 添加上传PDF简历
import { getStatusLabel, getStageLabel, getMoodLabel, formatHistoryItem } from '../lib/utils';
import { Attempt, AttemptStatus, AttemptStage, Mood } from '../types';
import { motion } from 'motion/react';
import { AtmosphereBackground } from '../components/AtmosphereBackground';

const STAGE_OPTIONS: { label: string; value: AttemptStage }[] = [
  { label: '投递', value: 'application' },
  { label: '测评', value: 'test' },
  { label: '面试', value: 'interview' },
  { label: '结果', value: 'result' },
];

const STATUS_BY_STAGE: Record<AttemptStage, { label: string; value: AttemptStatus }[]> = {
  application: [
    { label: '已投递，待反馈', value: 'waiting_feedback' },
    { label: '投递后暂无回应', value: 'no_response' },
    { label: '简历初筛未通过', value: 'resume_screen_failed' },
  ],
  test: [
    { label: '收到测评邀请', value: 'test_invitation' },
    { label: '测评进行中', value: 'test_in_progress' },
    { label: '测评未通过', value: 'test_failed' },
  ],
  interview: [
    { label: '收到面试邀请', value: 'interview_invitation' },
    { label: '群面进行中', value: 'group_interview' as any },
    { label: '群面未通过', value: 'group_interview_failed' as any },
    { label: '一面进行中', value: 'first_interview' },
    { label: '一面未通过', value: 'first_interview_failed' },
    { label: '二面进行中', value: 'second_interview' },
    { label: '二面未通过', value: 'second_interview_failed' },
    { label: '三面进行中', value: 'third_interview' },
    { label: '三面未通过', value: 'third_interview_failed' },
  ],
  result: [
    { label: 'Offer 沟通中', value: 'offer_discussing' },
    { label: '已获得 Offer', value: 'offer_received' },
    { label: '已拒绝 Offer', value: 'offer_declined' },
    { label: '已结束流程', value: 'process_ended' },
  ],
};

const MOOD_OPTIONS: { label: string; value: Mood | string }[] = [
  { label: '平静', value: 'calm' },
  { label: '焦虑', value: 'anxious' },
  { label: '失落', value: 'disappointed' },
  { label: '麻木', value: 'numb' },
  { label: '紧张', value: 'tense' },
  { label: '激动', value: 'excited' },
  { label: '仍想继续', value: 'hopeful' },
];

export function RecordAttempt() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const { addAttempt, updateAttempt, getAttempt, deleteAttempt } = useAppContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [stage, setStage] = useState<AttemptStage>('application');
  const [status, setStatus] = useState<AttemptStatus>('waiting_feedback');
  const [jdText, setJdText] = useState('');
  const [resumeSummary, setResumeSummary] = useState(''); // PDF简历
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState<Mood | undefined>();
  const [notes, setNotes] = useState('');
  const [timeline, setTimeline] = useState<any[]>([]);
  // const [fileAttached, setFileAttached] = useState(false); // Simulated file upload
  const [errorMsg, setErrorMsg] = useState('');

  const isUpdateMode = !!editId;

  useEffect(() => {
    if (editId) {
      const existing = getAttempt(editId);
      if (existing) {
        setCompany(existing.company);
        setRole(existing.role);
        setStage(existing.stage || 'application');
        setStatus(existing.status);
        // set(existing. || '');
        // setJdText(existing.jdText || '');   // 添加这一行
        setResumeSummary(existing.resumeSummary || '');
        setDescription(existing.description || '');
        setMood(existing.mood);
        setNotes(existing.notes || '');
        setTimeline(existing.timeline || []);
      }
    }
  }, [editId, getAttempt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const missingFields: string[] = [];
    if (!company.trim()) missingFields.push('公司名称');
    if (!role.trim()) missingFields.push('岗位名称');
    if (!stage) missingFields.push('当前所处阶段');
    if (!status) missingFields.push('具体状态');
    if (!jdText.trim()) missingFields.push('岗位详情 / 要求');
    
    // Resume validation: Text OR Upload (mocked for now as fileAttached check)
    //if (!resumeSummary.trim() && !fileAttached) {
    if (!resumeSummary.trim()) {
      missingFields.push('简历材料');
    }

    if (missingFields.length > 0) {
      setErrorMsg(`请先完善必填信息：${missingFields.join('、')}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const attemptData: Partial<Attempt> = {
      company,
      role,
      stage,
      status,
      jdText,
      resumeSummary,
      description,
      mood,
      notes,
    };

    let targetId = editId;

    if (editId) {
      updateAttempt(editId, attemptData);
    } else {
      targetId = Math.random().toString(36).substring(2, 9);
      addAttempt({
        ...(attemptData as Attempt),
        id: targetId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    const FAILURE_STATUSES: AttemptStatus[] = [
      'resume_screen_failed', 'test_failed', 'group_interview_failed',
      'first_interview_failed', 'second_interview_failed', 'third_interview_failed'
    ];

    let shouldNavigateToReflection = false;
    if (FAILURE_STATUSES.includes(status)) {
      shouldNavigateToReflection = true;
    }

    if (shouldNavigateToReflection) {
      // If we are updating and it's a failure status, we always want to (re)generate
      navigate(`/reflection?id=${targetId}${isUpdateMode ? '&regenerate=true' : ''}`);
    } else {
      navigate('/garden');
    }
  };

  const handleDelete = () => {
    if (editId) {
      deleteAttempt(editId);
      navigate('/garden');
    }
  };

  const getSubmitButtonLabel = () => {
    if (isUpdateMode) return '确认更新记录';

    const SAVE_STATUSES: AttemptStatus[] = ['waiting_feedback', 'test_invitation', 'test_in_progress', 'test_completed', 'test_passed_waiting_interview', 'interview_invitation', 'first_interview', 'second_interview', 'third_interview', 'offer_discussing'];
    const REFLECTION_STATUSES: AttemptStatus[] = [
      'no_response', 'resume_screen_failed', 'test_failed', 'interview_failed',
      'first_interview_failed', 'second_interview_failed', 'third_interview_failed'
    ];

    if (status === 'process_ended') return '记录这次全流程回顾';
    if (REFLECTION_STATUSES.includes(status)) return '生成我的成长反馈';
    if (status === 'no_response') return '完成记录';
    if (status === 'offer_received') return '记录这个里程碑';
    if (status === 'offer_declined') return '记录结果';
    if (SAVE_STATUSES.includes(status)) return '保存这次尝试';
    return '保存';
  };

  const handleStageChange = (newStage: AttemptStage) => {
    setStage(newStage);
    setStatus(STATUS_BY_STAGE[newStage][0].value);
  };

  const getFeedbackConfig = () => {
    if (status === 'process_ended') return null;

    let title = '补充信息（可选）';
    let placeholder = '记录一下目前的进展或想法...';

    if (status === 'no_response') {
      title = '补充信息（可选）';
      placeholder = '可以写下投递时间、是否内推、目前等待时长等线索...';
    } else if (status === 'resume_screen_failed') {
      title = '筛选反馈（可选）';
      placeholder = '记录这次筛选结果，或写下你想优化的简历部分...';
    } else if (status === 'test_failed') {
      title = '笔试反馈（可选）';
      placeholder = '写下这次笔试中暴露出的知识盲区、题型难点或后续想补的内容...';
    } else if (status === 'first_interview_failed') {
      title = '一面反馈（可选）';
      placeholder = '记录一面中被问到的问题、卡壳点、简历追问，或你觉得表达不够清楚的地方...';
    } else if (status === 'second_interview_failed') {
      title = '二面反馈（可选）';
      placeholder = '记录二面中更深入的问题、项目细节、技术/业务追问，或你想复盘的关键环节...';
    } else if (status === 'third_interview_failed') {
      title = '三面反馈（可选）';
      placeholder = '记录三面中关于综合能力、团队匹配、岗位理解等方面的反馈或自我观察...';
    } else if (status === 'interview_failed') {
      title = '面试反馈（可选）';
      placeholder = '记录面试中的关键问题、卡壳点、反问环节、以及你想复盘的细节...';
    } else if (status === 'offer_declined') {
      title = '拒绝原因（可选）';
      placeholder = '写下你最终没有接受这份结果的考虑因素，帮助自己更清晰地做下一次选择...';
    } else if (['waiting_feedback', 'test_invitation', 'test_in_progress', 'test_completed', 'test_passed_waiting_interview', 'interview_invitation', 'first_interview', 'second_interview', 'third_interview'].includes(status)) {
      title = '阶段线索（可选）';
      placeholder = '记录一些补充信息，帮助 AI 在后续复盘时更好地理解背景...';
    }

    return { title, placeholder };
  };

  const feedbackConfig = getFeedbackConfig();

  return (
    <div className="relative min-h-screen bg-[#050711] overflow-x-hidden">
      {/* Background Atmosphere */}
      <AtmosphereBackground density={0.8} variant="rich" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <Button variant="ghost" className="mb-8 px-0 text-white/40 hover:text-white/60 hover:bg-transparent" onClick={() => navigate('/garden')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回我的成长花园
      </Button>

      {isUpdateMode && (
        <div className="mb-10 p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-[28px] flex items-center justify-between">
           <div className="flex gap-4 items-center">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                 <Clock className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                 <div className="text-[10px] text-indigo-400/60 uppercase font-black tracking-widest mb-0.5">正在更新</div>
                 <div className="text-[13px] font-bold text-indigo-100/90">{company} ｜ {role}</div>
              </div>
           </div>
           <div className="flex gap-3 text-[11px] font-bold">
              <span className="text-white/20 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                {(STAGE_OPTIONS.find(s => s.value === stage)?.label) || '投递'}
              </span>
              <span className="text-indigo-400/60">
                {(STATUS_BY_STAGE[stage].find(s => s.value === status)?.label) || '已投递'}
              </span>
           </div>
        </div>
      )}

      <div className={isUpdateMode ? "grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12" : "max-w-2xl"}>
        <div className="space-y-10">
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-medium"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </motion.div>
          )}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white/95">
              {isUpdateMode ? '更新本次记录' : '记录一次尝试'}
            </h1>
            <p className="text-white/40 text-sm font-medium leading-relaxed">
              {isUpdateMode 
                ? '记录这条求职路径的新进展，让每一步都有迹可循。' 
                : '在这里种下一颗种子，无论结果如何，它都会成为你的养料。'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">公司名称 <span className="text-red-500/50">*</span></label>
                <Input required value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google" className="bg-white/5 border-white/5 focus:border-indigo-500/30" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">岗位名称 <span className="text-red-500/50">*</span></label>
                <Input required value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Frontend Engineer Intern" className="bg-white/5 border-white/5 focus:border-indigo-500/30" />
              </div>
            </div>

            {/* Stage Selection */}
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80">当前所处阶段 <span className="text-red-500/50">*</span></label>
                <div className="flex flex-wrap p-1 bg-white/5 rounded-2xl gap-1">
                  {STAGE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleStageChange(opt.value)}
                      className={`flex-1 min-w-[80px] px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        stage === opt.value 
                          ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 shadow-sm' 
                          : 'text-white/30 hover:text-white/60'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-white/80">具体状态 <span className="text-red-500/50">*</span></label>
                  <span className="text-[10px] text-white/20 italic font-medium">选择一个更具体的状态，让成长路径更清晰。</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {STATUS_BY_STAGE[stage].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        status === opt.value 
                          ? 'bg-white/10 border-white/30 text-white shadow-lg' 
                          : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white/60'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <label className="text-sm font-medium text-white/80">简历材料 <span className="text-red-500/50">*</span></label>

                {/* 方案一：新的 PDF 上传组件（优先使用） */}
              <div className="mb-4">
                <ResumeUploader 
                  onTextExtracted={(text) => setResumeSummary(text)}
                  onFileRemoved={() => setResumeSummary('')}
                />
                <p className="text-[10px] text-white/30 mt-2 text-center">
                  支持上传 PDF，AI 将自动解析简历内容
                </p>
              </div>

                {/* 方案二：原来的手动输入（降级备选） */}
              <div className="relative">
                <div className="absolute -top-3 left-4 px-2 text-[10px] font-bold text-white/20 bg-[#050711] z-10">
                  或者手动填写
                </div>
                <Textarea 
                  value={resumeSummary} 
                  onChange={e => setResumeSummary(e.target.value)} 
                  placeholder="粘贴你的项目经历、技能关键词、实习经验摘要..."
                  className="h-28 text-sm bg-white/5 border-white/10 focus:border-indigo-500/30 pt-4"
                />
              </div>
            </div>
              
              {/*
              <div className="grid sm:grid-cols-2 gap-6">
                 <div 
                   onClick={() => setFileAttached(!fileAttached)}
                   className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-6 transition-all cursor-pointer group ${
                     fileAttached 
                       ? 'bg-emerald-500/5 border-emerald-500/30' 
                       : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
                   }`}
                 >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform flex-shrink-0 ${
                      fileAttached ? 'bg-emerald-500/20' : 'bg-white/5'
                    }`}>
                       {fileAttached ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5 text-white/30" />}
                    </div>
                    <span className={`text-xs font-bold ${fileAttached ? 'text-emerald-400' : 'text-white/40'}`}>
                      {fileAttached ? '简历文件已上传' : '上传 PDF / 图片 / 文档'}
                    </span>
                    <span className="text-[10px] text-white/20 mt-2 text-center leading-relaxed px-4">
                       {fileAttached ? '点击可取消上传' : 'MVP 当前会优先使用文本摘要进行 AI 复盘；后续版本可支持 PDF 和图片解析。'}
                    </span>
                 </div>
                 <div className="space-y-2">
                    <Textarea 
                      value={resumeSummary} 
                      onChange={e => setResumeSummary(e.target.value)} 
                      placeholder="或者在这里粘贴你的项目经历和关键词摘要..." 
                      className="h-full min-h-[120px] text-xs bg-white/5 border-white/5"
                    />
                 </div>
              </div>
            </div> */}
            
            {/* PDF简历上传 */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <label className="text-sm font-medium text-white/80">简历材料 <span className="text-red-500/50">*</span></label>
              <ResumeUploader 
                onTextExtracted={(text) => setResumeSummary(text)}
                onFileRemoved={() => setResumeSummary('')}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">岗位详情 / 要求 <span className="text-red-500/50">*</span></label>
              <Textarea 
                value={jdText} 
                onChange={e => setJdText(e.target.value)} 
                placeholder="粘贴岗位核心技能、职责要求、业务场景..." 
                className="h-24 text-sm bg-white/5 border-white/5"
              />
            </div>

            {feedbackConfig && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">{feedbackConfig.title}</label>
                <Textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder={feedbackConfig.placeholder} 
                  className="h-24 text-sm bg-white/5 border-white/5"
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-medium text-white/80">当前心情（可选）</label>
              <div className="flex flex-wrap gap-2.5">
                {MOOD_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMood(opt.value)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                      mood === opt.value 
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' 
                        : 'bg-white/5 border-white/5 text-white/20 hover:bg-white/10 hover:text-white/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">备注（可选）</label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="最近的心情，或者是对这份工作的特殊感觉..." className="text-sm bg-white/5 border-white/5" />
            </div>

            <div className="pt-10 border-t border-white/5 flex flex-col items-start gap-6">
              <Button type="submit" size="lg" className="w-auto px-16 font-black bg-white text-neutral-950 hover:bg-white/90 border-0 h-14 rounded-[24px] shadow-[0_0_20px_rgba(167,139,250,0.25)] text-base tracking-tight transition-all">
                {getSubmitButtonLabel()}
              </Button>
              
              {isUpdateMode && (
                <div className="flex justify-center">
                  <button 
                    type="button"
                    className="text-[11px] font-black text-red-500/40 hover:text-red-500/80 uppercase tracking-widest transition-colors py-2 px-6"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    删除本次记录
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Sidebar for Update Mode */}
        {isUpdateMode && (
          <div className="space-y-10">
             {timeline.length > 0 && (
               <div className="space-y-5">
                  <h3 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] border-l-2 border-white/10 pl-4">记录时间线</h3>
                  <div className="space-y-6 relative ml-1.5 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                     <div className="absolute left-[7px] top-4 bottom-4 w-px bg-white/5" />
                     {timeline.map((item, idx) => {
                       const isLast = idx === timeline.length - 1;
                       
                       return (
                        <div key={idx} className="flex gap-4 items-start relative group">
                           <div className={`mt-1.5 w-[15px] h-[15px] rounded-full border-4 border-[#0A0C10] flex items-center justify-center shrink-0 z-10 ${
                             isLast ? 'bg-indigo-500' : 'bg-white/10'
                           }`} />
                           <div className="space-y-0.5">
                              <div className="text-[10px] uppercase font-black text-white/15 tracking-widest leading-none">
                                 {new Date(item.date).toLocaleDateString()}
                              </div>
                              <div className={`text-[12px] font-bold leading-tight mt-1 ${isLast ? 'text-white/80' : 'text-white/40'}`}>
                                 {formatHistoryItem(item)}
                              </div>
                           </div>
                        </div>
                     )})}
                  </div>
               </div>
             )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-full max-w-sm bg-[#1A1D24] border border-white/10 rounded-3xl p-8 space-y-6 shadow-3xl text-center"
           >
              <div className="space-y-2">
                 <h3 className="text-xl font-bold text-red-500/90">确定要删除这次尝试吗？</h3>
                 <p className="text-sm text-white/40 leading-relaxed font-medium px-2">这会删除记录、复盘和相关任务。此操作无法恢复。</p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                 <Button className="w-full font-bold bg-red-600 hover:bg-red-500 border-0 h-12 rounded-xl" onClick={handleDelete}>
                    确认删除
                 </Button>
                 <Button variant="ghost" className="w-full text-white/30 hover:text-white/60 font-bold h-12" onClick={() => setShowDeleteConfirm(false)}>
                    取消
                 </Button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
    </div>
  );
}
