import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Post, ChannelInfo, PlaybackProgress, AppConfig } from './types';
import { DEFAULT_APP_CONFIG, FALLBACK_CHANNEL_INFO, FALLBACK_POSTS } from './constants';
import { getApiUrl } from './utils';
import { Toolbar } from './components/Toolbar';
import { NavigationBar, ActiveTab } from './components/NavigationBar';
import { SidebarDrawer } from './components/SidebarDrawer';
import { ContinueRow } from './components/ContinueRow';
import { PostList } from './components/PostList';
import { HistoryTab } from './components/HistoryTab';
import { AboutTab } from './components/AboutTab';
import { FavoritesTab } from './components/FavoritesTab';
import { AudioPlayer } from './components/AudioPlayer';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { SkeletonLoader } from './components/SkeletonLoader';
import { AlertCircle, Copy, Check, RefreshCw, Server, Globe } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Splash & Onboarding States
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Application Data States
  const [channelInfo, setChannelInfo] = useState<ChannelInfo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_APP_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [copied, setCopied] = useState(false);
  
  // Custom server settings state
  const [customBackend, setCustomBackend] = useState(() => {
    try {
      return localStorage.getItem('pashto_novel_backend_url') || '';
    } catch (e) {
      return '';
    }
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Playback & Audio Control States
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  // Saved progress list (loaded from localStorage on start)
  const [progressList, setProgressList] = useState<Record<string, PlaybackProgress>>({});
  const [favorites, setFavorites] = useState<string[]>([]);

  // Audio HTML5 reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Helper to process raw posts list, extract JSON config if any, and filter it out from playlist
  const processAndExtractConfig = (rawPosts: Post[]) => {
    let foundConfig = { ...DEFAULT_APP_CONFIG };
    
    const filtered = rawPosts.filter(post => {
      if (post.text && post.text.includes('{') && post.text.includes('}')) {
        try {
          const startIdx = post.text.indexOf('{');
          const endIdx = post.text.lastIndexOf('}');
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const jsonStr = post.text.substring(startIdx, endIdx + 1);
            const parsed = JSON.parse(jsonStr);
            if (parsed && typeof parsed === 'object') {
              foundConfig = { ...foundConfig, ...parsed };
              if (post.images && post.images.length > 0) {
                foundConfig.scraped_images = post.images;
              }
              return false; // exclude this config post from audio listings
            }
          }
        } catch (e) {
          // Not valid JSON or other error, treat as regular post
        }
      }
      
      // Only allow posts that contain a valid, non-empty audio file URL
      if (!post.audio_url || post.audio_url.trim() === '') {
        return false;
      }

      return true;
    });

    return { filteredPosts: filtered, extractedConfig: foundConfig };
  };

  const fetchData = async (force: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const forceParam = force ? '?force=true' : '';
      const [channelRes, postsRes] = await Promise.all([
        fetch(getApiUrl(`/api/channel-info${forceParam}`)),
        fetch(getApiUrl(`/api/posts${forceParam}`)),
      ]);

      if (!channelRes.ok || !postsRes.ok) {
        throw new Error(`د سرور خطا: د چینل ځواب حالت: ${channelRes.status} (${channelRes.statusText})، د خپرونو ځواب حالت: ${postsRes.status} (${postsRes.statusText})`);
      }

      const channelData = (await channelRes.json()) as ChannelInfo;
      const postsData = (await postsRes.json()) as Post[];

      // Check if the service worker returned the offline fallback json
      if ((channelData as any).isOffline || (postsData as any).isOffline) {
        setIsOnline(false);
        // Try to load full backups from localStorage if available
        const localPosts = localStorage.getItem('pashto_cached_posts');
        const localChannel = localStorage.getItem('pashto_cached_channel');
        if (localPosts && localChannel) {
          const rawLocalPosts = JSON.parse(localPosts) as Post[];
          const { filteredPosts, extractedConfig } = processAndExtractConfig(rawLocalPosts);
          setPosts(filteredPosts);
          setAppConfig(extractedConfig);
          setChannelInfo(JSON.parse(localChannel));
        } else {
          const { filteredPosts, extractedConfig } = processAndExtractConfig(FALLBACK_POSTS);
          setPosts(filteredPosts);
          setAppConfig(extractedConfig);
          setChannelInfo(FALLBACK_CHANNEL_INFO);
        }
        setLoading(false);
        return;
      } else {
        // Keep a fresh backup in localStorage
        localStorage.setItem('pashto_cached_posts', JSON.stringify(postsData));
        localStorage.setItem('pashto_cached_channel', JSON.stringify(channelData));
        setIsOnline(true);
      }

      const { filteredPosts, extractedConfig } = processAndExtractConfig(postsData);
      setChannelInfo(channelData);
      setPosts(filteredPosts);
      setAppConfig(extractedConfig);
    } catch (err: any) {
      console.error('Fetch error:', err);
      
      // Construct exact descriptive diagnostic error
      const postsUrl = getApiUrl('/api/posts');
      const channelUrl = getApiUrl('/api/channel-info');
      const errName = err?.name || 'NetworkError';
      const errMsg = err?.message || err?.toString() || 'Failed to fetch';
      const savedServer = localStorage.getItem('pashto_novel_backend_url') || 'د سټوډیو اصلي سرور';
      const detailInfo = `خطا (Error Type): ${errName}\nتفصیل (Message): ${errMsg}\nد چینل لینک (Channel API): ${channelUrl}\nد کتابونو لینک (Posts API): ${postsUrl}\nټاکل شوی د سرور ادرس (Active Backend URL): ${savedServer}\nوخت (Timestamp): ${new Date().toISOString()}\nمجموعه سیستم (User Agent): ${navigator.userAgent}`;
      setError(detailInfo);

      // Load cached or fallback data so the user can still use the audio app
      const localPosts = localStorage.getItem('pashto_cached_posts');
      const localChannel = localStorage.getItem('pashto_cached_channel');
      if (localPosts && localChannel) {
        try {
          const rawLocalPosts = JSON.parse(localPosts) as Post[];
          const { filteredPosts, extractedConfig } = processAndExtractConfig(rawLocalPosts);
          setPosts(filteredPosts);
          setAppConfig(extractedConfig);
          setChannelInfo(JSON.parse(localChannel));
        } catch (e) {
          const { filteredPosts, extractedConfig } = processAndExtractConfig(FALLBACK_POSTS);
          setPosts(filteredPosts);
          setAppConfig(extractedConfig);
          setChannelInfo(FALLBACK_CHANNEL_INFO);
        }
      } else {
        const { filteredPosts, extractedConfig } = processAndExtractConfig(FALLBACK_POSTS);
        setPosts(filteredPosts);
        setAppConfig(extractedConfig);
        setChannelInfo(FALLBACK_CHANNEL_INFO);
      }
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  };

  // 1. Initial Data Fetching (Channel Info & Posts list)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetchData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 2. Load progress history from localStorage on start
  useEffect(() => {
    const loadedProgress: Record<string, PlaybackProgress> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pashto_audio_progress_')) {
        try {
          const val = localStorage.getItem(key);
          if (val) {
            const progressObj = JSON.parse(val) as PlaybackProgress;
            loadedProgress[progressObj.postId] = progressObj;
          }
        } catch (e) {
          console.error('Error loading progress key:', key, e);
        }
      }
    }
    setProgressList(loadedProgress);

    try {
      const savedFavs = localStorage.getItem('pashto_audio_favorites');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs) as string[]);
      }
    } catch (e) {
      console.error('Error loading favorites:', e);
    }

    const onboardingCompleted = localStorage.getItem('pashto_onboarding_completed') === 'true';
    setShowOnboarding(!onboardingCompleted);
  }, []);

  // 3. Audio Rate and Volume Synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // 4. Playback Actions
  // Helper functions for safe, non-overlapping play/pause controls to resolve interruptions
  const safePlay = () => {
    if (!audioRef.current) return;

    // Do not attempt to play if src is empty
    if (!audioRef.current.src || audioRef.current.src === window.location.href) {
      return;
    }

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromiseRef.current = playPromise;
      playPromise
        .then(() => {
          if (playPromiseRef.current === playPromise) {
            setIsPlaying(true);
          }
        })
        .catch((err) => {
          // Silently handle AbortError to prevent interrupting error messages
          if (err && err.name !== 'AbortError') {
            console.error('Playback error:', err);
          }
        });
    } else {
      setIsPlaying(true);
    }
  };

  const safePause = () => {
    if (!audioRef.current) return;
    setIsPlaying(false);

    const playPromise = playPromiseRef.current;
    if (playPromise) {
      playPromise
        .then(() => {
          if (playPromiseRef.current === playPromise && audioRef.current) {
            audioRef.current.pause();
          }
        })
        .catch(() => {
          if (playPromiseRef.current === playPromise && audioRef.current) {
            audioRef.current.pause();
          }
        });
    } else {
      audioRef.current.pause();
    }
  };

  const handlePlayPost = (post: Post, startAtTime?: number) => {
    if (!audioRef.current) return;

    const isSame = currentPost?.id === post.id;
    const streamUrl = getApiUrl(`/api/posts/${post.id}/stream`);

    if (!isSame) {
      // Pause any active playback safely first
      safePause();

      setCurrentPost(post);
      audioRef.current.src = streamUrl;
      audioRef.current.load();

      // Listen for metadata to seek and play smoothly
      const onMetadata = () => {
        if (!audioRef.current) return;

        let seekTo = 0;
        if (startAtTime !== undefined) {
          seekTo = startAtTime;
        } else {
          // Check local progress list
          const saved = progressList[post.id];
          if (saved && saved.currentTime > 2 && saved.percentage < 98) {
            seekTo = saved.currentTime;
          }
        }

        audioRef.current.currentTime = seekTo;
        audioRef.current.playbackRate = speed;
        audioRef.current.volume = isMuted ? 0 : volume;

        safePlay();

        audioRef.current.removeEventListener('loadedmetadata', onMetadata);
      };

      audioRef.current.addEventListener('loadedmetadata', onMetadata);
    } else {
      // Toggle play for current audio source
      if (isPlaying) {
        safePause();
      } else {
        safePlay();
      }
    }
  };

  const handlePausePost = () => {
    safePause();
  };

  // 5. Time and metadata update event handlers
  const handleTimeUpdate = () => {
    if (!audioRef.current || !currentPost) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 0;

    setCurrentTime(current);
    if (dur > 0) {
      setDuration(dur);
    }

    // Save progress to local state & localStorage periodically
    if (Math.abs(current - lastSavedTimeRef.current) >= 1.5 || current === 0 || current === dur) {
      lastSavedTimeRef.current = current;

      const percentage = dur > 0 ? (current / dur) * 100 : 0;
      const progressItem: PlaybackProgress = {
        postId: currentPost.id,
        currentTime: current,
        duration: dur,
        percentage,
        updatedAt: new Date().toISOString(),
      };

      setProgressList((prev) => ({
        ...prev,
        [currentPost.id]: progressItem,
      }));

      localStorage.setItem(`pashto_audio_progress_${currentPost.id}`, JSON.stringify(progressItem));
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      if (dur > 0) {
        setDuration(dur);
      }
    }
  };

  // 6. Navigate Next / Previous tracks
  const handleNext = () => {
    if (!currentPost || posts.length === 0) return;
    const currentIndex = posts.findIndex((p) => p.id === currentPost.id);
    if (currentIndex !== -1 && currentIndex + 1 < posts.length) {
      handlePlayPost(posts[currentIndex + 1]);
    } else {
      // Loop to beginning
      handlePlayPost(posts[0]);
    }
  };

  const handlePrevious = () => {
    if (!currentPost || posts.length === 0) return;
    const currentIndex = posts.findIndex((p) => p.id === currentPost.id);
    if (currentIndex !== -1 && currentIndex - 1 >= 0) {
      handlePlayPost(posts[currentIndex - 1]);
    } else {
      // Loop to end
      handlePlayPost(posts[posts.length - 1]);
    }
  };

  // Skip time forward or backward (+/- 15s)
  const handleSkip = (offset: number) => {
    if (!audioRef.current) return;
    let newTime = audioRef.current.currentTime + offset;
    if (newTime < 0) newTime = 0;
    if (newTime > duration) newTime = duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Completely stops and dismisses the audio player
  const handleDismissPlayer = () => {
    safePause();
    if (audioRef.current) {
      audioRef.current.src = '';
    }
    setCurrentPost(null);
    setCurrentTime(0);
    setDuration(0);
  };

  // Clear playback progress
  const handleClearProgress = (postId: string) => {
    localStorage.removeItem(`pashto_audio_progress_${postId}`);
    setProgressList((prev) => {
      const updated = { ...prev };
      delete updated[postId];
      return updated;
    });
  };

  // Clear all playback progress
  const handleClearAllProgress = () => {
    if (window.confirm('ایا یقین لرئ چې غواړئ ټوله تاریخچه او پرمختګ پاک کړئ؟')) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('pashto_audio_progress_')) {
          localStorage.removeItem(key);
        }
      }
      setProgressList({});
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = (postId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      localStorage.setItem('pashto_audio_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Clear all favorite items
  const handleClearAllFavorites = () => {
    if (window.confirm('ایا یقین لرئ چې غواړئ ټول خوښ شوي غږونه پاک کړئ؟')) {
      localStorage.removeItem('pashto_audio_favorites');
      setFavorites([]);
    }
  };

  // Count items with active progress > 2s
  const activeProgressCount = (Object.values(progressList) as PlaybackProgress[]).filter(
    (item) => item.currentTime > 2
  ).length;

  // Refs for Media Session to avoid constant re-registration of action handlers
  const currentPostRef = useRef(currentPost);
  const handlePlayPostRef = useRef(handlePlayPost);
  const handlePausePostRef = useRef(handlePausePost);
  const handlePreviousRef = useRef(handlePrevious);
  const handleNextRef = useRef(handleNext);
  const handleSkipRef = useRef(handleSkip);
  const handleSeekRef = useRef(handleSeek);
  const handleDismissPlayerRef = useRef(handleDismissPlayer);

  useEffect(() => {
    currentPostRef.current = currentPost;
    handlePlayPostRef.current = handlePlayPost;
    handlePausePostRef.current = handlePausePost;
    handlePreviousRef.current = handlePrevious;
    handleNextRef.current = handleNext;
    handleSkipRef.current = handleSkip;
    handleSeekRef.current = handleSeek;
    handleDismissPlayerRef.current = handleDismissPlayer;
  });

  // 7. Browser Media Session API Integration
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentPost) return;

    try {
      if ('MediaMetadata' in window) {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: currentPost.title,
          artist: channelInfo ? channelInfo.title : 'افغان بانډي',
          album: 'پښتو غږیزې لیکنې',
          artwork: currentPost.coverUrl ? [
            { src: currentPost.coverUrl, sizes: '96x96', type: 'image/jpeg' },
            { src: currentPost.coverUrl, sizes: '128x128', type: 'image/jpeg' },
            { src: currentPost.coverUrl, sizes: '192x192', type: 'image/jpeg' },
            { src: currentPost.coverUrl, sizes: '256x256', type: 'image/jpeg' },
            { src: currentPost.coverUrl, sizes: '384x384', type: 'image/jpeg' },
            { src: currentPost.coverUrl, sizes: '512x512', type: 'image/jpeg' },
          ] : [
            { src: '/logo.png', sizes: '512x512', type: 'image/png' }
          ]
        });
      }
    } catch (e) {
      console.error('Error setting media session metadata:', e);
    }
  }, [currentPost, channelInfo]);

  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentPost) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying, currentPost]);

  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentPost) return;

    if (duration > 0 && currentTime >= 0 && currentTime <= duration) {
      try {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: speed || 1.0,
          position: currentTime,
        });
      } catch (e) {
        console.warn('Error setting media session position state:', e);
      }
    }
  }, [currentTime, duration, speed, currentPost]);

  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentPost) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        if (currentPostRef.current) {
          handlePlayPostRef.current(currentPostRef.current);
        }
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        handlePausePostRef.current();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePreviousRef.current();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleNextRef.current();
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 15;
        handleSkipRef.current(-offset);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 15;
        handleSkipRef.current(offset);
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          handleSeekRef.current(details.seekTime);
        }
      });
      navigator.mediaSession.setActionHandler('stop', () => {
        handleDismissPlayerRef.current();
      });
    } catch (e) {
      console.warn('Error setting media session action handlers:', e);
    }

    return () => {
      if (!('mediaSession' in navigator)) return;
      const actions = ['play', 'pause', 'previoustrack', 'nexttrack', 'seekbackward', 'seekforward', 'seekto', 'stop'];
      actions.forEach((action) => {
        try {
          navigator.mediaSession.setActionHandler(action as any, null);
        } catch (e) {
          // ignore
        }
      });
    };
  }, [currentPost]);

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen
          key="splash"
          appName={channelInfo ? channelInfo.name : 'افغان بانډي'}
          onFinish={() => setShowSplash(false)}
        />
      ) : showOnboarding ? (
        <OnboardingScreen
          key="onboarding"
          appName={channelInfo ? channelInfo.name : 'افغان بانډي'}
          appConfig={appConfig}
          onComplete={() => {
            localStorage.setItem('pashto_onboarding_completed', 'true');
            setShowOnboarding(false);
          }}
        />
      ) : (
        <div id="app-root-container" dir="rtl" className="min-h-screen bg-[#121214] font-sans select-none antialiased text-[#e3e2e6] relative overflow-x-hidden">
          {/* Sidebar Drawer - Renders outside the pushed container at full size pinned to the right edge */}
          <SidebarDrawer
            channelInfo={channelInfo}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            historyCount={activeProgressCount}
            favoritesCount={favorites.length}
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            appConfig={appConfig}
          />

          {/* HTML5 Audio Player Element */}
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleNext}
            className="hidden"
          />

          {/* Push-style master container wrapper */}
          <motion.div
            id="pushed-content-wrapper"
            animate={drawerOpen ? {
              scale: 0.90,
              x: -270, // shift left to leave room for the drawer
              borderRadius: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            } : {
              scale: 1,
              x: 0,
              borderRadius: '0px',
              boxShadow: 'none',
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="min-h-screen w-full bg-[#121214] pb-44 flex flex-col relative origin-center"
          >
            {/* Click-catcher overlay inside the pushed container when drawer is open */}
            {drawerOpen && (
              <div
                id="pushed-click-catcher"
                onClick={() => setDrawerOpen(false)}
                className="absolute inset-0 z-50 cursor-pointer bg-black/10 hover:bg-black/25 transition-colors duration-250 rounded-[24px]"
                title="تړل"
              />
            )}

            {/* Modern Sticky Top Toolbar */}
            <Toolbar
              channelInfo={channelInfo}
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              onOpenDrawer={() => setDrawerOpen(true)}
              loading={loading}
              appConfig={appConfig}
            />

            {/* Main Content Area */}
            <main className="py-4 flex-grow">
              {activeTab === 'home' && (
                <div className="space-y-6">
                  {/* Offline Status Info Banner */}
                  {!isOnline && (
                    <div id="offline-status-banner" className="max-w-4xl mx-auto px-4 sm:px-6">
                      <div className="flex items-center justify-between gap-3 bg-[#231a0e] text-[#ffb900] p-4 rounded-3xl border border-[#ffb900]/20 shadow-md">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5 mr-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb900] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ffb900]"></span>
                          </span>
                          <p className="text-xs font-bold text-right">{appConfig.app_offline_desc || "تاسو په افلاین حالت کې یاست. خلاصې شوې خپرونې د اورېدو وړ دي."}</p>
                        </div>
                        <span className="text-[10px] bg-[#ffb900]/15 text-[#ffb900] px-2.5 py-1 rounded-full font-extrabold shrink-0 select-none">
                          {appConfig.app_offline_badge || "افلاین حالت"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Continue Listening Row */}
                  {!loading && !error && posts.length > 0 && (
                    <ContinueRow
                      posts={posts}
                      progressList={progressList}
                      onPlayPost={handlePlayPost}
                      onClearProgress={handleClearProgress}
                      appConfig={appConfig}
                    />
                  )}

                  {/* Global Loading Skeleton instead of generic spinner */}
                  {loading && (
                    <SkeletonLoader />
                  )}

                  {/* Global Error Banner */}
                  {error && !loading && (
                    <div id="main-error-banner" className="max-w-4xl mx-auto px-4 sm:px-6">
                      <div className="bg-[#241313] text-[#ffb4ab] p-6 rounded-[28px] border border-[#ffb4ab]/20 shadow-xl space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-[#ffb4ab]/10 rounded-2xl text-[#ffb4ab] shrink-0 mt-0.5">
                              <AlertCircle className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                              <h4 className="font-bold text-base text-[#ffdad6]">{appConfig.app_error_title || "د سرور سره د پیوستون تېروتنه!"}</h4>
                              <p className="text-xs text-[#ffb4ab]/80 mt-1 leading-relaxed">
                                غوښتنلیک نشي کولی د اصلي غږیز سرور سره ونښلي. لاندې د دې تېروتنې دقیق تخنیکي معلومات کاپي کړئ او زموږ سره یې د حل کولو لپاره واټساپ یا ټیلیګرام کې شریک کړئ.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Exact Error details container with scroll */}
                        <div className="space-y-1.5 text-right">
                          <span className="text-[10px] font-bold text-[#ffb4ab]/60 uppercase tracking-wider block">د خطا دقیق تخنیکي جزییات:</span>
                          <div dir="ltr" className="bg-[#140b0b] rounded-2xl p-4 border border-[#ffb4ab]/10 max-h-48 overflow-y-auto text-left font-mono text-[11px] leading-relaxed text-[#ffdad6]/90 select-text whitespace-pre-wrap break-all shadow-inner">
                            {error}
                          </div>
                        </div>

                        {/* Custom Server Configuration panel for Android/Mobile WebViews or custom backends */}
                        <div className="bg-[#1c0d0d] rounded-2xl p-4 border border-[#ffb4ab]/10 text-right space-y-3">
                          <div className="flex items-center justify-between gap-2 border-b border-[#ffb4ab]/10 pb-2 flex-row-reverse">
                            <span className="text-xs font-bold text-[#ffdad6] flex items-center gap-1.5 flex-row-reverse">
                              <Server className="w-4 h-4 text-[#ffb4ab]" />
                              <span>د سرور لاسي تنظیم (Server Configuration)</span>
                            </span>
                            <span className="text-[9px] bg-[#ffb4ab]/10 text-[#ffb4ab] px-2 py-0.5 rounded-full font-bold">
                              {customBackend ? "لاسي تنظیم شوی" : "اصلي سټوډیو"}
                            </span>
                          </div>
                          
                          <p className="text-[11px] text-[#ffb4ab]/80 leading-relaxed">
                            که غوښتنلیک ستاسو په ټلیفون کې کار نه کوي، تاسو کولی شئ دلته د خپل ځایي کمپیوټر IP پته (لکه <code className="bg-[#241313] px-1 py-0.5 rounded font-mono text-[10px] text-[#ffdad6]">http://192.168.1.100:3000</code>) یا بل سرور ولیکئ ترڅو ورسره وصل شي:
                          </p>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              dir="ltr"
                              value={customBackend}
                              onChange={(e) => setCustomBackend(e.target.value)}
                              placeholder="https://example.com or http://192.168.1.5:3000"
                              className="w-full bg-[#140b0b] text-[#ffdad6] border border-[#ffb4ab]/20 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#ffb4ab] focus:ring-1 focus:ring-[#ffb4ab] transition-all text-left"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1 justify-end">
                            {customBackend && (
                              <button
                                onClick={() => {
                                  try {
                                    localStorage.removeItem('pashto_novel_backend_url');
                                    setCustomBackend('');
                                    setSaveSuccess(true);
                                    setTimeout(() => setSaveSuccess(false), 2000);
                                    // Trigger reload
                                    setTimeout(() => fetchData(), 200);
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }}
                                className="px-3 py-1.5 bg-[#40000a] hover:bg-[#5c0012] text-[#ffdad6] font-bold text-[10px] rounded-lg transition-all active:scale-95"
                              >
                                اصلي سرور ته پرېښودل (Reset to Default)
                              </button>
                            )}
                            
                            <button
                              onClick={() => {
                                try {
                                  const trimmed = customBackend.trim();
                                  if (trimmed) {
                                    localStorage.setItem('pashto_novel_backend_url', trimmed);
                                    setSaveSuccess(true);
                                    setTimeout(() => setSaveSuccess(false), 2000);
                                    // Trigger reload
                                    setTimeout(() => fetchData(), 200);
                                  } else {
                                    localStorage.removeItem('pashto_novel_backend_url');
                                    setSaveSuccess(true);
                                    setTimeout(() => setSaveSuccess(false), 2000);
                                    setTimeout(() => fetchData(), 200);
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="px-3 py-1.5 bg-[#ffb4ab] hover:bg-[#ffdad6] text-[#690005] font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 active:scale-95"
                            >
                              {saveSuccess ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>خوندي شو! (Saved)</span>
                                </>
                              ) : (
                                <span>سرور خوندي کول (Save Server)</span>
                              )}
                            </button>
                          </div>
                          
                          {/* Common presets helper */}
                          <div className="pt-1 border-t border-[#ffb4ab]/5 flex flex-wrap items-center gap-1.5 justify-start text-[10px] text-[#ffb4ab]/60 flex-row-reverse">
                            <span className="font-bold">ځایي وړاندیزونه (Presets):</span>
                            <button
                              onClick={() => {
                                setCustomBackend('http://10.0.2.2:3000');
                              }}
                              className="underline hover:text-[#ffdad6] font-mono"
                            >
                              10.0.2.2:3000 (Android Emulator)
                            </button>
                            <span className="text-[#ffb4ab]/30">•</span>
                            <button
                              onClick={() => {
                                setCustomBackend('http://localhost:3000');
                              }}
                              className="underline hover:text-[#ffdad6] font-mono"
                            >
                              localhost:3000
                            </button>
                          </div>
                        </div>

                        {/* Interactive action buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-1 justify-end">
                          <button
                            onClick={async () => {
                              try {
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                  await navigator.clipboard.writeText(error);
                                } else {
                                  // Fallback text copy for older WebView or strict iFrames
                                  const textarea = document.createElement('textarea');
                                  textarea.value = error;
                                  textarea.style.position = 'fixed';
                                  document.body.appendChild(textarea);
                                  textarea.focus();
                                  textarea.select();
                                  document.execCommand('copy');
                                  document.body.removeChild(textarea);
                                }
                                setCopied(true);
                                setTimeout(() => setCopied(false), 3000);
                              } catch (err) {
                                alert('کاپي نشوه، مهرباني وکړئ متن په مستقیم ډول وټاکئ او کاپي یې کړئ.');
                              }
                            }}
                            className="px-4 py-2.5 bg-[#ffb4ab] hover:bg-[#ffdad6] text-[#690005] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shrink-0 active:scale-95"
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4 shrink-0 animate-bounce" />
                                <span>کاپي شوه! (Copied)</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 shrink-0" />
                                <span>د تېروتنې معلومات کاپي کړئ</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={fetchData}
                            className="px-4 py-2.5 bg-[#40000a] hover:bg-[#5c0012] text-[#ffdad6] border border-[#ffb4ab]/30 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                          >
                            <RefreshCw className="w-4 h-4 shrink-0" />
                            <span>بیا هڅه وکړئ (Retry)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feed of Audio Novel Posts */}
                  {!loading && !error && (
                    <PostList
                      posts={posts}
                      currentPlayingPost={currentPost}
                      isPlaying={isPlaying}
                      progressList={progressList}
                      favorites={favorites}
                      onPlayPost={(p) => handlePlayPost(p)}
                      onPausePost={handlePausePost}
                      onToggleFavorite={handleToggleFavorite}
                      appConfig={appConfig}
                      onRefresh={() => fetchData(true)}
                      isRefreshing={loading}
                    />
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <HistoryTab
                  posts={posts}
                  progressList={progressList}
                  onPlayPost={handlePlayPost}
                  onClearProgress={handleClearProgress}
                  onClearAllProgress={handleClearAllProgress}
                  appConfig={appConfig}
                />
              )}

              {activeTab === 'favorites' && (
                <FavoritesTab
                  posts={posts}
                  favorites={favorites}
                  currentPlayingPost={currentPost}
                  isPlaying={isPlaying}
                  progressList={progressList}
                  onPlayPost={handlePlayPost}
                  onPausePost={handlePausePost}
                  onToggleFavorite={handleToggleFavorite}
                  onClearAllFavorites={handleClearAllFavorites}
                  onChangeTab={setActiveTab}
                  appConfig={appConfig}
                />
              )}

              {activeTab === 'about' && (
                <AboutTab channelInfo={channelInfo} appConfig={appConfig} />
              )}
            </main>

            {/* Material 3 Bottom Drawer Floating Player Controls */}
            <AudioPlayer
              currentPost={currentPost}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              speed={speed}
              volume={volume}
              isMuted={isMuted}
              onTogglePlay={() => handlePlayPost(currentPost!)}
              onSeek={handleSeek}
              onSkip={handleSkip}
              onSpeedChange={setSpeed}
              onVolumeChange={setVolume}
              onToggleMute={() => setIsMuted(!isMuted)}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onDismiss={handleDismissPlayer}
              appConfig={appConfig}
              channelName={channelInfo?.name || "افغان بانډي"}
            />

            {/* Floating Bottom Navigation Bar */}
            <NavigationBar
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              historyCount={activeProgressCount}
              favoritesCount={favorites.length}
              appConfig={appConfig}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
