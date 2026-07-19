import React from 'react';
import { Home, History, Info, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { AppConfig } from '../types';

export type ActiveTab = 'home' | 'history' | 'about' | 'favorites';

interface NavigationBarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  historyCount: number;
  favoritesCount: number;
  appConfig: AppConfig;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onChangeTab,
  historyCount,
  favoritesCount,
  appConfig,
}) => {
  const tabs = [
    {
      id: 'home' as ActiveTab,
      label: appConfig.tab_home,
      icon: Home,
    },
    {
      id: 'favorites' as ActiveTab,
      label: appConfig.tab_favorites,
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : undefined,
      badgeClass: 'bg-red-500 text-white border border-red-500/20',
    },
    {
      id: 'history' as ActiveTab,
      label: appConfig.tab_history,
      icon: History,
      badge: historyCount > 0 ? historyCount : undefined,
      badgeClass: 'bg-[#ffb900] text-black',
    },
    {
      id: 'about' as ActiveTab,
      label: appConfig.tab_about,
      icon: Info,
    },
  ];


  return (
    <div
      id="bottom-navigation-container"
      className="fixed bottom-0 right-0 left-0 bg-[#1c1b1f]/95 backdrop-blur-md border-t border-[#2d2c30] z-30 shadow-2xl transition-all duration-300"
    >
      <div className="max-w-md mx-auto px-6 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className="flex flex-col items-center gap-1 py-1 px-3 relative focus:outline-none select-none group min-w-16 cursor-pointer"
            >
              {/* Material 3 Highlight Pill behind Icon */}
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-[#ffb900]/15 border border-[#ffb900]/25 rounded-2xl -mx-3 -my-1 shadow-inner"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                
                <IconComponent
                  className={`w-5.5 h-5.5 transition-transform duration-200 group-hover:scale-105 ${
                    isActive ? 'text-[#ffb900]' : 'text-[#c7c6ca]'
                  }`}
                />

                {/* Badge Indicator for history/active items */}
                {tab.badge !== undefined && (
                  <span className={`absolute -top-1.5 -left-2 text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce ${tab.badgeClass || 'bg-[#ffb900] text-black'}`}>
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] font-bold mt-1.5 transition-colors duration-150 ${
                  isActive ? 'text-[#ffb900]' : 'text-[#8e8d91]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
