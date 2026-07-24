import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Palette,
  Sun,
  Moon,
  Monitor,
  Bell,
  BellOff,
  Volume2,
  Trash2,
  RotateCcw,
  Check,
  Zap,
  Sliders,
  Sparkles,
  Info,
  Clock,
  Play
} from 'lucide-react';

export interface AppSettings {
  themeColor: string; // hex color e.g. '#ffb900'
  themeMode: 'dark' | 'light' | 'system';
  notificationsEnabled: boolean;
  autoplayNext: boolean;
  defaultSpeed: number;
  sleepTimerMinutes: number; // 0 = off
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeColor: '#ffb900',
  themeMode: 'dark',
  notificationsEnabled: true,
  autoplayNext: true,
  defaultSpeed: 1.0,
  sleepTimerMinutes: 0,
};

export const COLOR_OPTIONS = [
  { id: 'gold', name: 'ژېړ زري (Amber)', hex: '#ffb900', bgClass: 'bg-[#ffb900]' },
  { id: 'emerald', name: 'زمردي شین (Emerald)', hex: '#10b981', bgClass: 'bg-[#10b981]' },
  { id: 'cyan', name: 'آسماني آبي (Cyan)', hex: '#06b6d4', bgClass: 'bg-[#06b6d4]' },
  { id: 'blue', name: 'شاهي آبي (Royal Blue)', hex: '#3b82f6', bgClass: 'bg-[#3b82f6]' },
  { id: 'purple', name: 'ارغواني بنفش (Purple)', hex: '#a855f7', bgClass: 'bg-[#a855f7]' },
  { id: 'rose', name: 'یاقوتي سور (Rose)', hex: '#f43f5e', bgClass: 'bg-[#f43f5e]' },
  { id: 'orange', name: 'نارنجي (Orange)', hex: '#f97316', bgClass: 'bg-[#f97316]' },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearCache: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearCache,
}) => {
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);
  const [notifPermission, setNotifPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, [isOpen]);

  const requestNotifPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
        if (perm === 'granted') {
          onUpdateSettings({ notificationsEnabled: true });
          showNotice('د خبرتیاوو اجازه ترلاسه شوه!');
        } else {
          onUpdateSettings({ notificationsEnabled: false });
          showNotice('د خبرتیاوو اجازه رد شوه.');
        }
      } catch (e) {
        console.warn('Error requesting notifications:', e);
      }
    }
  };

  const showNotice = (msg: string) => {
    setCopiedNotice(msg);
    setTimeout(() => setCopiedNotice(null), 2500);
  };

  const handleClearCacheClick = () => {
    onClearCache();
    showNotice('د حافظې ذخیره په بریا پاکه شوه!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            id="settings-modal-dialog"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl z-10 text-right overflow-hidden max-h-[90vh] flex flex-col bg-[#1c1b1f] text-[#e3e2e6] border border-[#2d2c30]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2d2c30] shrink-0">
              <div className="flex items-center gap-2.5">
                <div
                  className="p-2.5 rounded-2xl text-black font-bold shadow-md"
                  style={{ backgroundColor: settings.themeColor }}
                >
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight text-white">
                    د غوښتنلیک تنظیمات (Settings)
                  </h3>
                  <p className="text-xs text-[#8e8d91]">
                    خپل لید او د اورېدلو کیفیت ستاسو د خوښې سره سم کړئ
                  </p>
                </div>
              </div>

              <button
                id="close-settings-btn"
                onClick={onClose}
                className="p-2 rounded-xl transition-colors hover:bg-[#2d2c30] text-[#c7c6ca] hover:text-white cursor-pointer"
                title="تړل"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="py-4 space-y-6 overflow-y-auto flex-grow px-1 custom-scrollbar">

              {/* Notice Toast Banner */}
              {copiedNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between"
                >
                  <span>{copiedNotice}</span>
                  <Check className="w-4 h-4" />
                </motion.div>
              )}

              {/* 1. App Accent Theme Color Picker */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold text-[#c7c6ca] flex items-center gap-2">
                  <Palette className="w-4 h-4" style={{ color: settings.themeColor }} />
                  <span>د ایپلیکیشن بڼه او د پلي کیدو رنګ (Theme Color)</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {COLOR_OPTIONS.map((c) => {
                    const isSelected = settings.themeColor === c.hex;
                    return (
                      <button
                        key={c.id}
                        onClick={() => onUpdateSettings({ themeColor: c.hex })}
                        className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#2d2c30] text-white shadow-md border-2'
                            : 'bg-[#252428] text-[#c7c6ca] border-[#2d2c30] hover:bg-[#2e2d33] hover:text-white'
                        }`}
                        style={{ borderColor: isSelected ? c.hex : undefined }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full shadow-inner inline-block shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="truncate text-[11px]">{c.name.split(' ')[0]}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: c.hex }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Notification Settings */}
              <div className="space-y-3 pt-2 border-t border-[#2d2c30]">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-xs font-extrabold text-[#c7c6ca] flex items-center gap-2">
                      <Bell className="w-4 h-4" style={{ color: settings.themeColor }} />
                      <span>د پلیر اګاهي او نوټیفیکیشن (Player Notification)</span>
                    </label>
                    <p className="text-[11px] text-[#8e8d91]">
                      کله چې بل ایپ ته واوړئ د نوټیفیکیشن د لارې کنټرول ښودل
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (notifPermission !== 'granted' && !settings.notificationsEnabled) {
                        requestNotifPermission();
                      } else {
                        onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled });
                      }
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                      settings.notificationsEnabled ? '' : 'bg-[#3a393e]'
                    }`}
                    style={{
                      backgroundColor: settings.notificationsEnabled ? settings.themeColor : undefined,
                    }}
                  >
                    <div
                      className={`w-5 h-5 bg-black rounded-full absolute top-0.5 transition-transform shadow-md ${
                        settings.notificationsEnabled ? 'right-6' : 'right-0.5'
                      }`}
                    />
                  </button>
                </div>

                {notifPermission === 'denied' && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
                    <Info className="w-4 h-4 shrink-0" />
                    <span>ستاسو په براوزر کې د نوټیفیکیشن اجازه بنده ده. په سیټینګ کې اجازه ورکړئ.</span>
                  </div>
                )}
              </div>

              {/* 4. Playback Options */}
              <div className="space-y-3 pt-2 border-t border-[#2d2c30]">
                <label className="text-xs font-extrabold text-[#c7c6ca] flex items-center gap-2">
                  <Volume2 className="w-4 h-4" style={{ color: settings.themeColor }} />
                  <span>د خپرولو او غږیز ترتیبات (Audio Playback)</span>
                </label>

                {/* Autoplay Next */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#252428] border border-[#2d2c30]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#e3e2e6] block">
                      د بل فصل اتوماتیک د خپرولو پرانیستل
                    </span>
                    <span className="text-[10px] text-[#8e8d91] block">
                      د اوسني فصل له پای ته رسېدو وروسته بل فصل په خپله پلي کېږي
                    </span>
                  </div>

                  <button
                    onClick={() => onUpdateSettings({ autoplayNext: !settings.autoplayNext })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      settings.autoplayNext ? '' : 'bg-[#3a393e]'
                    }`}
                    style={{
                      backgroundColor: settings.autoplayNext ? settings.themeColor : undefined,
                    }}
                  >
                    <div
                      className={`w-5 h-5 bg-black rounded-full absolute top-0.5 transition-transform shadow-md ${
                        settings.autoplayNext ? 'right-5' : 'right-0.5'
                      }`}
                    />
                  </button>
                </div>

                {/* Default Playback Speed Selection */}
                <div className="p-3 rounded-2xl bg-[#252428] border border-[#2d2c30] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#e3e2e6]">
                      د غږ د خپرولو اصلي سرعت (Playback Speed)
                    </span>
                    <span className="text-xs font-extrabold" style={{ color: settings.themeColor }}>
                      {settings.defaultSpeed}x
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    {[1.0, 1.25, 1.5, 1.75, 2.0].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => onUpdateSettings({ defaultSpeed: spd })}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          settings.defaultSpeed === spd
                            ? 'text-black shadow-sm font-extrabold'
                            : 'border-[#38373c] bg-[#1c1b1f] text-[#c7c6ca] hover:bg-[#2d2c30] hover:text-white'
                        }`}
                        style={
                          settings.defaultSpeed === spd
                            ? { backgroundColor: settings.themeColor, borderColor: settings.themeColor }
                            : undefined
                        }
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sleep Timer Selection */}
                <div className="p-3 rounded-2xl bg-[#252428] border border-[#2d2c30] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#e3e2e6] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" style={{ color: settings.themeColor }} />
                      <span>د خوب مهال ویش (Sleep Timer)</span>
                    </span>
                    <span className="text-xs font-extrabold text-[#8e8d91]">
                      {settings.sleepTimerMinutes === 0 ? 'بند (Off)' : `${settings.sleepTimerMinutes} دقیقې`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    {[0, 15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => onUpdateSettings({ sleepTimerMinutes: mins })}
                        className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                          settings.sleepTimerMinutes === mins
                            ? 'text-black shadow-sm font-extrabold'
                            : 'border-[#38373c] bg-[#1c1b1f] text-[#c7c6ca] hover:bg-[#2d2c30] hover:text-white'
                        }`}
                        style={
                          settings.sleepTimerMinutes === mins
                            ? { backgroundColor: settings.themeColor, borderColor: settings.themeColor }
                            : undefined
                        }
                      >
                        {mins === 0 ? 'بند' : `${mins} دقیقې`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Clear Cache & Storage */}
              <div className="space-y-3 pt-2 border-t border-[#2d2c30]">
                <label className="text-xs font-extrabold text-[#c7c6ca] flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>معلومات او ذخیره (Data & Memory)</span>
                </label>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#252428] border border-[#2d2c30]">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#e3e2e6] block">
                      د لنډمهاله فايلونو پاکول (Clear Cache)
                    </span>
                    <span className="text-[10px] text-[#8e8d91] block">
                      په ذخیره کې ساتل شوي زاړه فصلونه بیا نوي کول
                    </span>
                  </div>

                  <button
                    onClick={handleClearCacheClick}
                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>پاکول</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#2d2c30] flex items-center justify-between shrink-0">
              <span className="text-[10px] font-semibold text-[#8e8d91]">
                نسخه 2.5.0 • افغان بانډي
              </span>
              <button
                id="save-and-close-settings-btn"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl text-xs font-extrabold text-black transition-all shadow-md active:scale-95 cursor-pointer"
                style={{ backgroundColor: settings.themeColor }}
              >
                کړه او وسپاره (Save)
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
