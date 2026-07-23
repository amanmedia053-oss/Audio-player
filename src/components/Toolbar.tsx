import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChannelInfo, AppConfig } from '../types';
import {
  Menu,
  MoreVertical,
  Send,
  Share2,
  Info,
  CheckCircle2
} from 'lucide-react';
import { ActiveTab } from './NavigationBar';

interface ToolbarProps {
  channelInfo: ChannelInfo | null;
  activeTab?: ActiveTab;
  onChangeTab?: (tab: ActiveTab) => void;
  onOpenDrawer: () => void;
  loading?: boolean;
  appConfig: AppConfig;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  channelInfo,
  activeTab,
  onChangeTab,
  onOpenDrawer,
  loading,
  appConfig,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const shareText = `د افغان بانډي د رسمي غږیز کتابتون ناولونه دلته وړیا واورئ!`;
    const shareUrl = window.location.href;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setShowMoreMenu(false);
  };

  const handleTabClick = (tab: ActiveTab) => {
    if (onChangeTab) {
      onChangeTab(tab);
    }
  };

  return (
    <nav
      id="top-toolbar"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
      className="sticky top-0 z-30 w-full bg-[#1c1b1f]/95 backdrop-blur-md border-b border-[#2d2c30] px-4 pb-3 sm:px-6 shadow-md transition-all duration-300"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        
        {/* Right Side (RTL Start): Sidebar Hamburger Menu Button, Logo and App Name */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburger Menu Icon */}
          <button
            id="sidebar-toggle-btn"
            onClick={onOpenDrawer}
            className="p-2 bg-[#2d2c30] hover:bg-[#3d3c40] text-[#c7c6ca] hover:text-[#ffb900] rounded-xl transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
            title={appConfig.toolbar_menu_tooltip || "مینو"}
          >
            <Menu className="w-5 h-5" />
          </button>



          {/* App Name */}
          {loading || !channelInfo ? (
            <div className="h-5 w-24 bg-[#2d2c30] rounded-lg animate-pulse" />
          ) : (
            <span
              id="toolbar-brand-title"
              className="text-sm sm:text-base font-extrabold text-[#ffb900] truncate tracking-tight select-text"
            >
              {channelInfo.name}
            </span>
          )}
        </div>

        {/* Left Side (RTL End): Three-dots Menu icon & its dropdown actions */}
        <div className="relative flex items-center gap-2">
          <button
            id="three-dots-menu-btn"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 bg-[#2d2c30] hover:bg-[#3d3c40] text-[#c7c6ca] hover:text-[#ffb900] rounded-xl transition-all duration-200 active:scale-95 cursor-pointer"
            title={appConfig.toolbar_more_tooltip || "نور غوراوي"}
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Dropdown Menu Overlay */}
          <AnimatePresence>
            {showMoreMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMoreMenu(false)}
                />
                <motion.div
                  id="more-menu-dropdown"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 top-10 bg-[#1c1b1f] border border-[#2d2c30] rounded-2xl p-2.5 shadow-2xl z-20 min-w-[200px] flex flex-col gap-1 text-right"
                >
                  <span className="text-[10px] font-semibold text-[#8e8d91] px-2.5 py-1 border-b border-[#2d2c30] mb-1">
                    {appConfig.toolbar_quick_options || "چټک غوراوي"}
                  </span>

                  {/* Copy link */}
                  <button
                    id="more-menu-share-btn"
                    onClick={handleShare}
                    className="flex items-center justify-between px-3 py-2 text-xs text-[#e3e2e6] hover:bg-[#2d2c30] rounded-xl transition-colors text-right cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 font-mono text-xs">
                      {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4 text-[#ffb900]" />}
                    </span>
                    <span className="font-medium">{appConfig.toolbar_share_copy || "شریکول او کاپي"}</span>
                  </button>

                  {/* Join telegram */}
                  <a
                    id="more-menu-telegram-link"
                    href={appConfig.about_telegram_url || "https://t.me/afghan_bandi"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMoreMenu(false)}
                    className="flex items-center justify-between px-3 py-2 text-xs text-[#e3e2e6] hover:bg-[#2d2c30] rounded-xl transition-colors text-right"
                  >
                    <Send className="w-4 h-4 text-[#ffb900] -rotate-45" />
                    <span className="font-medium">{appConfig.toolbar_telegram_channel || "رسمي ټلیګرام چینل"}</span>
                  </a>

                  {/* App Info Tab link */}
                  <button
                    id="more-menu-info-btn"
                    onClick={() => {
                      handleTabClick('about');
                      setShowMoreMenu(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 text-xs text-[#e3e2e6] hover:bg-[#2d2c30] rounded-xl transition-colors text-right cursor-pointer"
                  >
                    <Info className="w-4 h-4 text-[#ffb900]" />
                    <span className="font-medium">{appConfig.toolbar_info || "د چینل او سیسټم معلومات"}</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>
    </nav>
  );
};
