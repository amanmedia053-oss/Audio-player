import React from 'react';
import { motion } from 'motion/react';
import { Post, PlaybackProgress, AppConfig } from '../types';
import { Play, RotateCcw } from 'lucide-react';

interface ContinueRowProps {
  posts: Post[];
  progressList: Record<string, PlaybackProgress>;
  onPlayPost: (post: Post, startAtTime?: number) => void;
  onClearProgress: (postId: string) => void;
  appConfig: AppConfig;
}

export const ContinueRow: React.FC<ContinueRowProps> = ({
  posts,
  progressList,
  onPlayPost,
  onClearProgress,
  appConfig,
}) => {
  // Find the most recently updated progress item that is not fully completed
  const activeProgressItem = (Object.values(progressList) as PlaybackProgress[])
    .filter((item) => item.currentTime > 2 && item.percentage < 98)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

  if (!activeProgressItem) return null;

  const associatedPost = posts.find((p) => p.id === activeProgressItem.postId);
  if (!associatedPost) return null;

  // Format remaining time or progress
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const remainingSeconds = Math.max(0, activeProgressItem.duration - activeProgressItem.currentTime);

  return (
    <motion.div
      id="continue-listening-row"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 mb-6"
    >
      <div className="bg-gradient-to-r from-[#2a2315] to-[#211e19] border border-[#ffb900]/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
        {/* Ambient indicator background glow */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ffb900]" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#4f3e10] text-[#ffdd80] text-xs font-bold rounded-full mb-2">
              <span className="w-1.5 h-1.5 bg-[#ffb900] rounded-full animate-pulse" />
              {appConfig.continue_badge_label || "بېرته یې اورئ (پاتې برخه واورئ)"}
            </span>
            <h3 id="continue-post-title" className="text-[#e3e2e6] text-sm sm:text-base font-semibold truncate leading-normal select-text">
              {associatedPost.text}
            </h3>
            
            <div className="flex items-center gap-4 mt-3 text-xs text-[#c7c6ca]">
              <span id="continue-time-info" className="dir-ltr text-right font-mono text-[#ffdd80]">
                {formatTime(activeProgressItem.currentTime)} / {formatTime(activeProgressItem.duration)}
              </span>
              <span className="h-3 w-px bg-[#484649]" />
              <span id="continue-remaining-info">
                {appConfig.continue_remaining_label
                  ? appConfig.continue_remaining_label
                      .replace('{time}', formatTime(remainingSeconds))
                      .replace('{percent}', Math.round(activeProgressItem.percentage).toString())
                  : `${formatTime(remainingSeconds)} پاتې دي (${Math.round(activeProgressItem.percentage)}%)`}
              </span>
            </div>

            {/* Custom Material progress bar */}
            <div className="relative w-full h-1.5 bg-[#484649] rounded-full mt-3 overflow-hidden">
              <div
                className="absolute right-0 top-0 bottom-0 bg-[#ffb900] rounded-full transition-all duration-300"
                style={{ width: `${activeProgressItem.percentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              id="clear-progress-btn"
              onClick={() => onClearProgress(activeProgressItem.postId)}
              title={appConfig.continue_clear_tooltip || "د پرمختګ پاکول"}
              className="p-3 bg-[#2d2c30] hover:bg-[#3d3c40] text-[#c7c6ca] rounded-2xl transition-all duration-200 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              id="resume-playback-btn"
              onClick={() => onPlayPost(associatedPost, activeProgressItem.currentTime)}
              className="flex items-center gap-2 px-5 py-3 bg-[#ffb900] hover:bg-[#e0a300] text-black font-bold text-sm rounded-2xl transition-all duration-200 shadow-md active:scale-95"
            >
              <Play className="w-4 h-4 fill-black text-black" />
              <span>{appConfig.continue_resume_btn || "پيل کړئ"}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
