import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Post, PlaybackProgress, AppConfig } from '../types';
import { Play, Pause, Clock, Heart, Search, ChevronLeft, Trash2 } from 'lucide-react';

interface FavoritesTabProps {
  posts: Post[];
  favorites: string[];
  currentPlayingPost: Post | null;
  isPlaying: boolean;
  progressList: Record<string, PlaybackProgress>;
  onPlayPost: (post: Post) => void;
  onPausePost: () => void;
  onToggleFavorite: (postId: string) => void;
  onClearAllFavorites: () => void;
  onChangeTab: (tab: 'home' | 'history' | 'about' | 'favorites') => void;
  appConfig: AppConfig;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({
  posts,
  favorites,
  currentPlayingPost,
  isPlaying,
  progressList,
  onPlayPost,
  onPausePost,
  onToggleFavorite,
  onClearAllFavorites,
  onChangeTab,
  appConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter posts to only those that are favorited
  const favoritePosts = posts.filter((post) => favorites.includes(post.id));

  // Further filter based on search query
  const filteredFavs = favoritePosts.filter((post) =>
    post.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <motion.div
      id="favorites-tab-screen"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 text-right"
    >
      {/* Title Header with Action */}
      <div className="flex items-center justify-between mb-6 px-1">
        {favoritePosts.length > 0 && (
          <button
            id="clear-all-favorites-btn"
            onClick={onClearAllFavorites}
            className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3.5 py-1.5 rounded-full transition-all border border-red-500/10 hover:border-red-500/30 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{appConfig.favorites_clear_all || "ټول پاکول"}</span>
          </button>
        )}
        <h2 id="favorites-tab-heading" className="text-lg font-black text-[#e3e2e6] flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          <span>
            {appConfig.favorites_heading
              ? appConfig.favorites_heading.replace('{count}', favoritePosts.length.toString())
              : `زما خوښې خپرونې (${favoritePosts.length})`}
          </span>
        </h2>
      </div>

      {favoritePosts.length === 0 ? (
        // Empty State
        <motion.div
          id="favorites-empty-state"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-20 bg-[#1c1b1f] rounded-[32px] border border-[#2d2c30] p-8 flex flex-col items-center justify-center space-y-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl animate-pulse scale-150" />
            <div className="relative w-16 h-16 bg-[#2d2c30] border border-red-500/20 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-red-500 fill-red-500/10 animate-bounce" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-base font-bold text-[#e3e2e6]">{appConfig.favorites_empty_title || "خوښې خپرونې شتون نه لري"}</h3>
            <p className="text-xs text-[#8e8d91] max-w-sm leading-relaxed mx-auto">
              {appConfig.favorites_empty_desc || "تاسو لا تر اوسه هیڅ غږیز ناول یا خپرونه خوښ کړی نه دی. په اصلي لیست کې د هر غږ تر څنګ د زړه (خوښې) په نښه باندې کلیک وکړئ ترڅو دلته اضافه شي."}
            </p>
          </div>

          <button
            id="go-home-from-favorites-btn"
            onClick={() => onChangeTab('home')}
            className="bg-[#ffb900] hover:bg-[#e0a300] text-black font-bold text-xs px-6 py-3 rounded-full transition-colors cursor-pointer shadow-lg shadow-[#ffb900]/10"
          >
            {appConfig.favorites_empty_go_home || "اصلي لیست ته ورشئ"}
          </button>
        </motion.div>
      ) : (
        <>
          {/* Search bar specifically for favorites if list is long */}
          {favoritePosts.length > 3 && (
            <div className="relative mb-6">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c7c6ca]">
                <Search className="w-5 h-5" />
              </div>
              <input
                id="favorites-search-input"
                type="text"
                placeholder={appConfig.favorites_search_placeholder || "په خوښو شویو کې پلټنه..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-[#1c1b1f] border border-[#484649] rounded-3xl text-sm text-[#e3e2e6] placeholder-[#8e8d91] focus:outline-none focus:border-[#ffb900] focus:ring-1 focus:ring-[#ffb900] transition-all duration-200 shadow-inner"
              />
              {searchQuery && (
                <button
                  id="clear-favorites-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-xs bg-[#2d2c30] hover:bg-[#3d3c40] text-[#c7c6ca] px-2.5 py-1 rounded-full transition-colors duration-150"
                >
                  {appConfig.list_search_clear || "پاکول"}
                </button>
              )}
            </div>
          )}

          {filteredFavs.length === 0 ? (
            <div className="text-center py-16 bg-[#1c1b1f] rounded-3xl border border-[#2d2c30] p-6">
              <p className="text-[#c7c6ca] text-sm font-medium">{appConfig.list_no_results || "هیڅ خپرونه ونه موندل شوه."}</p>
              <p className="text-xs text-[#8e8d91] mt-1">{appConfig.list_no_results_sub || "بله پلټنه وکاروئ."}</p>
            </div>
          ) : (
            <motion.div
              id="favorites-posts-grid"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-4"
            >
              {filteredFavs.map((post) => {
                const isCurrent = currentPlayingPost?.id === post.id;
                const progress = progressList[post.id];
                const hasStarted = progress && progress.currentTime > 2;

                return (
                  <motion.div
                    key={post.id}
                    id={`fav-post-card-${post.id}`}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className={`relative overflow-hidden rounded-3xl border transition-all duration-300 p-5 ${
                      isCurrent
                        ? 'bg-[#2a2415] border-[#ffb900]/40 shadow-md ring-1 ring-[#ffb900]/20'
                        : 'bg-[#1c1b1f] border-[#2d2c30] hover:border-[#3e3d42] hover:bg-[#252428] shadow-sm'
                    }`}
                  >
                    {/* Embedded Progress bar */}
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
                            id={`fav-pause-btn-${post.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onPausePost();
                            }}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#ffb900] hover:bg-[#e0a300] text-black shadow-lg shadow-[#ffb900]/10 transition-all duration-200 active:scale-95"
                          >
                            <Pause className="w-5 h-5 fill-black text-black" />
                          </button>
                        ) : (
                          <button
                            id={`fav-play-btn-${post.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayPost(post);
                            }}
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 ${
                              isCurrent
                                ? 'bg-[#ffb900] text-black shadow-lg shadow-[#ffb900]/10'
                                : 'bg-[#2d2c30] hover:bg-[#ffb900] hover:text-black text-[#ffb900]'
                            }`}
                          >
                            <Play className="w-5 h-5 fill-current" />
                          </button>
                        )}
                      </div>

                      {/* Post Cover Thumbnail */}
                      <div className="shrink-0 relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-[#2d2c30]/80">
                        <img
                          src={(() => {
                            const rawUrl = post.images?.[0] || appConfig.scraped_images?.[0] || appConfig.sidebar_cover_url || "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80";
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

                      {/* Caption Text and Meta details */}
                      <div className="flex-1 min-w-0 space-y-2 cursor-pointer" onClick={() => onPlayPost(post)}>
                        <h3
                          id={`fav-post-title-${post.id}`}
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
                            <span className="text-[#ffdd80] font-semibold">
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

                      {/* Interactive Heart favorite button */}
                      <div className="shrink-0 self-center flex items-center gap-2">
                        <button
                          id={`fav-remove-heart-btn-${post.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(post.id);
                          }}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors cursor-pointer border border-red-500/20"
                          title={appConfig.list_fav_remove_tooltip || "خوښې مینو څخه لرې کول"}
                        >
                          <Heart className="w-5 h-5 fill-red-500 text-red-500" />
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
        </>
      )}
    </motion.div>
  );
};
