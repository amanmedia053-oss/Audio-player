import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, AppConfig } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Gauge,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  ListMusic,
  X
} from 'lucide-react';

interface AudioPlayerProps {
  currentPost: Post | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  speed: number;
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSkip: (offset: number) => void;
  onSpeedChange: (speed: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onDismiss?: () => void;
  appConfig: AppConfig;
  channelName?: string;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onReturnToHome?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentPost,
  isPlaying,
  currentTime,
  duration,
  speed,
  volume,
  isMuted,
  onTogglePlay,
  onSeek,
  onSkip,
  onSpeedChange,
  onVolumeChange,
  onToggleMute,
  onNext,
  onPrevious,
  onDismiss,
  appConfig,
  channelName = 'افغان بانډي',
  isExpanded: externalExpanded,
  onExpandedChange,
  onReturnToHome,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = externalExpanded !== undefined ? externalExpanded : internalExpanded;

  const setExpanded = (val: boolean) => {
    setInternalExpanded(val);
    if (onExpandedChange) {
      onExpandedChange(val);
    }
  };

  const [showSpeedSelector, setShowSpeedSelector] = useState(false);
  
  // Ref and state for border seekbar dimensions
  const playerCardRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const postImageUrl = (() => {
    if (!currentPost) return "";
    const rawUrl = currentPost.images?.[0] || appConfig.scraped_images?.[0] || appConfig.sidebar_cover_url || "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80";
    if (rawUrl.includes('telegram') || rawUrl.includes('t.me') || rawUrl.includes('telegram-cdn')) {
      return `/api/proxy-image?url=${encodeURIComponent(rawUrl)}`;
    }
    return rawUrl;
  })();

  useEffect(() => {
    if (!currentPost || isExpanded || !playerCardRef.current) return;

    const updateSize = () => {
      if (playerCardRef.current) {
        const rect = playerCardRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    
    // Initial size
    updateSize();

    // Setup ResizeObserver
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const rect = entry.target.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    });

    observer.observe(playerCardRef.current);
    window.addEventListener('resize', updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [currentPost, isExpanded]);

  if (!currentPost) return null;

  const radius = 16;
  const strokeWidth = 2.5;
  const cardWidth = Math.max(32, dimensions.width);
  const cardHeight = Math.max(32, dimensions.height);
  const perimeter = 2 * (cardWidth - 2 * radius) + 2 * (cardHeight - 2 * radius) + 2 * Math.PI * radius;
  const progress = duration > 0 ? (currentTime / duration) : 0;
  const strokeDashoffset = perimeter - (perimeter * progress);

  // Formatting helper for MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onSeek(time);
  };

  return (
    <>
      {/* 1. DOCKED COMPACT BOTTOM PLAYER */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            id="docked-player"
            ref={playerCardRef}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 140 }}
            className="fixed bottom-[84px] right-3 left-3 md:right-4 md:left-4 bg-[#16151a]/95 backdrop-blur-md rounded-2xl z-40 px-4 py-3 shadow-[0_15px_35px_rgba(0,0,0,0.65),0_0_15px_rgba(255,185,0,0.06)] flex flex-col gap-2 overflow-hidden border border-[#ffb900]/10"
          >
            {/* Custom Border Outline Stroke Progress Seekbar */}
            {dimensions.width > 0 && dimensions.height > 0 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl" style={{ zIndex: 10 }}>
                {/* Background Track border */}
                <rect
                  x={strokeWidth / 2}
                  y={strokeWidth / 2}
                  width={Math.max(0, dimensions.width - strokeWidth)}
                  height={Math.max(0, dimensions.height - strokeWidth)}
                  rx={radius}
                  ry={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth={strokeWidth}
                />
                {/* Active progress border stroke */}
                <rect
                  x={strokeWidth / 2}
                  y={strokeWidth / 2}
                  width={Math.max(0, dimensions.width - strokeWidth)}
                  height={Math.max(0, dimensions.height - strokeWidth)}
                  rx={radius}
                  ry={radius}
                  fill="none"
                  stroke="#ffb900"
                  strokeWidth={strokeWidth}
                  strokeDasharray={perimeter || 1000}
                  strokeDashoffset={strokeDashoffset || 0}
                  strokeLinecap="round"
                  className="transition-all duration-150 ease-out"
                />
              </svg>
            )}

            <div className="flex items-center justify-between gap-3 max-w-4xl mx-auto w-full relative z-20">
              {/* Cover Art / Title / Description */}
              <div
                id="docked-info-trigger"
                onClick={() => setExpanded(true)}
                className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer group"
              >
                {/* Animated Graphic/Equalizer Thumbnail */}
                <div className="w-11 h-11 bg-gradient-to-tr from-[#1f1d24] to-[#2d2a33] border border-[#ffb900]/25 rounded-xl flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden group-hover:border-[#ffb900]/50 transition-colors">
                  <div className={`absolute inset-0 bg-[#ffb900]/5 ${isPlaying ? 'animate-pulse' : ''}`} />
                  
                  {isPlaying ? (
                    <div className="flex items-end gap-0.5 h-4.5 w-5 justify-center relative z-10" dir="ltr">
                      <span className="w-0.75 bg-[#ffb900] rounded-full animate-[pulse_0.8s_infinite]" style={{ height: '50%', animationDelay: '0.1s' }} />
                      <span className="w-0.75 bg-[#ffb900] rounded-full animate-[pulse_1.2s_infinite]" style={{ height: '85%', animationDelay: '0.3s' }} />
                      <span className="w-0.75 bg-[#ffb900] rounded-full animate-[pulse_0.9s_infinite]" style={{ height: '35%', animationDelay: '0.5s' }} />
                      <span className="w-0.75 bg-[#ffb900] rounded-full animate-[pulse_1.1s_infinite]" style={{ height: '70%', animationDelay: '0.2s' }} />
                    </div>
                  ) : (
                    <Play className="w-4.5 h-4.5 text-[#ffb900]" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <h4 id="docked-title" className="text-sm font-bold text-[#e3e2e6] truncate group-hover:text-[#ffb900] transition-colors select-text">
                    {currentPost.text}
                  </h4>
                  <p id="docked-duration-info" className="text-[11px] text-[#ffb900]/90 font-mono dir-ltr text-right mt-0.5">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </p>
                </div>
              </div>

              {/* Simple Controls */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 z-20">
                <button
                  id="docked-prev-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrevious();
                  }}
                  className="p-1.5 sm:p-2 text-[#c7c6ca] hover:text-[#ffb900] hover:bg-white/5 rounded-full transition-all active:scale-90"
                  title={appConfig.player_title_prev || "مخکینی"}
                >
                  <SkipBack className="w-4.5 h-4.5" />
                </button>

                <button
                  id="docked-toggle-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePlay();
                  }}
                  className="w-10 h-10 rounded-full bg-[#ffb900] hover:bg-[#e0a300] text-black flex items-center justify-center shadow-md active:scale-90 transition-all shrink-0 cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-black text-black" />
                  ) : (
                    <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                  )}
                </button>

                <button
                  id="docked-next-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  className="p-1.5 sm:p-2 text-[#c7c6ca] hover:text-[#ffb900] hover:bg-white/5 rounded-full transition-all active:scale-90"
                  title={appConfig.player_title_next || "بل"}
                >
                  <SkipForward className="w-4.5 h-4.5" />
                </button>

                <div className="w-px h-5 bg-[#2d2c30] mx-0.5" />

                <button
                  id="docked-expand-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(true);
                  }}
                  className="p-1.5 sm:p-2 text-[#c7c6ca] hover:text-[#ffb900] hover:bg-white/5 rounded-full transition-all active:scale-90"
                  title={appConfig.player_title_expand || "پراخ کړئ"}
                >
                  <ChevronUp className="w-4.5 h-4.5" />
                </button>

                {/* Dismiss button */}
                <button
                  id="docked-dismiss-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDismiss) onDismiss();
                  }}
                  className="w-10 h-10 rounded-full bg-[#2d2c30] hover:bg-red-500/20 text-[#c7c6ca] hover:text-red-400 flex items-center justify-center transition-all active:scale-90 border border-[#3e3d42] cursor-pointer"
                  title={appConfig.player_title_dismiss || "بندول"}
                >
                  <X className="w-4.5 h-4.5 font-bold" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. FULLSCREEN EXPANDED PLAYER OVERLAY (MATERIAL 3 SHEET) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="fullscreen-player-overlay"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            className="fixed inset-0 bg-[#121214] z-50 overflow-y-auto flex flex-col justify-between"
          >
            {/* Header Area */}
            <div className="px-6 py-4 border-b border-[#2d2c30] flex items-center justify-between bg-[#1c1b1f]">
              <button
                id="close-player-btn"
                onClick={() => {
                  setExpanded(false);
                  if (onReturnToHome) onReturnToHome();
                }}
                className="p-2 hover:bg-[#2d2c30] text-[#c7c6ca] hover:text-[#ffb900] rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                title={appConfig.player_title_close || "تړل او کورپاڼې ته تلل"}
              >
                <ChevronDown className="w-6 h-6" />
                <span className="text-xs font-bold text-[#ffb900] hidden sm:inline">کورپاڼه</span>
              </button>

              <h2 id="player-sheet-title" className="text-base font-extrabold text-[#ffb900] flex items-center gap-2">
                <ListMusic className="w-5 h-5" />
                <span>{appConfig.player_now_playing || "اوس مهال غږول کېږي"}</span>
              </h2>

              <button
                id="fullscreen-dismiss-btn"
                onClick={() => {
                  setExpanded(false);
                  if (onDismiss) onDismiss();
                }}
                className="p-2 hover:bg-red-500/10 text-[#c7c6ca] hover:text-red-400 rounded-full transition-colors cursor-pointer"
                title={appConfig.player_title_dismiss || "بندول"}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Immersive Audio Player Body */}
            <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 flex flex-col justify-center gap-8 select-text">
              {/* Graphic Feature / Spinning Artwork */}
              <div className="flex justify-center my-2">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-br from-[#ffb900] to-[#7a5901] rounded-[40px] shadow-2xl flex items-center justify-center overflow-hidden border border-[#ffdd80]/20">
                  {/* Current post image filling the yellow cube container */}
                  <img
                    src={postImageUrl}
                    alt={currentPost.text}
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.8] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
                  
                  {/* Decorative rotating disc outline */}
                  <motion.div
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                    className="absolute inset-4 rounded-full border border-[#ffdd80]/30 border-dashed pointer-events-none"
                  />

                  {/* Pulsing visual circles */}
                  <div className={`absolute w-36 h-36 rounded-full border border-[#ffdd80]/15 flex items-center justify-center pointer-events-none ${isPlaying ? 'animate-ping opacity-25' : ''}`} />

                  {/* Channel Name overlay instead of the novel text */}
                  <div className="relative z-10 text-center space-y-1">
                    <span className="text-xs font-bold text-black bg-[#ffb900] px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                      {channelName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Caption text box (fully scrollable, high-contrast) */}
              <div className="text-center space-y-3 px-2">
                <div className="max-h-36 overflow-y-auto pr-2 text-right bg-[#1c1b1f] border border-[#2d2c30] p-4 rounded-3xl">
                  <p id="expanded-post-caption" className="text-sm sm:text-base font-medium leading-relaxed text-[#e3e2e6] whitespace-pre-wrap select-text">
                    {currentPost.text}
                  </p>
                </div>
              </div>

              {/* Progress Seek Bar */}
              <div className="space-y-1">
                <div className="relative">
                  <input
                    id="expanded-seek-slider"
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleProgressChange}
                    className="w-full h-2 bg-[#2d2c30] rounded-lg appearance-none cursor-pointer accent-[#ffb900] transition-colors focus:outline-none"
                    style={{
                      background: `linear-gradient(to left, #ffb900 ${
                        (currentTime / (duration || 1)) * 100
                      }%, #2d2c30 ${(currentTime / (duration || 1)) * 100}%)`,
                    }}
                  />
                </div>
                
                <div className="flex justify-between items-center text-xs text-[#c7c6ca] font-mono dir-ltr px-1">
                  <span id="expanded-duration">{formatTime(duration)}</span>
                  <span id="expanded-current-time" className="text-[#ffb900] font-semibold">{formatTime(currentTime)}</span>
                </div>
              </div>

              {/* Player Main Controls */}
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center justify-center gap-4 sm:gap-6">
                  {/* Previous Item */}
                  <button
                    id="expanded-prev-btn"
                    onClick={onPrevious}
                    className="p-3 text-[#c7c6ca] hover:text-[#ffb900] hover:bg-[#2d2c30] rounded-full transition-all duration-150 active:scale-95"
                    title={appConfig.player_tooltip_prev || "مخکینی فصل واورئ"}
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>

                  {/* Skip Back 15s */}
                  <button
                    id="skip-back-15s-btn"
                    onClick={() => onSkip(-15)}
                    className="p-3 text-[#c7c6ca] hover:text-[#ffb900] hover:bg-[#2d2c30] rounded-full transition-all duration-150 active:scale-95 flex flex-col items-center"
                    title={appConfig.player_tooltip_rewind || "۱۵ ثانیې شاته تلل"}
                  >
                    <RotateCcw className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1 font-mono">15s</span>
                  </button>

                  {/* Play / Pause Toggle - Elevated circular button */}
                  <button
                    id="expanded-toggle-play-btn"
                    onClick={onTogglePlay}
                    className="w-20 h-20 rounded-full bg-[#ffb900] hover:bg-[#e0a300] text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-[#ffdd80]/50"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 fill-black text-black" />
                    ) : (
                      <Play className="w-8 h-8 fill-black text-black ml-1" />
                    )}
                  </button>

                  {/* Skip Forward 15s */}
                  <button
                    id="skip-forward-15s-btn"
                    onClick={() => onSkip(15)}
                    className="p-3 text-[#c7c6ca] hover:text-[#ffb900] hover:bg-[#2d2c30] rounded-full transition-all duration-150 active:scale-95 flex flex-col items-center"
                    title={appConfig.player_tooltip_forward || "۱۵ ثانیې مخکې تلل"}
                  >
                    <RotateCw className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1 font-mono">15s</span>
                  </button>

                  {/* Next Item */}
                  <button
                    id="expanded-next-btn"
                    onClick={onNext}
                    className="p-3 text-[#c7c6ca] hover:text-[#ffb900] hover:bg-[#2d2c30] rounded-full transition-all duration-150 active:scale-95"
                    title={appConfig.player_tooltip_next || "بل فصل واورئ"}
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                </div>

                {/* Speed & Volume Controllers row */}
                <div className="flex items-center justify-between w-full border-t border-[#2d2c30] pt-6 gap-4">
                  {/* Playback Speed Controller with custom popup menu */}
                  <div className="relative shrink-0">
                    <button
                      id="speed-selector-btn"
                      onClick={() => setShowSpeedSelector(!showSpeedSelector)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1c1b1f] border border-[#2d2c30] rounded-2xl text-xs text-[#c7c6ca] hover:text-[#ffb900] hover:border-[#ffb900]/30 transition-all active:scale-95"
                    >
                      <Gauge className="w-4 h-4 text-[#ffb900]" />
                      <span>
                        {appConfig.player_speed_label
                          ? appConfig.player_speed_label.replace('{speed}', speed.toString())
                          : `سرعت: ${speed}x`}
                      </span>
                    </button>

                    <AnimatePresence>
                      {showSpeedSelector && (
                        <>
                          {/* Invisible backdrop clickout handler */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowSpeedSelector(false)}
                          />
                          <motion.div
                            id="speed-selector-dropdown"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-12 right-0 bg-[#1c1b1f] border border-[#2d2c30] rounded-2xl p-2 shadow-2xl z-20 min-w-32 flex flex-col gap-1"
                          >
                            <span className="text-[10px] font-semibold text-[#8e8d91] px-2 py-1 text-center border-b border-[#2d2c30] mb-1">
                              {appConfig.player_speed_title || "د غږ سرعت ټاکل"}
                            </span>
                            {speedOptions.map((opt) => (
                              <button
                                key={opt}
                                id={`speed-option-${opt}`}
                                onClick={() => {
                                  onSpeedChange(opt);
                                  setShowSpeedSelector(false);
                                }}
                                className={`px-3 py-1.5 text-xs text-right rounded-xl transition-colors font-mono ${
                                  speed === opt
                                    ? 'bg-[#ffb900] text-black font-extrabold'
                                    : 'text-[#e3e2e6] hover:bg-[#2d2c30]'
                                }`}
                              >
                                {opt === 1.0
                                  ? (appConfig.player_speed_normal || '1.0x (عادي)')
                                  : `${opt}x`}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Volume Control bar */}
                  <div className="flex items-center gap-2 flex-1 max-w-xs">
                    <button
                      id="toggle-mute-btn"
                      onClick={onToggleMute}
                      className="p-2 text-[#c7c6ca] hover:text-[#ffb900] transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-4.5 h-4.5" />
                      ) : (
                        <Volume2 className="w-4.5 h-4.5" />
                      )}
                    </button>
                    <input
                      id="volume-slider"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#2d2c30] rounded-lg appearance-none cursor-pointer accent-[#ffb900]"
                      style={{
                        background: `linear-gradient(to left, #ffb900 ${
                          (isMuted ? 0 : volume) * 100
                        }%, #2d2c30 ${(isMuted ? 0 : volume) * 100}%)`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Safe area padding */}
            <div className="py-6 bg-[#1c1b1f] border-t border-[#2d2c30] text-center text-[11px] text-[#8e8d91]">
              <p>{appConfig.player_footer_note || "د پاڼې پاڼې غږیز ملګري سره د اورېدو بې ساري خوند واخلئ"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
