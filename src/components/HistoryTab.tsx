import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Post, PlaybackProgress, AppConfig } from '../types';
import { Play, Trash2, History, Award, Clock } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

interface HistoryTabProps {
  posts: Post[];
  progressList: Record<string, PlaybackProgress>;
  onPlayPost: (post: Post, startAtTime?: number) => void;
  onClearProgress: (postId: string) => void;
  onClearAllProgress: () => void;
  appConfig: AppConfig;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  posts,
  progressList,
  onPlayPost,
  onClearProgress,
  onClearAllProgress,
  appConfig,
}) => {
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    type: 'single' | 'all';
    postId?: string;
  }>({
    isOpen: false,
    type: 'single',
  });

  const progressItems = (Object.values(progressList) as PlaybackProgress[])
    .filter((item) => item.currentTime > 2)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calculate some fun stats
  const totalListenedSecs = progressItems.reduce((acc, item) => acc + item.currentTime, 0);
  const totalListenedMins = Math.round(totalListenedSecs / 60);

  const handleConfirmDelete = () => {
    if (deleteModalState.type === 'single' && deleteModalState.postId) {
      onClearProgress(deleteModalState.postId);
    } else if (deleteModalState.type === 'all') {
      onClearAllProgress();
    }
    setDeleteModalState({ isOpen: false, type: 'single' });
  };

  return (
    <motion.div
      id="history-tab-screen"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto px-4 sm:px-6 pb-24 text-right space-y-6"
    >
      {/* Listening Stats Banner */}
      <div className="bg-gradient-to-r from-[#2a2315] to-[#1c1b1f] border border-[#ffb900]/20 rounded-[32px] p-6 shadow-md flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#ffb900]">
            {appConfig.history_stats_title || "ستاسو غږیز سفر"}
          </h3>
          <p className="text-2xl font-black text-[#e3e2e6] mt-1">
            {appConfig.history_stats_mins
              ? appConfig.history_stats_mins.replace('{mins}', totalListenedMins.toString())
              : `${totalListenedMins} دقیقې اورېدل شوی`}
          </p>
          <p className="text-[11px] text-[#8e8d91] mt-1">
            {appConfig.history_stats_chapters
              ? appConfig.history_stats_chapters.replace('{count}', progressItems.length.toString())
              : `په ټولیز ډول د ${progressItems.length} فصلونو څخه`}
          </p>
        </div>
        
        <div className="w-14 h-14 bg-[#4f3e10]/30 rounded-2xl flex items-center justify-center border border-[#ffb900]/20 text-[#ffb900]">
          <Award className="w-8 h-8" />
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-[#2d2c30] pb-3 px-1">
        <h3 className="text-base font-extrabold text-[#e3e2e6] flex items-center gap-2">
          <History className="w-5 h-5 text-[#ffb900]" />
          <span>{appConfig.history_heading || "وروستي پیل شوي غږونه"}</span>
        </h3>

        {progressItems.length > 0 && (
          <button
            id="clear-all-history-btn"
            onClick={() => setDeleteModalState({ isOpen: true, type: 'all' })}
            className="text-xs text-[#ffb4ab] hover:text-[#ff897a] flex items-center gap-1 bg-[#3a1d1d]/40 px-3 py-1.5 rounded-xl border border-[#8c1d1d]/30 transition-colors active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{appConfig.history_clear_all_btn || "ټول پاک کړئ"}</span>
          </button>
        )}
      </div>

      {progressItems.length === 0 ? (
        <div id="no-history-placeholder" className="text-center py-16 bg-[#1c1b1f] rounded-3xl border border-[#2d2c30] p-6">
          <History className="w-12 h-12 text-[#8e8d91] mx-auto mb-4 opacity-45" />
          <p className="text-[#c7c6ca] text-base font-medium">{appConfig.history_no_history || "تر اوسه هیڅ تاریخچه نشته."}</p>
          <p className="text-xs text-[#8e8d91] mt-1">{appConfig.history_no_history_sub || "د کور پاڼې څخه کوم ناول غږیز فصل پیل کړئ."}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {progressItems.map((item) => {
            const associatedPost = posts.find((p) => p.id === item.postId);
            if (!associatedPost) return null;

            return (
              <motion.div
                key={item.postId}
                id={`history-item-${item.postId}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1c1b1f] border border-[#2d2c30] rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Post Cover Thumbnail */}
                  <div className="shrink-0 relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-[#2d2c30]/80">
                    <img
                      src={(() => {
                        const rawUrl = associatedPost.images?.[0] || appConfig.scraped_images?.[0] || appConfig.sidebar_cover_url || "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80";
                        if (rawUrl.includes('telegram') || rawUrl.includes('t.me') || rawUrl.includes('telegram-cdn')) {
                          return `/api/proxy-image?url=${encodeURIComponent(rawUrl)}`;
                        }
                        return rawUrl;
                      })()}
                      alt="کاور"
                      className="w-full h-full object-cover brightness-[0.95]"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-[#e3e2e6] line-clamp-2 select-text">
                      {associatedPost.text}
                    </h4>
                    
                    <div className="flex items-center gap-2.5 mt-2.5 text-xs text-[#8e8d91] dir-ltr justify-end">
                      <span className="font-mono text-[#ffb900]">
                        {formatTime(item.currentTime)} / {formatTime(item.duration)}
                      </span>
                      <Clock className="w-3.5 h-3.5 text-[#ffb900]" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id={`history-play-btn-${item.postId}`}
                      onClick={() => onPlayPost(associatedPost, item.currentTime)}
                      className="w-9 h-9 bg-[#ffb900] hover:bg-[#e0a300] text-black rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-md cursor-pointer"
                      title={appConfig.history_play_tooltip || "بیا اورېدل پیل کړئ"}
                    >
                      <Play className="w-4 h-4 fill-black" />
                    </button>
                    
                    <button
                      id={`history-delete-btn-${item.postId}`}
                      onClick={() => setDeleteModalState({ isOpen: true, type: 'single', postId: item.postId })}
                      className="w-9 h-9 bg-[#2d2c30] hover:bg-red-500/20 text-[#c7c6ca] hover:text-[#ff897a] rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                      title={appConfig.history_delete_tooltip || "له تاریخچې پاکول"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative w-full h-1.5 bg-[#2d2c30] rounded-full overflow-hidden">
                  <div
                    className="absolute right-0 top-0 bottom-0 bg-[#ffb900] rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalState.isOpen}
        title={
          deleteModalState.type === 'all'
            ? "د ټولې تاریخچې پاکول"
            : "له تاریخچې څخه حذفول"
        }
        message={
          deleteModalState.type === 'all'
            ? "ایا تاسو باوري یاست چې غواړئ ستاسو د ټول اورېدل شویو غږونو تاریخچه او پرمختګ له منځه یوسئ؟ دا عمل بېرته نه شي ګرځېدلی."
            : "ایا تاسو باوري یاست چې غواړئ دا غږیز فصل له خپلې تاریخچې څخه لېرې کړئ؟"
        }
        confirmText={
          deleteModalState.type === 'all'
            ? "هو، ټولې دوسیې پاکې کړه"
            : "هو، پاک یې کړه"
        }
        cancelText="منع کړه"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, type: 'single' })}
      />
    </motion.div>
  );
};
