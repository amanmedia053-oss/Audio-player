import React from 'react';
import { ChannelInfo, AppConfig } from '../types';
import {
  Menu,
  Settings
} from 'lucide-react';
import { ActiveTab } from './NavigationBar';

interface ToolbarProps {
  channelInfo: ChannelInfo | null;
  activeTab?: ActiveTab;
  onChangeTab?: (tab: ActiveTab) => void;
  onOpenDrawer: () => void;
  onOpenSettings: () => void;
  loading?: boolean;
  appConfig: AppConfig;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  channelInfo,
  onOpenDrawer,
  onOpenSettings,
  loading,
  appConfig,
}) => {
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

        {/* Left Side (RTL End): Only Settings Button */}
        <div className="flex items-center">
          <button
            id="toolbar-settings-btn"
            onClick={onOpenSettings}
            className="p-2 bg-[#2d2c30] hover:bg-[#3d3c40] text-[#c7c6ca] hover:text-[#ffb900] rounded-xl transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5"
            title="تنظیمات (Settings)"
          >
            <Settings className="w-5 h-5 text-[#ffb900]" />
          </button>
        </div>

      </div>
    </nav>
  );
};

