import React from 'react';
import { motion } from 'motion/react';
import { ChannelInfo, AppConfig } from '../types';
import { getApiUrl } from '../utils';
import {
  Send,
  Mail,
  Facebook,
  Youtube,
  MessageSquare,
  Heart,
  Sparkles,
  BookOpen,
  Code,
  UserCheck,
  Feather
} from 'lucide-react';

interface AboutTabProps {
  channelInfo: ChannelInfo | null;
  appConfig: AppConfig;
}

export const AboutTab: React.FC<AboutTabProps> = ({ channelInfo, appConfig }) => {
  return (
    <motion.div
      id="about-tab-screen"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-xl mx-auto px-4 sm:px-6 pb-24 text-right space-y-6"
    >
      {/* 1. Creator Profile and Details Card with rectangular cover image */}
      <div className="bg-[#1c1b1f] border border-[#2d2c30] rounded-[24px] overflow-hidden shadow-2xl relative">
        {/* Background ambient lighting */}
        <div className="absolute top-20 -left-10 w-40 h-40 bg-[#ffb900]/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Cover Photo: Rectangular with sharp/clean top corners */}
        <div className="relative aspect-[21/9] w-full overflow-hidden border-b border-[#2d2c30]">
          <img
            src={(() => {
              const rawUrl = appConfig.about_cover_url || appConfig.scraped_images?.[1] || appConfig.scraped_images?.[0] || "https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=1000&q=80";
              if (rawUrl.includes('telegram') || rawUrl.includes('t.me') || rawUrl.includes('telegram-cdn')) {
                return getApiUrl(`/api/proxy-image?url=${encodeURIComponent(rawUrl)}`);
              }
              return rawUrl;
            })()}
            alt="کاور عکس"
            className="w-full h-full object-cover brightness-[0.7] contrast-[1.05]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-4 right-5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ffb900] animate-pulse" />
            <span className="text-[10px] font-bold text-[#ffb900] tracking-wide font-sans">
              {channelInfo?.name || "افغان بانډي کلتوري بهیر"}
            </span>
          </div>
        </div>

        {/* Creator Info and Overlapping Profile Avatar */}
        <div className="px-6 pb-6 pt-0 flex flex-col items-center text-center">
          
          {/* Creator Profile Photo */}
          <div className="relative -mt-12 sm:-mt-14 z-10 mb-3.5">
            <img
              id="creator-profile-avatar"
              src={(() => {
                const rawUrl = appConfig.creator_avatar_url || appConfig.scraped_images?.[2] || appConfig.scraped_images?.[0] || "https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&w=250&h=250&q=80";
                if (rawUrl.includes('telegram') || rawUrl.includes('t.me') || rawUrl.includes('telegram-cdn')) {
                  return getApiUrl(`/api/proxy-image?url=${encodeURIComponent(rawUrl)}`);
                }
                return rawUrl;
              })()}
              alt="د کاريال جوړونکي انځور"
              className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-full border-4 border-[#1c1b1f] hover:border-[#ffb900] transition-all duration-300 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            {/* Code Badge */}
            <div className="absolute bottom-0 right-0 bg-[#ffb900] text-black p-1.5 rounded-full shadow-lg border-2 border-[#1c1b1f]" title={appConfig.about_code_badge_tooltip || "کوډ جوړونکي"}>
              <Code className="w-4 h-4" />
            </div>
          </div>

          {/* Profile Creator Name */}
          <div className="space-y-1.5 select-text">
            <h2 id="creator-title-name" className="text-xl sm:text-2xl font-black text-[#ffb900] tracking-tight">
              {appConfig.about_creator_name}
            </h2>
            <p className="text-xs sm:text-sm text-[#e3e2e6] font-medium">{appConfig.about_creator_role}</p>
            <p className="text-[10px] text-[#8e8d91] font-mono">{appConfig.about_creator_sub}</p>
          </div>

          {/* Intro Text */}
          <div className="border-t border-[#2d2c30]/70 w-full mt-5 pt-4 text-right">
            <p className="text-xs sm:text-sm text-[#c7c6ca] leading-relaxed font-normal select-text">
              {appConfig.about_intro_text}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Arranger / Compiler Details Card */}
      <div className="bg-[#1c1b1f] border border-[#2d2c30] rounded-[24px] p-5 shadow-md space-y-3.5 text-right relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#2d2c30] pb-3">
          <span className="text-[10px] bg-[#ffb900]/15 text-[#ffb900] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
            <Feather className="w-3 h-3" />
            <span>تنظیم او تدوین</span>
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-[#e3e2e6] flex items-center gap-2">
            <span>{appConfig.about_arranger_title || "د خپرونو او مینځپانګې ترتیب کوونکی"}</span>
            <UserCheck className="w-4 h-4 text-[#ffb900]" />
          </h3>
        </div>

        <div className="flex items-start gap-3.5 pt-1">
          {appConfig.arranger_avatar_url ? (
            <img
              src={appConfig.arranger_avatar_url}
              alt="د ترتیب کوونکي انځور"
              className="w-12 h-12 rounded-full object-cover border-2 border-[#ffb900]/40 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#ffb900]/10 border border-[#ffb900]/30 text-[#ffb900] flex items-center justify-center shrink-0">
              <Feather className="w-6 h-6" />
            </div>
          )}

          <div className="space-y-1 text-right flex-1 select-text">
            <h4 className="text-sm sm:text-base font-black text-[#ffb900]">
              {appConfig.about_arranger_name || "ترتیب او تنظیم کوونکی"}
            </h4>
            <p className="text-xs text-[#e3e2e6] font-medium">
              {appConfig.about_arranger_role || "د غږیزو کتابونو او داستانونو د راټولولو او ترتیب مسؤل"}
            </p>
            {appConfig.about_arranger_sub && (
              <p className="text-[10px] text-[#8e8d91] font-mono">{appConfig.about_arranger_sub}</p>
            )}
            {appConfig.about_arranger_note && (
              <p className="text-xs text-[#c7c6ca] mt-2 leading-relaxed bg-[#2d2c30]/40 p-3 rounded-xl border border-[#2d2c30]/60">
                {appConfig.about_arranger_note}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Five Social Network Communication Links */}
      <div className="bg-[#1c1b1f] border border-[#2d2c30] rounded-[24px] p-5 shadow-md space-y-4 text-right">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-[#e3e2e6] flex items-center justify-end gap-2">
            <span>{appConfig.about_social_title || "رسمي اړیکې او ټولنیزې شبکې"}</span>
            <Heart className="w-4 h-4 text-[#ffb900]" />
          </h3>
          <p className="text-[10px] text-[#8e8d91] mt-1">{appConfig.about_social_desc || "زموږ د نوو خپرونو او ملاتړ لپاره په لاندې لارو اړیکه ونیسئ:"}</p>
        </div>

        {/* 5 Social Networks Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
          
          {/* 1. Telegram */}
          {appConfig.about_telegram_url && (
            <a
              id="social-link-telegram"
              href={appConfig.about_telegram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 bg-[#2d2c30]/40 hover:bg-[#ffb900]/15 border border-[#2d2c30]/60 hover:border-[#ffb900]/30 rounded-xl transition-all group"
              title={appConfig.about_telegram_label || "ټلیګرام"}
            >
              <Send className="w-4.5 h-4.5 text-[#ffb900] -rotate-45 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[9px] sm:text-[10px] font-bold text-[#c7c6ca] mt-1.5 group-hover:text-[#ffb900] transition-colors">{appConfig.about_telegram_label || "ټلیګرام"}</span>
            </a>
          )}

          {/* 2. WhatsApp */}
          {appConfig.about_whatsapp_url && (
            <a
              id="social-link-whatsapp"
              href={appConfig.about_whatsapp_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 bg-[#2d2c30]/40 hover:bg-[#25D366]/15 border border-[#2d2c30]/60 hover:border-[#25D366]/30 rounded-xl transition-all group"
              title={appConfig.about_whatsapp_label || "واټساپ"}
            >
              <MessageSquare className="w-4.5 h-4.5 text-[#25D366] group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[9px] sm:text-[10px] font-bold text-[#c7c6ca] mt-1.5 group-hover:text-[#25D366] transition-colors">{appConfig.about_whatsapp_label || "واټساپ"}</span>
            </a>
          )}

          {/* 3. Facebook */}
          {appConfig.about_facebook_url && (
            <a
              id="social-link-facebook"
              href={appConfig.about_facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 bg-[#2d2c30]/40 hover:bg-[#1877F2]/15 border border-[#2d2c30]/60 hover:border-[#1877F2]/30 rounded-xl transition-all group"
              title={appConfig.about_facebook_label || "فېسبوک"}
            >
              <Facebook className="w-4.5 h-4.5 text-[#1877F2] group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[9px] sm:text-[10px] font-bold text-[#c7c6ca] mt-1.5 group-hover:text-[#1877F2] transition-colors">{appConfig.about_facebook_label || "فېسبوک"}</span>
            </a>
          )}

          {/* 4. YouTube */}
          {appConfig.about_youtube_url && (
            <a
              id="social-link-youtube"
              href={appConfig.about_youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-2.5 bg-[#2d2c30]/40 hover:bg-[#FF0000]/15 border border-[#2d2c30]/60 hover:border-[#FF0000]/30 rounded-xl transition-all group"
              title={appConfig.about_youtube_label || "یوټیوب"}
            >
              <Youtube className="w-4.5 h-4.5 text-[#FF0000] group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[9px] sm:text-[10px] font-bold text-[#c7c6ca] mt-1.5 group-hover:text-[#FF0000] transition-colors">{appConfig.about_youtube_label || "یوټیوب"}</span>
            </a>
          )}

          {/* 5. Email */}
          {appConfig.about_email && (
            <a
              id="social-link-email"
              href={`mailto:${appConfig.about_email}`}
              className="flex flex-col items-center justify-center p-2.5 bg-[#2d2c30]/40 hover:bg-[#9c27b0]/15 border border-[#2d2c30]/60 hover:border-[#9c27b0]/30 rounded-xl transition-all group col-span-2 sm:col-span-1"
              title={appConfig.about_email_label || "برېښنالیک"}
            >
              <Mail className="w-4.5 h-4.5 text-[#9c27b0] group-hover:scale-110 transition-transform duration-200" />
              <span className="text-[9px] sm:text-[10px] font-bold text-[#c7c6ca] mt-1.5 group-hover:text-[#9c27b0] transition-colors">{appConfig.about_email_label || "برېښنالیک"}</span>
            </a>
          )}

        </div>
      </div>

      {/* 3. Simple Audio Quality Section */}
      <div className="bg-[#1c1b1f] border border-[#2d2c30] rounded-[24px] p-5 shadow-md space-y-3.5">
        <h3 className="text-xs sm:text-sm font-bold text-[#8e8d91] flex items-center justify-end gap-2 border-b border-[#2d2c30] pb-2">
          <span>{appConfig.about_lib_title}</span>
          <BookOpen className="w-4.5 h-4.5 text-[#ffb900]" />
        </h3>

        <div className="text-[11px] sm:text-xs text-[#8e8d91] space-y-2 leading-relaxed">
          {appConfig.about_lib_points.map((pt, i) => (
            <p key={i}>{pt}</p>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

