import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sprout, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'motion/react';

export function Layout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 overflow-x-hidden selection:bg-white/20">
      {/* Abstract background gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-900/10 blur-[150px]" />
      </div>

      <div className="sticky top-0 z-[50] w-full border-b border-white/[0.05] bg-[#050711]/80 backdrop-blur-md">
        <header className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors group">
            <Sprout className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            <span className="font-serif tracking-tight text-xl font-normal">Offer Garden</span>
          </Link>
          
          {isLanding ? (
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs font-bold text-white/50 hover:text-white"
                onClick={() => setShowLoginModal(true)}
              >
                Sign in
              </Button>
            </div>
          ) : (
            <nav className="flex items-center gap-2 sm:gap-6 text-[11px] sm:text-sm font-medium">
              <Link 
                to="/garden" 
                className={cn(
                  "transition-colors", 
                  location.pathname.startsWith('/garden') ? "text-white" : "text-white/50 hover:text-white/80"
                )}
              >
                My Garden
              </Link>
              <Link 
                to="/record" 
                className={cn(
                  "transition-colors", 
                  location.pathname.startsWith('/record') ? "text-white" : "text-white/50 hover:text-white/80"
                )}
              >
                Record Attempt
              </Link>
            </nav>
          )}
        </header>
      </div>

      <main className="relative z-10">
        <Outlet />
      </main>

      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setShowLoginModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#1A1D24] border border-white/10 rounded-3xl p-8 relative z-10 shadow-3xl text-center space-y-6"
            >
              <div className="space-y-2">
                 <h3 className="text-xl font-bold text-white/90">账号系统将在后续版本开放</h3>
                 <p className="text-sm text-white/40 leading-relaxed font-medium px-2">当前 MVP 会将你的成长记录保存在本地浏览器中。你可以使用「加载示例花园」查看完整演示数据，也可以使用「重新开始」清空当前记录。</p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                 <Button 
                   className="w-full font-bold bg-indigo-600 hover:bg-indigo-500 border-0"
                   onClick={() => setShowLoginModal(false)}
                 >
                   我知道了
                 </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
