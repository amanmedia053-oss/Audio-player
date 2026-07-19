import React from 'react';
import { motion } from 'motion/react';
import { ChannelInfo } from '../types';
import { BookOpen, AlertCircle } from 'lucide-react';

interface HeaderProps {
  channelInfo: ChannelInfo | null;
  loading: boolean;
  error: string | null;
}

export const Header: React.FC<HeaderProps> = ({ channelInfo, loading, error }) => {
  return (
    <motion.header
      id="app-header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-b from-[#1c1b1f] to-[#121214] border-b border-[#2d2c30] px-6 py-8 md:py-10"
    >
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#7a5901]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-10 w-48 h-48 bg-[#9c27b0]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 relative z-10 text-right">
        {loading ? (
          <div className="flex flex-col md:flex-row items-center gap-6 w-full animate-pulse">
            <div className="w-24 h-24 bg-[#2d2c30] rounded-2xl md:self-start shrink-0" />
            <div className="space-y-3 w-full">
              <div className="h-6 bg-[#2d2c30] rounded-md w-1/3" />
              <div className="h-4 bg-[#2d2c30] rounded-md w-2/3" />
              <div className="h-4 bg-[#2d2c30] rounded-md w-1/2" />
            </div>
          </div>
        ) : error ? (
          <div id="header-error" className="flex items-center gap-3 bg-[#3a1d1d] text-[#ffb4ab] px-4 py-3 rounded-2xl border border-[#8c1d1d] w-full">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        ) : channelInfo ? (
          <div className="text-right select-text w-full">
            <p id="channel-description" className="text-sm sm:text-base text-[#c7c6ca] font-normal leading-relaxed max-w-3xl">
              {channelInfo.description}
            </p>
          </div>
        ) : null}
      </div>
    </motion.header>
  );
};
