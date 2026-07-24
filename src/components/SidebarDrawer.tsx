import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChannelInfo, AppConfig } from '../types';
import {
  X,
  Home,
  History,
  Info,
  Send,
  Share2,
  MessageSquare,
  Check,
  Heart,
  Sliders
} from 'lucide-react';
import { ActiveTab } from './NavigationBar';

interface SidebarDrawerProps {
  channelInfo: ChannelInfo | null;
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  onOpenSettings?: () => void;
  historyCount: number;
  favoritesCount: number;
  isOpen: boolean;
  onClose: () => void;
  appConfig: AppConfig;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  channelInfo,
  activeTab,
  onChangeTab,
  onOpenSettings,
  historyCount,
  favoritesCount,
  isOpen,
  onClose,
  appConfig,
}) => {
  const [copied, setCopied] = useState(false);

  const handleTabClick = (tab: ActiveTab) => {
    onChangeTab(tab);
    onClose();
  };

  const handleShare = () => {
    const shareText = `د ${channelInfo?.name || 'افغان بانډي'} رسمي غږیز کتابتون ناولونه دلته وړیا واورئ!`;
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const appName = channelInfo ? channelInfo.name : 'افغان بانډي';


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-45 cursor-pointer pointer-events-auto"
          />

          {/* Slide-out Sidebar Drawer container from the RIGHT */}
          <motion.div
            id="right-sidebar-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            className="fixed top-0 bottom-0 right-0 w-[280px] sm:w-[310px] bg-[#1c1b1f] border-l border-[#2d2c30] shadow-2xl z-50 flex flex-col text-right justify-between select-none"
          >
            {/* Upper Section */}
            <div className="flex flex-col flex-grow overflow-y-auto">
              
              {/* Header with Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-[#2d2c30]">
                <span className="text-xs font-bold text-[#8e8d91]">څنګ مینو</span>
                <button
                  id="close-sidebar-btn"
                  onClick={onClose}
                  className="p-1.5 hover:bg-[#2d2c30] text-[#c7c6ca] hover:text-white rounded-xl transition-colors cursor-pointer"
                  title="تړل"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cover Image (Horizontal Rectangle) */}
              <div className="p-4">
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#2d2c30] shadow-lg">
                  <img
                    src={(() => {
                      const rawUrl = appConfig.sidebar_cover_url || appConfig.scraped_images?.[0] || "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80";
                      if (rawUrl.includes('telegram') || rawUrl.includes('t.me') || rawUrl.includes('telegram-cdn')) {
                        return `/api/proxy-image?url=${encodeURIComponent(rawUrl)}`;
                      }
                      return rawUrl;
                    })()}
                    alt="Audiobook Library Cover"
                    className="w-full h-full object-cover brightness-[0.85] contrast-[1.05]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#ffb900] rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-white tracking-wide font-mono">AUDIOBOOK PLATFORM</span>
                  </div>
                </div>
              </div>

              {/* App Name Section (Right below the Cover Image) */}
              <div className="px-4 pb-4 text-right">
                <h2 className="text-lg font-black text-[#ffb900] tracking-tight">
                  {appName}
                </h2>
                <p className="text-[11px] text-[#8e8d91] font-mono mt-0.5">@afghan_bandi • د غږیزو کتابونو مرکز</p>
              </div>

              {/* Exact 5 or 6 Buttons (کتابتون برخې او کړنې) */}
              <div className="px-4 space-y-2">
                <span className="text-[10px] font-bold text-[#8e8d91] px-1 block uppercase tracking-wider mb-1">
                  کتابتون برخې او اسانتیاوې
                </span>

                {/* 1. کور پاڼه */}
                <button
                  id="sidebar-btn-home"
                  onClick={() => handleTabClick('home')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-[#ffb900]/15 text-[#ffb900] border border-[#ffb900]/25 font-bold'
                      : 'text-[#c7c6ca] hover:bg-[#2d2c30] border border-transparent'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>{appConfig.tab_home}</span>
                </button>

                {/* تنظیمات (Settings) */}
                {onOpenSettings && (
                  <button
                    id="sidebar-btn-settings"
                    onClick={() => {
                      onClose();
                      onOpenSettings();
                    }}
                    className="w-full flex items-center justify-between p-3 text-[#ffb900] bg-[#ffb900]/10 hover:bg-[#ffb900]/20 rounded-xl transition-all cursor-pointer font-bold border border-[#ffb900]/20"
                  >
                    <Sliders className="w-4 h-4 text-[#ffb900]" />
                    <span>تنظیمات (Settings)</span>
                  </button>
                )}

                {/* خوښ شوي غږونه (Favorites) */}
                <button
                  id="sidebar-btn-favorites"
                  onClick={() => handleTabClick('favorites')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'favorites'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/25 font-bold'
                      : 'text-[#c7c6ca] hover:bg-[#2d2c30] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
                    {favoritesCount > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                        {favoritesCount}
                      </span>
                    )}
                  </div>
                  <span>{appConfig.tab_favorites}</span>
                </button>

                {/* 2. غږیزه تاریخچه */}
                <button
                  id="sidebar-btn-history"
                  onClick={() => handleTabClick('history')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-[#ffb900]/15 text-[#ffb900] border border-[#ffb900]/25 font-bold'
                      : 'text-[#c7c6ca] hover:bg-[#2d2c30] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <History className="w-4 h-4" />
                    {historyCount > 0 && (
                      <span className="bg-[#ffb900] text-black text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                        {historyCount}
                      </span>
                    )}
                  </div>
                  <span>{appConfig.tab_history}</span>
                </button>

                {/* 3. زموږ په اړه */}
                <button
                  id="sidebar-btn-about"
                  onClick={() => handleTabClick('about')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'about'
                      ? 'bg-[#ffb900]/15 text-[#ffb900] border border-[#ffb900]/25 font-bold'
                      : 'text-[#c7c6ca] hover:bg-[#2d2c30] border border-transparent'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  <span>{appConfig.tab_about}</span>
                </button>

                {/* 4. رسمي ټلیګرام چینل */}
                <a
                  id="sidebar-btn-telegram"
                  href="https://t.me/obaidapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 text-[#c7c6ca] hover:bg-[#2d2c30] rounded-xl transition-all border border-transparent"
                >
                  <Send className="w-4 h-4 -rotate-45 text-[#ffb900]" />
                  <span>د اپلیکیشنونو ټلیګرام چینل</span>
                </a>


                {/* 5. ملګرو سره شریکول */}
                <button
                  id="sidebar-btn-share"
                  onClick={handleShare}
                  className="w-full flex items-center justify-between p-3 text-[#c7c6ca] hover:bg-[#2d2c30] rounded-xl transition-all cursor-pointer border border-transparent"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Share2 className="w-4 h-4 text-[#ffb900]" />
                  )}
                  <span>
                    {copied ? 'کاپي شو! ✓' : 'ملګرو سره شریکول'}
                  </span>
                </button>

                {/* 6. مرسته او تماس */}
                <button
                  id="sidebar-btn-contact"
                  onClick={() => handleTabClick('about')}
                  className="w-full flex items-center justify-between p-3 text-[#c7c6ca] hover:bg-[#2d2c30] rounded-xl transition-all cursor-pointer border border-transparent"
                >
                  <MessageSquare className="w-4 h-4 text-[#ffb900]" />
                  <span>مرسته او تماس</span>
                </button>
              </div>

            </div>

            {/* Footer with Copyright Details */}
            <div className="p-4 border-t border-[#2d2c30] bg-[#232125]">
              <p className="text-[11px] text-center text-[#8e8d91] leading-relaxed select-text">
                د اپلیکیشن ټول حقوق له{' '}
                <span
                  onClick={() => handleTabClick('about')}
                  className="text-[#ffb900] font-bold hover:text-[#e0a300] hover:underline cursor-pointer transition-colors"
                >
                  جوړونکي
                </span>{' '}
                سره خوندي دي.
              </p>
              <p className="text-[9px] text-center text-[#8e8d91]/60 font-mono mt-1">
                افغان بانډي رسمي غږیز بستر © ۲۰۲۶
              </p>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
