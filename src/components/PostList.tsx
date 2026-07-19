import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Post, PlaybackProgress, AppConfig } from '../types';
import { getApiUrl } from '../utils';
import { Play, Pause, Clock, Search, BookOpen, ChevronLeft, Heart } from 'lucide-react';

interface PostListProps {
  posts: Post[];
  currentPlayingPost: Post | null;
  isPlaying: boolean;
  progressList: Record<string, PlaybackProgress>;
  favorites: string[];
  onPlayPost: (post: Post) => void;
  onPausePost: () => void;
  onToggleFavorite: (postId: string) => void;
  appConfig: AppConfig;
}

export const PostList: React.FC<PostListProps> = ({
  posts,
  currentPlayingPost,
  isPlaying,
  progressList,
  favorites,
  onPlayPost,
  onPausePost,
  onToggleFavorite,
  appConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) =>
    post.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
      {/* Search Bar - Material Design styled */}
      <div className="relative mb-6">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c7c6ca]">
          <Search className="w-5 h-5" />
        </div>
        <input
          id="post-search-input"
          type="text"
          placeholder={appConfig.list_search_placeholder || "د متن له مخې پلټنه وکړئ..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pr-12 pl-4 py-4 bg-[#1c1b1f] border border-[#484649] rounded-3xl text-sm text-[#e3e2e6] placeholder-[#8e8d91] focus:outline-none focus:border-[#ffb900] focus:ring-1 focus:ring-[#ffb900] transition-all duration-200 shadow-inner"
        />
        {searchQuery && (
          <button
            id="clear-search-btn"
            onClick={() => setSearchQuery('')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-xs bg-[#2d2c30] hover:bg-[#3d3c40] text-[#c7c6ca] px-2.5 py-1 rounded-full transition-colors duration-150"
          >
            {appConfig.list_search_clear || "پاکول"}
          </button>
        )}
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 id="posts-list-heading" className="text-lg font-bold text-[#e3e2e6] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#ffb900]" />
          <span>
            {appConfig.list_total_label
              ? appConfig.list_total_label.replace('{count}', filteredPosts.length.toString())
              : `ټول غږیز نشرات (${filteredPosts.length})`}
          </span>
        </h2>
      </div>

      {filteredPosts.length === 0 ? (
        <div id="no-posts-found" className="text-center py-16 bg-[#1c1b1f] rounded-3xl border border-[#2d2c30] p-6">
          <p className="text-[#c7c6ca] text-base font-medium">{appConfig.list_no_results || "هیڅ خپرونه ونه موندل شوه."}</p>
          <p className="text-xs text-[#8e8d91] mt-1">{appConfig.list_no_results_sub || "بله کلمه وکاروئ یا پلټنه پاکه کړئ."}</p>
        </div>
      ) : (
        <motion.div
          id="posts-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4"
        >
          {filteredPosts.map((post) => {
            const isCurrent = currentPlayingPost?.id === post.id;
            const progress = progressList[post.id];
            const hasStarted = progress && progress.currentTime > 2;

            const postImageUrl = (() => {
              const rawUrl = post.images?.[0] || appConfig.scraped_images?.[0] || appConfig.sidebar_cover_url || "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80";
              if (rawUrl.includes('telegram') || rawUrl.includes('t.me') || rawUrl.includes('telegram-cdn')) {
                return getApiUrl(`/api/proxy-image?url=${encodeURIComponent(rawUrl)}`);
              }
              return rawUrl;
            })();

            return (
              <motion.div
                key={post.id}
                id={`post-card-${post.id}`}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
                className={`relative overflow-hidden rounded-3xl border transition-all duration-300 p-5 ${
                  isCurrent
                    ? 'bg-[#2a2415] border-[#ffb900]/40 shadow-md ring-1 ring-[#ffb900]/20'
                    : 'bg-[#1c1b1f] border-[#2d2c30] hover:border-[#3e3d42] hover:bg-[#252428] shadow-sm'
                }`}
              >
                {/* Embedded Progress bar (subtle overlay on the bottom) */}
                {hasStarted && (
                  <div className="absolute bottom-0 right-0 left-0 h-1 bg-[#2d2c30]">
                    <div
                      className="h-full bg-[#ffb900]"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Action Play/Pause button */}
                  <div className="shrink-0">
                    {isCurrent && isPlaying ? (
                      <button
                        id={`post-pause-btn-${post.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPausePost();
                        }}
                        style={{ backgroundImage: `url(${postImageUrl})` }}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-cover bg-center relative overflow-hidden text-white shadow-lg shadow-[#ffb900]/10 transition-all duration-200 active:scale-95 group border border-red-500/25"
                      >
                        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/45 transition-colors duration-200" />
                        <Pause className="w-5 h-5 fill-[#ffb900] text-[#ffb900] relative z-10" />
                      </button>
                    ) : (
                      <button
                        id={`post-play-btn-${post.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayPost(post);
                        }}
                        style={{ backgroundImage: `url(${postImageUrl})` }}
                        className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-cover bg-center relative overflow-hidden transition-all duration-200 active:scale-95 group border ${
                          isCurrent
                            ? 'border-[#ffb900]/45 shadow-lg shadow-[#ffb900]/10'
                            : 'border-[#2d2c30]'
                        }`}
                      >
                        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/45 transition-colors duration-200" />
                        <Play className="w-5 h-5 fill-[#ffb900] text-[#ffb900] relative z-10 ml-0.5" />
                      </button>
                    )}
                  </div>

                  {/* Post Cover Thumbnail */}
                  <div className="shrink-0 relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-[#2d2c30]/80">
                    <img
                      src={(() => {
                        const rawUrl = post.images?.[0] || appConfig.scraped_images?.[0] || appConfig.sidebar_cover_url || "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80";
                        if (rawUrl.includes('telegram') || rawUrl.includes('t.me') || rawUrl.includes('telegram-cdn')) {
                          return getApiUrl(`/api/proxy-image?url=${encodeURIComponent(rawUrl)}`);
                        }
                        return rawUrl;
                      })()}
                      alt="کاور"
                      className="w-full h-full object-cover brightness-[0.95]"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Caption Text and Meta details */}
                  <div className="flex-1 min-w-0 space-y-2 cursor-pointer" onClick={() => onPlayPost(post)}>
                    <h3
                      id={`post-title-${post.id}`}
                      className={`text-sm sm:text-base font-bold leading-relaxed line-clamp-3 select-text ${
                        isCurrent ? 'text-[#ffb900]' : 'text-[#e3e2e6] hover:text-[#ffb900] transition-colors'
                      }`}
                    >
                      {post.text}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#c7c6ca]">
                      {post.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#ffb900]" />
                          <span className="dir-ltr text-right font-mono">{post.duration}</span>
                        </div>
                      )}
                      
                      {hasStarted && (
                        <span id={`post-percentage-${post.id}`} className="text-[#ffdd80] font-semibold">
                          {appConfig.list_listened_label
                            ? appConfig.list_listened_label.replace('{percent}', Math.round(progress.percentage).toString())
                            : `اورېدل شوی: ${Math.round(progress.percentage)}%`}
                        </span>
                      )}

                      <span className="text-[#8e8d91] font-mono text-[10px] hidden sm:inline">
                        ID: {post.id}
                      </span>
                    </div>
                  </div>

                  {/* Left Action / Indicator Group */}
                  <div className="shrink-0 self-center flex items-center gap-2">
                    {/* Favorite Button */}
                    <button
                      id={`post-fav-btn-${post.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(post.id);
                      }}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90 cursor-pointer ${
                        favorites.includes(post.id)
                          ? 'bg-red-500/10 border border-red-500/25 text-red-500 shadow-sm shadow-red-500/5'
                          : 'bg-[#2d2c30]/50 hover:bg-red-500/10 border border-[#2d2c30] hover:border-red-500/25 text-[#8e8d91] hover:text-red-400'
                      }`}
                      title={
                        favorites.includes(post.id)
                          ? (appConfig.list_fav_remove_tooltip || 'خوښې مینو څخه لرې کول')
                          : (appConfig.list_fav_add_tooltip || 'خوښو شویو کې شاملول')
                      }
                    >
                      <Heart className={`w-4.5 h-4.5 transition-transform ${favorites.includes(post.id) ? 'fill-red-500 text-red-500' : 'fill-transparent'}`} />
                    </button>

                    <div className="hidden sm:block">
                      <ChevronLeft className="w-5 h-5 text-[#8e8d91]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};
