import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Headphones, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  appName: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, appName }) => {
  const onFinishRef = React.useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinishRef.current();
    }, 2800); // Display for 2.8s for premium feel and smooth animations

    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      id="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 bg-[#0f0f11] z-[9999] flex flex-col items-center justify-between py-16 px-6 select-none overflow-hidden"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#ffb900]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      {/* Top Section - Small Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="flex items-center gap-1.5 bg-[#ffb900]/10 border border-[#ffb900]/20 px-3.5 py-1.5 rounded-full"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#ffb900]" />
        <span className="text-[11px] font-bold text-[#ffb900] uppercase tracking-wider font-sans">
          غږیز کتابتون کلتوري بنسټ
        </span>
      </motion.div>

      {/* Center Section - Animated Logo and App Name */}
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Animated Icon Ring */}
        <div className="relative mb-8">
          {/* Animated pulsing outer ring */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.4, 0.15] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute -inset-6 rounded-full border-2 border-[#ffb900]/30 blur-[2px]"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 0.4 }}
            className="absolute -inset-3 rounded-full border border-dashed border-[#ffb900]/50"
          />

          {/* Actual Core Icon Circle */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 120, delay: 0.4 }}
            className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-[#1a191d] to-[#252329] border-2 border-[#ffb900] shadow-[0_0_40px_rgba(255,185,0,0.25)] flex items-center justify-center z-10"
          >
            <Headphones className="w-11 h-11 text-[#ffb900]" />
          </motion.div>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="text-3xl font-black text-[#ffb900] tracking-tight mb-2 drop-shadow-md"
        >
          {appName}
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="text-sm text-[#c7c6ca]/80 tracking-wide font-medium leading-relaxed"
        >
          پښتو غږیزې لیکنې، لنډې کیسې او ناولونه
        </motion.p>
      </div>

      {/* Bottom Section - Loading & Footer */}
      <div className="flex flex-col items-center gap-5 w-full max-w-[180px]">
        {/* Modern thin loading line progress bar */}
        <div className="relative w-full h-[3px] bg-[#1a191d] rounded-full overflow-hidden">
          <motion.div
            initial={{ left: '-100%', width: '40%' }}
            animate={{ left: '100%', width: '50%' }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="absolute top-0 bottom-0 bg-[#ffb900] rounded-full shadow-[0_0_8px_rgba(255,185,0,0.5)]"
          />
        </div>

        {/* Copyright info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="text-center"
        >
          <p className="text-[10px] text-[#8e8d91] font-mono">نسخه ۲.۴ • ۲۰۲۶</p>
        </motion.div>
      </div>
    </motion.div>
  );
};
