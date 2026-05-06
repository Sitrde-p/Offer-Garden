import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BrainCircuit, HeartHandshake, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { GlowingTree } from '../components/Tree';

import { AtmosphereBackground } from '../components/AtmosphereBackground';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-[#05060d] flex items-center pt-20 pb-20">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: "url('/images/hero.png')" }}
        />
        
        {/* Overlay Mask - Subtle gradient instead of heavy block mask */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-[#05060d]/80 via-[#05060d]/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="max-w-3xl space-y-8"
          >
            <div className="space-y-3">
              <h1 className="text-[78px] lg:text-[90px] font-serif font-normal tracking-tight text-white leading-[1.05] selection:text-indigo-200">
                Offer Garden
              </h1>
              <div className="inline-block max-w-[fit-content]">
                <h2 className="text-[24px] lg:text-[30px] font-normal tracking-tight bg-gradient-to-r from-[#4DA3FF] via-[#8B7CFF] to-[#F08BD7] bg-clip-text text-transparent whitespace-nowrap leading-none py-1.5">
                  让每一次被拒，都成为下一次出发的勇气。
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-14">
              <Button 
                size="lg" 
                onClick={() => navigate('/record')} 
                className="bg-gradient-to-r from-[#168BFF] via-[#6D5CFF] to-[#EC5BBE] hover:opacity-95 border-0 shadow-[0_0_24px_rgba(104,92,255,0.35)] px-10 py-7 text-lg font-normal rounded-2xl text-white transition-all transform hover:scale-[1.01]"
              >
                记录一次尝试
              </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => navigate('/garden')} 
                className="bg-neutral-900/40 border-white/10 backdrop-blur-md px-10 py-7 text-lg font-normal rounded-2xl hover:bg-neutral-800/60 text-white/90 transition-all border"
              >
                进入我的成长花园
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="relative min-h-screen py-32 overflow-hidden bg-[#05060d]">
        {/* Background Layer for Second Screen */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none opacity-80"
          style={{ backgroundImage: "url('/images/section.png')" }}
        />
        <div className="absolute inset-0 z-[1] pointer-events-none bg-neutral-950/40" />

        <div className="max-w-7xl mx-auto px-6 relative z-[10]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <FeatureCard 
              icon={<BrainCircuit className="w-6 h-6 text-indigo-400" />}
              title="复盘每一次受挫"
              desc="不只停在一句“被拒了”。Offer Garden 通过 AI 复盘岗位要求、简历内容与面试经历，帮你看见可能的卡点，并整理出更具体的下一步。"
            />
            <FeatureCard 
              icon={<Sparkles className="w-6 h-6 text-pink-400" />}
              title="积累每一点勇气"
              desc="每一次尝试，都不该悄悄归零。投递、等待、无回应、受挫和复盘，都会沉淀为勇气值。不是为了证明失败，而是为了看见你一直在前进。"
            />
            <FeatureCard 
              icon={<HeartHandshake className="w-6 h-6 text-cyan-400" />}
              title="点亮你的成长花园"
              desc="把零散的求职经历，变成一座会发光的花园。每一次记录、复盘和行动，都会留下痕迹。它记录的不是失败，而是你一次次重新出发的证明。"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mt-32 max-w-[940px] mx-auto text-center bg-white/[0.03] p-12 lg:px-14 lg:py-12 rounded-[3.5rem] border border-white/[0.08] backdrop-blur-2xl shadow-2xl"
          >
            <h3 className="text-2xl font-normal text-white/90 mb-6 transition-colors selection:bg-indigo-500/30">拒绝不是失败</h3>
            <div className="text-white/60 leading-[1.7] text-lg font-normal space-y-3">
              <p className="whitespace-nowrap">真正让人内耗的，不只是结果本身，而是那些没有被理解、没有被复盘、也没有下一步行动的时刻。</p>
              <p className="whitespace-nowrap">Offer Garden 想做的，是把“被拒”从一句冷冰冰的结论，变成一段可以被记录、被理解、也能继续前行的过程。</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl space-y-4 hover:bg-white/[0.06] transition-all duration-500 shadow-xl">
      <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.1]">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-white/90">{title}</h3>
      <p className="text-white/50 text-[15px] leading-relaxed">{desc}</p>
    </div>
  );
}
